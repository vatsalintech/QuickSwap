package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

// NewRedisClient creates a new Redis client using the REDIS_URL environment variable.
// If REDIS_URL is not set, it defaults to localhost:6379.
func NewRedisClient(ctx context.Context) (*redis.Client, error) {
	addr := os.Getenv("REDIS_URL")
	if addr == "" {
		// Default to localhost if not set
		addr = "localhost:6379"
		log.Println("REDIS_URL not set, defaulting to localhost:6379")
	}

	var opt *redis.Options
	var err error

	// Try to parse as URL first, then fall back to simple address
	if opt, err = redis.ParseURL(addr); err != nil {
		opt = &redis.Options{
			Addr: addr,
		}
	}

	client := redis.NewClient(opt)

	// Verify connection
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("unable to connect to Redis at %s: %v", addr, err)
	}

	log.Printf("Successfully connected to Redis at %s", addr)
	return client, nil
}

// EnsureAuctionCached fetches auction data from Postgres if missing in Redis.
// It uses a Redis Pipeline to set both price and end_time atomically in the cache.
func EnsureAuctionCached(ctx context.Context, rdb *redis.Client, pg *pgxpool.Pool, auctionID string) error {
	priceKey := fmt.Sprintf("auction:%s:price", auctionID)

	// Step 1: Check if already cached
	_, err := rdb.Get(ctx, priceKey).Result()
	if err == nil {
		return nil // Cache hit! Fast path.
	} else if err != redis.Nil {
		return fmt.Errorf("redis error checking cache: %w", err)
	}

	// Step 2: Cache miss, fetch starting state from Postgres 
	var startPrice float64
	var endTime time.Time
	
	query := "SELECT start_price, end_time FROM auctions WHERE id = $1"
	err = pg.QueryRow(ctx, query, auctionID).Scan(&startPrice, &endTime)
	if err != nil {
		return fmt.Errorf("failed to fetch auction from db: %w", err)
	}

	// Step 3: Save to Redis using a pipeline to guarantee both keys are written together
	pipe := rdb.Pipeline()
	pipe.Set(ctx, priceKey, startPrice, 0)
	pipe.Set(ctx, fmt.Sprintf("auction:%s:end_time", auctionID), endTime.Unix(), 0)
	
	_, err = pipe.Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to cache auction in redis: %w", err)
	}

	return nil
}

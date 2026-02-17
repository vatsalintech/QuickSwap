package db

import (
	"context"
	"fmt"
	"log"
	"os"

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

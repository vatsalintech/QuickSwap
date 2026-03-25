package handlers

import (
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/quickswap/quickswap/internal/auth"
	"github.com/redis/go-redis/v9"
)

// NewRouter returns an http.Handler with auth routes registered.
func NewRouter(c *auth.Client, pg *pgxpool.Pool, rdb *redis.Client) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/auth/login", loginHandler(c))
	mux.HandleFunc("/api/auth/signup", signupHandler(c))
	mux.HandleFunc("/api/auth/logout", logoutHandler(c))
	mux.HandleFunc("/api/auth/me", meHandler(c))
	mux.HandleFunc("/api/profile", profileHandler(c))

	// Register listing route
	mux.HandleFunc("/api/createlisting", createListingHandler(c))
	mux.HandleFunc("/api/mylistings", myListingHandler(c))
	mux.HandleFunc("/api/listing", singleListingHandler(c))

	// Register bids Api
	mux.HandleFunc("/api/mybids", myBidsHandler(c))
	mux.HandleFunc("/api/toplistings", topListingsHandler(c))

	return mux
}

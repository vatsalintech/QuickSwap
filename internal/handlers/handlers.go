package handlers

import (
	"net/http"

	"github.com/quickswap/quickswap/internal/auth"
)

// NewRouter returns an http.Handler with all routes registered.
func NewRouter(c *auth.Client) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/auth/login", loginHandler(c))
	mux.HandleFunc("/api/auth/signup", signupHandler(c))
	mux.HandleFunc("/api/auth/logout", logoutHandler(c))
	mux.HandleFunc("/api/auth/me", meHandler(c))
	mux.HandleFunc("/api/profile", profileHandler(c))

	// Register listing route
mux.HandleFunc("/api/createlisting", createListingHandler(c))

	return mux
}

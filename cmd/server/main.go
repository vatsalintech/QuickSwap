package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/quickswap/quickswap/internal/auth"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Note: .env file not found, using env vars")
	}

	url := os.Getenv("SUPABASE_URL")
	key := os.Getenv("SUPABASE_ANON_KEY")
	if url == "" || key == "" {
		log.Fatal("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
	}

	authClient := auth.NewClient(url, key)

	// Static files (login page)
	fs := http.FileServer(http.Dir("web"))
	http.Handle("/", fs)

	// API routes
	http.HandleFunc("/api/auth/login", loginHandler(authClient))
	http.HandleFunc("/api/auth/signup", signupHandler(authClient))
	http.HandleFunc("/api/auth/logout", logoutHandler(authClient))
	http.HandleFunc("/api/auth/me", meHandler(authClient))

	addr := ":8080"
	log.Printf("QuickSwap auth server listening on %s", addr)
	if err := http.ListenAndServe(addr, corsMiddleware(http.DefaultServeMux)); err != nil {
		log.Fatal(err)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func loginHandler(c *auth.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondError(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if req.Email == "" || req.Password == "" {
			respondError(w, "Email and password required", http.StatusBadRequest)
			return
		}

		session, err := c.Login(req.Email, req.Password)
		if err != nil {
			respondError(w, err.Error(), http.StatusUnauthorized)
			return
		}

		respondJSON(w, map[string]interface{}{
			"access_token":  session.AccessToken,
			"refresh_token": session.RefreshToken,
			"expires_in":    session.ExpiresIn,
			"user":          session.User,
		})
	}
}

func signupHandler(c *auth.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondError(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if req.Email == "" || req.Password == "" {
			respondError(w, "Email and password required", http.StatusBadRequest)
			return
		}

		if len(req.Password) < 6 {
			respondError(w, "Password must be at least 6 characters", http.StatusBadRequest)
			return
		}

		session, err := c.Signup(req.Email, req.Password)
		if err != nil {
			respondError(w, err.Error(), http.StatusBadRequest)
			return
		}

		resp := map[string]interface{}{"user": session.User}
		if session.AccessToken != "" {
			resp["access_token"] = session.AccessToken
			resp["refresh_token"] = session.RefreshToken
			resp["expires_in"] = session.ExpiresIn
		} else {
			resp["message"] = "Check your email to confirm your account"
		}

		respondJSON(w, resp)
	}
}

func logoutHandler(c *auth.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		token := r.Header.Get("Authorization")
		if len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
		}
		if token == "" {
			respondError(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		if err := c.Logout(token); err != nil {
			respondError(w, err.Error(), http.StatusInternalServerError)
			return
		}

		respondJSON(w, map[string]string{"message": "Logged out"})
	}
}

func meHandler(c *auth.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		token := r.Header.Get("Authorization")
		if len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
		}
		if token == "" {
			respondError(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Validate token by calling Supabase user endpoint
		req, _ := http.NewRequest("GET", os.Getenv("SUPABASE_URL")+"/auth/v1/user", nil)
		req.Header.Set("apikey", os.Getenv("SUPABASE_ANON_KEY"))
		req.Header.Set("Authorization", "Bearer "+token)

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			respondError(w, "Failed to get user", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			respondError(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		var userResp struct {
			ID    string `json:"id"`
			Email string `json:"email"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&userResp); err != nil {
			respondError(w, "Invalid response", http.StatusInternalServerError)
			return
		}

		respondJSON(w, userResp)
	}
}

func respondJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

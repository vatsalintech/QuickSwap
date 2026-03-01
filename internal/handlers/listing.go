package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	listing "github.com/quickswap/quickswap/internal/bids"
)

func CreateListingHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract and validate token
	token := r.Header.Get("Authorization")
	if len(token) > 7 && token[:7] == "Bearer " {
		token = token[7:]
	}
	if token == "" {
		respondError(w, "Authorization header required", http.StatusUnauthorized)
		return
	}

	// Validate token by calling Supabase user endpoint
	reqUser, _ := http.NewRequest("GET", os.Getenv("SUPABASE_URL")+"/auth/v1/user", nil)
	reqUser.Header.Set("apikey", os.Getenv("SUPABASE_ANON_KEY"))
	reqUser.Header.Set("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(reqUser)
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
		ID string `json:"id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&userResp); err != nil {
		respondError(w, "Invalid response from auth", http.StatusInternalServerError)
		return
	}

	// Parse and validate request body
	var req struct {
		Title          string   `json:"title"`
		Description    string   `json:"description"`
		Category       string   `json:"category"`
		Images         []string `json:"images"`
		StartingBid    float64  `json:"starting_bid"`
		BuyNowPrice    *float64 `json:"buy_now_price,omitempty"`
		AuctionEndTime string   `json:"auction_end_time"`
		Location       string   `json:"location"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.Title == "" || req.Description == "" || req.Category == "" || len(req.Images) == 0 || req.StartingBid == 0 || req.AuctionEndTime == "" || req.Location == "" {
		respondError(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	auctionEnd, err := time.Parse(time.RFC3339, req.AuctionEndTime)
	if err != nil {
		respondError(w, "Invalid auction_end_time format (must be RFC3339)", http.StatusBadRequest)
		return
	}

	l := &listing.Listing{
		Title:          req.Title,
		Description:    req.Description,
		Category:       req.Category,
		Images:         req.Images,
		StartingBid:    req.StartingBid,
		BuyNowPrice:    req.BuyNowPrice,
		AuctionEndTime: auctionEnd,
		Location:       req.Location,
		SellerID:       userResp.ID, // Use ID from token
	}

	id, err := listing.CreateListing(l)
	if err != nil {
		respondError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, map[string]interface{}{
		"listing_id": id,
		"status":     "success",
		"message":    "Listing created successfully.",
	})
}

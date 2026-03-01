package listing

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type Listing struct {
	ID             string    `json:"id,omitempty"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	Category       string    `json:"category"`
	Images         []string  `json:"images"`
	StartingBid    float64   `json:"starting_bid"`
	BuyNowPrice    *float64  `json:"buy_now_price,omitempty"`
	AuctionEndTime time.Time `json:"auction_end_time"`
	Location       string    `json:"location"`
	SellerID       string    `json:"seller_id"`
}

// CreateListing inserts a new listing into the Supabase listings table.
func CreateListing(listing *Listing) (string, error) {
	supaURL := os.Getenv("SUPABASE_URL")
	apiKey := os.Getenv("SUPABASE_SERVICE_KEY")
	if apiKey == "" {
		apiKey = os.Getenv("SUPABASE_ANON_KEY")
	}
	if supaURL == "" || apiKey == "" {
		return "", fmt.Errorf("Supabase env vars not set")
	}

	url := supaURL + "/rest/v1/listings"
	payload := []Listing{*listing}
	b, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewReader(b))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", apiKey)
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Prefer", "return=representation")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("supabase insert failed: status=%d", resp.StatusCode)
	}

	var inserted []Listing
	if err := json.NewDecoder(resp.Body).Decode(&inserted); err != nil {
		return "", err
	}
	if len(inserted) == 0 || inserted[0].ID == "" {
		return "", fmt.Errorf("listing insert failed: no ID returned")
	}
	return inserted[0].ID, nil
}

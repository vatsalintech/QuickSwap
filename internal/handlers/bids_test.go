package handlers

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"github.com/quickswap/quickswap/internal/auth"
)

func setupBidsMockServer() *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/auth/v1/user":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"id": "user123", "email": "test@example.com"}`))
		case "/rest/v1/bids":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`[{"id": "bid1", "listing_id": "list1", "bid_amount": 50}]`))
		case "/rest/v1/listings":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`[{"id": "list1", "title": "Test Listing", "starting_bid": 10, "auction_end_time": "2050-01-01T00:00:00Z"}]`))
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))
}

func TestMyBidsHandler(t *testing.T) {
	ts := setupBidsMockServer()
	defer ts.Close()
	os.Setenv("SUPABASE_URL", ts.URL)
	os.Setenv("SUPABASE_ANON_KEY", "anon")

	c := auth.NewClient(ts.URL, "anon")
	handler := myBidsHandler(c)

	req1 := httptest.NewRequest("GET", "/api/mybids", nil)
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req1)
	if rr1.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized, got %d", rr1.Code)
	}

	req := httptest.NewRequest("GET", "/api/mybids", nil)
	req.Header.Set("Authorization", "Bearer validtoken")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}

func TestTopListingsHandler(t *testing.T) {
	ts := setupBidsMockServer()
	defer ts.Close()
	os.Setenv("SUPABASE_URL", ts.URL)

	c := auth.NewClient(ts.URL, "anon")
	handler := topListingsHandler(c)

	req := httptest.NewRequest("GET", "/api/toplistings", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}

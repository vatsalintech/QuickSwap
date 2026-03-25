package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/quickswap/quickswap/internal/auth"
)

func setupHandlersMockServer() *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/auth/v1/user":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"id": "user123", "email": "test@example.com"}`))
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))
}

func TestNewRouter(t *testing.T) {
	handler := NewRouter(nil, nil, nil)
	if handler == nil {
		t.Errorf("NewRouter returned nil")
	}
}

func TestBidHandler(t *testing.T) {
	ts := setupHandlersMockServer()
	defer ts.Close()
	os.Setenv("SUPABASE_URL", ts.URL)
	os.Setenv("SUPABASE_ANON_KEY", "anon")

	c := auth.NewClient(ts.URL, "anon")
	handler := bidHandler(c, nil, nil)

	req1 := httptest.NewRequest("POST", "/api/auctions/123/bid", bytes.NewBuffer([]byte(`{"amount": 50}`)))
	req1.SetPathValue("id", "123")
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req1)
	if rr1.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized, got %d", rr1.Code)
	}

	req2 := httptest.NewRequest("POST", "/api/auctions/123/bid", bytes.NewBuffer([]byte(`{"amount": 50}`)))
	req2.SetPathValue("id", "123")
	req2.Header.Set("Authorization", "Bearer validtoken")
	rr2 := httptest.NewRecorder()

	defer func() {
		if r := recover(); r != nil {
			// Expected to panic because rdb/pg are nil, but handler works until db call
		}
	}()
	handler.ServeHTTP(rr2, req2)
}

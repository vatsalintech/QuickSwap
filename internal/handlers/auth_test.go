package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"github.com/quickswap/quickswap/internal/auth"
)

func setupAuthMockServer() *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/auth/v1/token":
			// login
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"access_token": "mock_access_token",
				"user": map[string]string{"id": "user123", "email": "test@example.com"},
			})
		case "/auth/v1/signup":
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"access_token": "mock_access_token",
				"user": map[string]string{"id": "user123", "email": "test@example.com"},
			})
		case "/auth/v1/logout":
			w.WriteHeader(http.StatusNoContent)
		case "/rest/v1/profiles":
			w.WriteHeader(http.StatusOK)
			if r.Method == "GET" {
				w.Write([]byte(`[{"first_name": "Test", "last_name": "User"}]`))
			}
		case "/auth/v1/user":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"id": "user123", "email": "test@example.com"}`))
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))
}

func initTestClient(ts *httptest.Server) *auth.Client {
	os.Setenv("SUPABASE_URL", ts.URL)
	os.Setenv("SUPABASE_ANON_KEY", "anon")
	os.Setenv("SUPABASE_SERVICE_KEY", "service")
	return auth.NewClient(ts.URL, "anon")
}

func TestLoginHandler(t *testing.T) {
	ts := setupAuthMockServer()
	defer ts.Close()
	c := initTestClient(ts)
	handler := loginHandler(c)

	req1 := httptest.NewRequest("POST", "/api/auth/login", bytes.NewBuffer([]byte(`{"email": ""}`)))
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req1)
	if rr1.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request, got %d", rr1.Code)
	}

	body := []byte(`{"email": "test@test.com", "password": "password"}`)
	req := httptest.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}

func TestSignupHandler(t *testing.T) {
	ts := setupAuthMockServer()
	defer ts.Close()
	c := initTestClient(ts)
	handler := signupHandler(c)

	req1 := httptest.NewRequest("POST", "/api/auth/signup", bytes.NewBuffer([]byte(`{"email": ""}`)))
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req1)
	if rr1.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request, got %d", rr1.Code)
	}

	body := []byte(`{
		"first_name": "Test",
		"last_name": "User",
		"email": "test@test.com",
		"password": "password123",
		"mobile": "1234567890"
	}`)
	req := httptest.NewRequest("POST", "/api/auth/signup", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}

func TestLogoutHandler(t *testing.T) {
	ts := setupAuthMockServer()
	defer ts.Close()
	c := initTestClient(ts)
	handler := logoutHandler(c)

	req1 := httptest.NewRequest("POST", "/api/auth/logout", nil)
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req1)
	if rr1.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized, got %d", rr1.Code)
	}

	req := httptest.NewRequest("POST", "/api/auth/logout", nil)
	req.Header.Set("Authorization", "Bearer validtoken")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}

func TestMeHandler(t *testing.T) {
	ts := setupAuthMockServer()
	defer ts.Close()
	c := initTestClient(ts)
	handler := meHandler(c)

	req := httptest.NewRequest("GET", "/api/auth/me", nil)
	req.Header.Set("Authorization", "Bearer validtoken")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}

func TestProfileHandler(t *testing.T) {
	ts := setupAuthMockServer()
	defer ts.Close()
	c := initTestClient(ts)
	handler := profileHandler(c)

	req := httptest.NewRequest("GET", "/api/profile", nil)
	req.Header.Set("Authorization", "Bearer validtoken")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}

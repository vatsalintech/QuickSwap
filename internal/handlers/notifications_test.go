package handlers

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func setupNotificationsMockServer() *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.URL.Path == "/auth/v1/user" {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"id": "user123", "email": "test@example.com"}`))
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}))
}

func initNotificationsTestEnv(ts *httptest.Server) {
	os.Setenv("SUPABASE_URL", ts.URL)
	os.Setenv("SUPABASE_ANON_KEY", "anon")
}

// ---- getNotificationsHandler ----

func TestGetNotificationsHandler_MethodNotAllowed(t *testing.T) {
	handler := getNotificationsHandler(nil)
	req := httptest.NewRequest("POST", "/api/notifications", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected 405, got %d", rr.Code)
	}
}

func TestGetNotificationsHandler_NoToken(t *testing.T) {
	handler := getNotificationsHandler(nil)
	req := httptest.NewRequest("GET", "/api/notifications", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401, got %d", rr.Code)
	}
}

// ---- getNotificationCountHandler ----

func TestGetNotificationCountHandler_MethodNotAllowed(t *testing.T) {
	handler := getNotificationCountHandler(nil)
	req := httptest.NewRequest("POST", "/api/notifications/count", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected 405, got %d", rr.Code)
	}
}

func TestGetNotificationCountHandler_NoToken(t *testing.T) {
	handler := getNotificationCountHandler(nil)
	req := httptest.NewRequest("GET", "/api/notifications/count", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401, got %d", rr.Code)
	}
}

// ---- markNotificationReadHandler ----

func TestMarkNotificationReadHandler_MethodNotAllowed(t *testing.T) {
	handler := markNotificationReadHandler(nil)
	req := httptest.NewRequest("GET", "/api/notifications/notif1/read", nil)
	req.SetPathValue("id", "notif1")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected 405, got %d", rr.Code)
	}
}

func TestMarkNotificationReadHandler_NoToken(t *testing.T) {
	handler := markNotificationReadHandler(nil)
	req := httptest.NewRequest("PUT", "/api/notifications/notif1/read", nil)
	req.SetPathValue("id", "notif1")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401, got %d", rr.Code)
	}
}

func TestMarkNotificationReadHandler_NoID(t *testing.T) {
	ts := setupNotificationsMockServer()
	defer ts.Close()
	initNotificationsTestEnv(ts)

	handler := markNotificationReadHandler(nil)
	req := httptest.NewRequest("PUT", "/api/notifications//read", nil)
	req.Header.Set("Authorization", "Bearer validtoken")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for missing notification ID, got %d", rr.Code)
	}
}

// ---- markAllNotificationsReadHandler ----

func TestMarkAllNotificationsReadHandler_MethodNotAllowed(t *testing.T) {
	handler := markAllNotificationsReadHandler(nil)
	req := httptest.NewRequest("GET", "/api/notifications/read-all", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected 405, got %d", rr.Code)
	}
}

func TestMarkAllNotificationsReadHandler_NoToken(t *testing.T) {
	handler := markAllNotificationsReadHandler(nil)
	req := httptest.NewRequest("PUT", "/api/notifications/read-all", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401, got %d", rr.Code)
	}
}

// ---- deleteNotificationHandler ----

func TestDeleteNotificationHandler_MethodNotAllowed(t *testing.T) {
	handler := deleteNotificationHandler(nil)
	req := httptest.NewRequest("GET", "/api/notifications/notif1", nil)
	req.SetPathValue("id", "notif1")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected 405, got %d", rr.Code)
	}
}

func TestDeleteNotificationHandler_NoToken(t *testing.T) {
	handler := deleteNotificationHandler(nil)
	req := httptest.NewRequest("DELETE", "/api/notifications/notif1", nil)
	req.SetPathValue("id", "notif1")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401, got %d", rr.Code)
	}
}

func TestDeleteNotificationHandler_NoID(t *testing.T) {
	ts := setupNotificationsMockServer()
	defer ts.Close()
	initNotificationsTestEnv(ts)

	handler := deleteNotificationHandler(nil)
	req := httptest.NewRequest("DELETE", "/api/notifications/", nil)
	req.Header.Set("Authorization", "Bearer validtoken")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for missing notification ID, got %d", rr.Code)
	}
}

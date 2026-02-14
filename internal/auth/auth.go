package auth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// Client handles Supabase authentication.
type Client struct {
	URL string
	Key string
}

// NewClient creates a new Supabase Auth client.
func NewClient(url, key string) *Client {
	return &Client{URL: url, Key: key}
}

// LoginRequest is the request body for login.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SignupRequest is the request body for signup.
type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Session holds the auth session data.
type Session struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	User         User   `json:"user"`
}

// User represents the authenticated user.
type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// AuthResponse is the generic auth API response.
type AuthResponse struct {
	Session *Session `json:"session,omitempty"`
	User    *User    `json:"user,omitempty"`
	Error   string   `json:"error,omitempty"`
	Msg     string   `json:"msg,omitempty"`
}

// Login authenticates a user with email and password.
func (c *Client) Login(email, password string) (*Session, error) {
	body, err := json.Marshal(LoginRequest{Email: email, Password: password})
	if err != nil {
		return nil, fmt.Errorf("marshal login request: %w", err)
	}

	req, err := http.NewRequest("POST", c.URL+"/auth/v1/token?grant_type=password", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", c.Key)
	req.Header.Set("Authorization", "Bearer "+c.Key)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("login request: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	var authResp AuthResponse
	if err := json.Unmarshal(respBody, &authResp); err != nil {
		return nil, fmt.Errorf("parse response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		errMsg := authResp.Error
		if authResp.Msg != "" {
			errMsg = authResp.Msg
		}
		if errMsg == "" {
			errMsg = string(respBody)
		}
		return nil, fmt.Errorf("login failed: %s", errMsg)
	}

	if authResp.Session == nil {
		return nil, fmt.Errorf("no session in response")
	}

	return authResp.Session, nil
}

// Signup registers a new user with email and password.
func (c *Client) Signup(email, password string) (*Session, error) {
	body, err := json.Marshal(SignupRequest{Email: email, Password: password})
	if err != nil {
		return nil, fmt.Errorf("marshal signup request: %w", err)
	}

	req, err := http.NewRequest("POST", c.URL+"/auth/v1/signup", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", c.Key)
	req.Header.Set("Authorization", "Bearer "+c.Key)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("signup request: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	var authResp AuthResponse
	if err := json.Unmarshal(respBody, &authResp); err != nil {
		return nil, fmt.Errorf("parse response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		errMsg := authResp.Error
		if authResp.Msg != "" {
			errMsg = authResp.Msg
		}
		if errMsg == "" {
			errMsg = string(respBody)
		}
		return nil, fmt.Errorf("signup failed: %s", errMsg)
	}

	// Signup may return session (if email confirm disabled) or just user
	if authResp.Session != nil {
		return authResp.Session, nil
	}
	if authResp.User != nil {
		// Email confirmation required - no session yet
		return &Session{User: *authResp.User}, nil
	}

	return nil, fmt.Errorf("unexpected signup response")
}

// Logout revokes the refresh token.
func (c *Client) Logout(accessToken string) error {
	req, err := http.NewRequest("POST", c.URL+"/auth/v1/logout", nil)
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("apikey", c.Key)
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("logout request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("logout failed: %s", string(body))
	}

	return nil
}

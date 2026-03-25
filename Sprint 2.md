# QuickSwap Backend API Documentation - Sprint 2

This document provides detailed information about the RESTful API endpoints required to interact with the QuickSwap backend. The backend is built using the Go standard library (`net/http`) and uses Supabase for authentication and database management, with Redis and PostgreSQL for performance and transactions.

---

## Authentication Endpoints

### 1. User Signup
- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Description**: Registers a new user.
- **Request Body** (JSON):
  ```json
  {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "password": "securepassword",
      "mobile": "1234567890"
  }
  ```
- **Responses**:
  - `200 OK`: 
    ```json
    {
      "session": {
        "access_token": "...",
        "refresh_token": "...",
        "expires_in": 3600,
        "user": { ... }
      }
    }
    ```
    *(Note: If email confirmation is required, it returns `{"user": {...}, "message": "Check your email..."}`)*
  - `400 Bad Request`: Validation failure (e.g., password < 6 chars) or signup error.

### 2. User Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Description**: Authenticates a user and returns a session.
- **Request Body** (JSON):
  ```json
  {
      "email": "john.doe@example.com",
      "password": "securepassword",
      "rememberMe": true
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "session": {
        "access_token": "...",
        "refresh_token": "...",
        "expires_in": 3600,
        "user": { ... }
      }
    }
    ```
  - `401 Unauthorized`: Invalid credentials.

### 3. User Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Auth Required**: Yes (`Bearer Token`)
- **Description**: Logs out the authenticated user.
- **Responses**:
  - `200 OK`: `{"message": "Logged out"}`
  - `401 Unauthorized`: Missing or invalid token.

### 4. Get Current User Identity (Me)
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes (`Bearer Token`)
- **Description**: Verifies the current session and retrieves basic user ID/Email.
- **Responses**:
  - `200 OK`: `{"id": "uuid", "email": "john@example.com"}`
  - `401 Unauthorized`: Invalid or expired session.

---

## User Profile Endpoints

### 5. Get User Profile
- **URL**: `/api/profile`
- **Method**: `GET`
- **Auth Required**: Yes (`Bearer Token`)
- **Description**: Retrieves the full profile of the logged-in user from the `profiles` table.
- **Responses**:
  - `200 OK`: Detailed JSON representing the user's profile info (first name, last name, mobile, etc.).
  - `404 Not Found`: Profile not found.
  - `401 Unauthorized`: Missing or invalid token.

---

## Listing & Auction Endpoints

### 6. Create Listing
- **URL**: `/api/createlisting`
- **Method**: `POST`
- **Auth Required**: Yes (`Bearer Token`)
- **Description**: Creates a new auction listing.
- **Request Body** (JSON):
  ```json
  {
      "title": "Vintage T-Shirt",
      "subtitle": "Excellent condition",
      "description": "A very nice vintage shirt.",
      "category": "Clothing",
      "subcategory": "Shirts",
      "condition": "Used",
      "brand": "Vintage",
      "color": "Red",
      "size": "L",
      "images": ["url1", "url2"],
      "starting_bid": 15.00,
      "buy_now_price": 50.00,
      "auction_start_time": "2024-03-25T15:00:00Z",
      "auction_end_time": "2024-04-01T15:00:00Z",
      "location": "New York, USA",
      "notes": "No returns"
  }
  ```
- **Responses**:
  - `200 OK`: `{"listing_id": "uuid", "status": "success", "message": "Listing created successfully."}`
  - `400 Bad Request`: Missing fields or invalid timestamp.

### 7. Get My Listings
- **URL**: `/api/mylistings`
- **Method**: `GET`
- **Auth Required**: Yes (`Bearer Token`)
- **Description**: Retrieves all listings created by the logged-in user.
- **Responses**:
  - `200 OK`: 
    ```json
    {
      "listings": [
        {
          "listing_id": "...",
          "title": "...",
          "image": "...",
          "current_bid": 15.00,
          "time_left": "2h 30m",
          "total_bids": 3,
          "status": "Active"
        }
      ]
    }
    ```

### 8. Get Top Listings (Home Page Feeds)
- **URL**: `/api/toplistings`
- **Method**: `GET`
- **Auth Required**: No
- **Description**: Retrieves listings categorized for homepage display (Trending, Ending Soon, Starting Soon). Max 5 items per category.
- **Responses**:
  - `200 OK`:
    ```json
    {
      "trending_now": [ ... ],
      "ending_soon": [ ... ],
      "starting_soon": [ ... ]
    }
    ```

---

## Bidding Endpoints

### 9. Get My Bids
- **URL**: `/api/mybids`
- **Method**: `GET`
- **Auth Required**: Yes (`Bearer Token`)
- **Description**: Retrieves a history of all bids placed by the logged-in user, including the current status of the auction.
- **Responses**:
  - `200 OK`:
    ```json
    {
      "bids": [
        {
          "id": "...",
          "listing_id": "...",
          "bid_amount": 25.0,
          "title": "Vintage T-Shirt",
          "image": "...",
          "current_bid": 30.0,
          "time_left": "Ended",
          "label": "Lost"
        }
      ]
    }
    ```

### 10. Place a Bid
- **URL**: `/api/auctions/{id}/bid`
- **Method**: `POST`
- **Auth Required**: Yes (`Bearer Token`)
- **Description**: Submits a bid for a given auction ID. Processed atomically via DB/Redis transactions.
- **URL Parameters**:
  - `id`: The UUID of the auction listing.
- **Request Body** (JSON):
  ```json
  {
      "amount": 40.00
  }
  ```
- **Responses**:
  - `200 OK`: `{"message": "Bid placed successfully"}`
  - `400 Bad Request`: Bid value is too low, auction ended, or invalid payload.
  - `404 Not Found`: Auction does not exist.

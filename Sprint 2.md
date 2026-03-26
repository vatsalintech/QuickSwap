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


========================================== FRONTEND ====================================

## Listing & Auction Flows

### 1. Create Listing Flow

**Component**: `start_selling.tsx`
- **Location**: `src/components/auction/start_selling.tsx`
- **Purpose**: Allow users to create new auction listings

**User Interactions**:
1. User navigates to "Start Selling" or "Create Listing"
2. Fills out comprehensive form:
   - Product info: title, subtitle, description
   - Category & details: category, subcategory, condition, brand, color, size
   - Pricing: starting_bid, buy_now_price
   - Timing: auction_start_time, auction_end_time
   - Location
   - Images (upload/URL)
   - Seller notes

**Form Validation**:
- title: required, max 100 chars
- description: required, min 10 chars, max 1000 chars
- starting_bid: required, > 0
- buy_now_price: required, > starting_bid
- auction_start_time: must be in future
- auction_end_time: must be after auction_start_time
- images: at least 1 image, max 5
- category & subcategory: from predefined list

**Flow**:
1. User fills out all form fields
2. Client-side validation
3. Submit to `/api/createlisting` with Bearer token
4. Show loading state during submission
5. On success (200 OK):
   - Display success message: "Listing created successfully"
   - Extract listing_id from response
   - Redirect to listing detail page or my listings page
   - Show confirmation with listing details
6. On failure (400 Bad Request):
   - Display validation error messages
   - Preserve form data (don't clear)
   - Allow user to correct and resubmit

**Image Handling**:
- Support image upload to cloud storage (implementation details TBD)
- Display image preview
- Allow drag-and-drop or file input
- Show upload progress
- Store URLs in images array for submission


### 2. Get My Listings Flow

**Component**: Dashboard / My Listings page
- **Location**: Could be integrated in `profile_page.tsx` or separate component
- **Purpose**: Display all listings created by current user

**Component State**:
```typescript
- listings: Listing[] 
- isLoading: boolean
- error: string | null
- sortBy: 'recent' | 'active' | 'ended'
- filterStatus: 'all' | 'active' | 'ended'
```


**Flow**:
1. On component mount, call `/api/mylistings` with Bearer token
2. On success (200 OK):
   - Display listings in grid or list view
   - Show current bid, time remaining, and bid count for each
   - Enable sorting (Recent, Active, Ended)
   - Enable filtering by status
3. On 401 Unauthorized:
   - Redirect to login
4. Show empty state if no listings

**UI Elements**:
- Listings grid with cards showing:
  - Product image
  - Title
  - Current bid amount
  - Time remaining (countdown or "Ended")
  - Number of bids
  - Status badge (Active, Ended, Not Started)
- Action buttons per listing (View, Edit, End Auction)
- "Create New Listing" button

---

### 3. Get Top Listings (Home Feed)

**Component**: `landing_page.tsx` and `loggedin_landing_page.tsx`
- **Location**: `src/components/landingPage/`
- **Purpose**: Display trending, ending soon, and starting soon listings on home page


**Flow**:
1. On component mount, call `/api/toplistings` (no auth required)
2. On success (200 OK):
   - Categorize listings into sections
   - Display max 5 items per category
3. Handle loading state with skeleton screens
4. On error, show retry button

**UI Sections**:
1. **Trending Now**: High-bid, actively bidded items
2. **Ending Soon**: Auctions closing within next few hours
3. **Starting Soon**: Upcoming auctions

**Display Per Section**:
- Carousel or grid layout with max 5 items
- Each item shows:
  - Product image
  - Title
  - Current bid
  - Time remaining / Starting time
  - Number of bids
- Click item to view details
- "View More" link to browse category (if available)

**Performance Optimization**:
- Cache home feed data with reasonable TTL (e.g., 5 minutes)
- Show cached data while refreshing in background
- Use pagination if more than 5 items per category

---

## Bidding Flows

### 4. Get My Bids (Bid History)

**Component**: User Dashboard / My Bids Page
- **Purpose**: Show bidding history and auction status

**Component State**:
```typescript
- bids: Bid[]
- isLoading: boolean
- error: string | null
- filterStatus: 'all' | 'winning' | 'lost' | 'watching'
```


**Flow**:
1. User navigates to My Bids section
2. Call `/api/mybids` with Bearer token
3. On success (200 OK):
   - Display list of all bids
   - Show bid status (Winning, Lost, Outbid)
   - Show current auction bid vs user's bid amount
4. On 401 Unauthorized:
   - Redirect to login

**UI Elements**:
- List or table of bids showing:
  - Product image and title
  - Auction current bid
  - User's bid amount
  - Time left (or "Ended")
  - Status badge (Winning, Lost, Outbid)
- Sort by: Recent, Status, Amount
- Filter by: All, Winning, Lost
- Click to view auction details
- Visual distinction for winning vs losing bids

---

### 5. Place a Bid Flow

**Component**: `auction_detail.tsx`
- **Location**: `src/components/auction/auction_detail.tsx`
- **Purpose**: Display auction details and allow bidding


**Flow**:
1. User views auction detail page (navigate to `/auction/{id}`)
2. Display auction information (title, description, images, current bid, time left)
3. User enters bid amount in input field
4. Client-side validation:
   - Bid > current_bid
   - Bid > 0
   - Auction not ended
5. User clicks "Place Bid" button
6. Submit to `/api/auctions/{id}/bid` with Bearer token


**Response Handling**:

**On success (200 OK)**:
- Display success toast: "Bid placed successfully!"
- Update currentBid to new bid amount
- Show user as highest bidder
- Update time left counter
- Refresh bid history if displayed

**On 400 Bad Request**:
- Handle various error conditions:
  - Bid too low: "Your bid must be higher than the current bid"
  - Auction ended: "This auction has ended"
  - Auction not started: "This auction has not started yet"
  - Invalid payload: "Please enter a valid bid amount"
- Display error message in red
- Keep bid input focused for retry

**On 404 Not Found**:
- Display: "Auction listing not found"
- Provide navigation back to home

**On 401 Unauthorized**:
- Redirect to login with return URL

**UI Elements**:
- Auction image gallery (main image + thumbnails)
- Auction title and description
- Current bid amount (highlighted)
- Minimum next bid (current_bid + increment)
- Bid input field with live validation feedback
- "Place Bid" button (disabled if conditions not met)
- Reason button disabled (if applicable): "Auction ended", "Enter valid amount"
- Bid history table showing:
  - Bidder (anonymized or username)
  - Bid amount
  - Bid timestamp
- Auction countdown timer
- "Watch" / "Unwatch" button (if implemented)
- Seller information

**Bid Increment Logic** (Frontend):
- If current bid < 50: increment = 1
- If current bid < 100: increment = 5
- If current bid < 500: increment = 10
- If current bid >= 500: increment = 25
- Show "Minimum bid: $X" to guide user

**Auction Timer**:
- Display countdown in format: "2h 30m 15s remaining"
- Update every second
- Change color as time decreases (green → yellow → red)
- Show "Ended" when time reaches 0
- Disable bidding when auction ends

---

## Global UI Patterns

### Authentication State Management
**Form Validation Errors**:
- Display inline next to form field
- Use red text color
- Clear error when user corrects field
- Highlight field with red border

### Loading States

**Implementation**:
- Show skeleton screens for data lists
- Disable buttons during submission
- Show spinner in button during submission
- Gray out form during processing

## Component Integration Checklist
### Listing Management
- [ ] Create form with image upload
- [ ] Implement form validation
- [ ] Display user's listings with status
- [ ] Show home feed with categories

### Bidding System
- [ ] Display auction details
- [ ] Implement bid input with validation
- [ ] Show real-time bid updates (if implemented)
- [ ] Display bid history
- [ ] Handle auction countdown timer

### User Profile
- [ ] Display user information
- [ ] Show profile picture (if available)
- [ ] Allow profile editing (future)

---

## Testing Strategy

### Unit Tests
- Form validation logic
- Bid amount calculations
- Time formatting

### E2E Tests (Cypress)
- Complete signup flow
- Complete login flow
- Create listing flow
- Place bid flow
- View my listings
- View my bids

### Integration Tests
- Each component's API integration
- Error handling
- Loading states

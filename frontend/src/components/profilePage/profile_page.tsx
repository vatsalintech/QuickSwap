// ProfilePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./profile_page.css";

interface ProfileResponse {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  mobile?: string;
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<"listings" | "bids" | "settings">("listings");
  const [user, setUser] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    mobile: "",
  });

  const handleEditOpen = () => {
    if (user) {
      setEditForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        mobile: user.mobile || "",
      });
      setIsEditingProfile(true);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Mock saving profile to backend:", editForm);
    // TODO: the backend route PUT /api/profile needs to be built.
    
    // Simulate successful backend save by updating local structures
    if (user) {
      const updatedUser = { ...user, ...editForm };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    
    setIsEditingProfile(false);
  };

  const navigate = useNavigate();

  // Fetch current user from localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Not authenticated");
          navigate("/signin");
          return;
        }

        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setError("User data not found in local storage.");
          navigate("/signin");
          return;
        }

        const data: ProfileResponse = JSON.parse(userStr);
        setUser(data);
      } catch (err: any) {
        console.error("Failed to parse user from local storage:", err);
        setError("Failed to load profile");
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const userListings = [
    {
      id: 1,
      name: "Gaming Laptop RTX 3070",
      currentBid: "$780",
      startingBid: "$650",
      timeLeft: "1h 23m",
      bids: 12,
      status: "active",
      image:
        "https://images.pexels.com/photos/2115217/pexels-photo-2115217.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 2,
      name: "Mechanical Keyboard",
      currentBid: "$95",
      startingBid: "$80",
      timeLeft: "5m",
      bids: 8,
      status: "ending",
      image:
        "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 3,
      name: "iPad Pro 11-inch",
      finalPrice: "$520",
      startingBid: "$400",
      bids: 15,
      status: "sold",
      image:
        "https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  ];

  const userBids = [
    {
      id: 1,
      name: "iPhone 14 Pro",
      yourBid: "$620",
      currentBid: "$650",
      timeLeft: "20m",
      status: "outbid",
      image:
        "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 2,
      name: "Sony WH-1000XM5",
      yourBid: "$185",
      currentBid: "$185",
      timeLeft: "45m",
      status: "winning",
      image:
        "https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 3,
      name: "MacBook Air M2",
      yourBid: "$890",
      finalPrice: "$920",
      status: "lost",
      image:
        "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
    },
  ];

  // Simple loading / error states for now
  if (loading) {
    return <div className="profile-page">Loading profile…</div>;
  }

  if (error || !user) {
    return <div className="profile-page">Unable to load profile.</div>;
  }

  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.email.split("@")[0];
  const userEmail = user.email;

  return (
    <div className="profile-page">
      {/* Edit Profile Modal Overlay */}
      {isEditingProfile && (
        <div className="edit-profile-modal-overlay">
          <div className="edit-profile-modal-content">
            <h2>Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="edit-profile-form">
              <div className="settings-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div className="settings-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
              <div className="settings-group">
                <label>Phone number</label>
                <input
                  type="tel"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                  required
                />
              </div>
              <div className="settings-group">
                <label>Email address</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="disabled-input"
                />
              </div>
              
              <div className="edit-profile-actions">
                <button type="button" className="btn ghost" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                <button type="submit" className="btn primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header/Navbar */}
      <header className="profile-navbar">
        <div className="profile-navbar-left">
          <button
            className="profile-back-pill"
            onClick={() => navigate("/")}
          >
            ← Back
          </button>
          <div className="navbar-logo">
            <span className="logo-text">Quickswap</span>
          </div>
        </div>

        <nav className="navbar-links">
          <button
            className="navbar-link-button"
            onClick={() => navigate("/")}
          >
            Browse
          </button>
          <button
            className="navbar-link-button"
            onClick={() => navigate("/start_selling")}
          >
            Sell
          </button>
          <button
            className="navbar-link-button active"
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>
        </nav>
        <div className="navbar-actions">
          <button className="btn ghost-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* Profile Header */}
      <section className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">
            {/* For now keep a placeholder avatar */}
            <img
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="User avatar"
            />
            <span className="profile-verified">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="profile-info">
            <h1>{displayName}</h1>
            <p className="profile-username">{userEmail}</p>
          </div>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">24</span>
              <span className="stat-label">Items sold</span>
            </div>
            <div className="stat">
              <span className="stat-value">4.9</span>
              <span className="stat-label">Rating</span>
            </div>
            <div className="stat">
              <span className="stat-value">98%</span>
              <span className="stat-label">Response rate</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          {/* Actions moved to tabs */}
        </div>
      </section>

      {/* Tabs */}
      <section className="profile-tabs">
        <button
          className={`tab ${activeTab === "listings" ? "active" : ""}`}
          onClick={() => setActiveTab("listings")}
        >
          My Listings
        </button>
        <button
          className={`tab ${activeTab === "bids" ? "active" : ""}`}
          onClick={() => setActiveTab("bids")}
        >
          My Bids
        </button>
        <button
          className={`tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </section>

      {/* Content Area */}
      <section className="profile-content">
        {activeTab === "listings" && (
          <div className="listings-grid">
            {userListings.map((listing) => (
              <article key={listing.id} className="listing-card">
                <div className="listing-image-wrap">
                  <img src={listing.image} alt={listing.name} />
                  <span className={`listing-status ${listing.status}`}>
                    {listing.status === "active" && "Active"}
                    {listing.status === "ending" && "Ending soon"}
                    {listing.status === "sold" && "Sold"}
                  </span>
                </div>
                <div className="listing-body">
                  <h3>{listing.name}</h3>
                  <div className="listing-details">
                    {listing.status === "sold" ? (
                      <>
                        <div className="price-info">
                          <span className="label">Final price</span>
                          <span className="value">{listing.finalPrice}</span>
                        </div>
                        <div className="price-info">
                          <span className="label">Starting bid</span>
                          <span className="value">{listing.startingBid}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="price-info">
                          <span className="label">Current bid</span>
                          <span className="value">{listing.currentBid}</span>
                        </div>
                        <div className="price-info">
                          <span className="label">Time left</span>
                          <span className="value">{listing.timeLeft}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="listing-meta">
                    <span>{listing.bids} bids</span>
                    <button className="btn-link">View details</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === "bids" && (
          <div className="bids-grid">
            {userBids.map((bid) => (
              <article key={bid.id} className="bid-card">
                <div className="bid-image-wrap">
                  <img src={bid.image} alt={bid.name} />
                  <span className={`bid-status ${bid.status}`}>
                    {bid.status === "winning" && "Winning"}
                    {bid.status === "outbid" && "Outbid"}
                    {bid.status === "lost" && "Lost"}
                  </span>
                </div>
                <div className="bid-body">
                  <h3>{bid.name}</h3>
                  <div className="bid-details">
                    <div className="price-info">
                      <span className="label">Your bid</span>
                      <span className="value">{bid.yourBid}</span>
                    </div>
                    {bid.status === "lost" ? (
                      <div className="price-info">
                        <span className="label">Final price</span>
                        <span className="value">{bid.finalPrice}</span>
                      </div>
                    ) : (
                      <div className="price-info">
                        <span className="label">Current bid</span>
                        <span className="value">{bid.currentBid}</span>
                      </div>
                    )}
                  </div>
                  {bid.timeLeft && (
                    <div className="bid-time">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>{bid.timeLeft} left</span>
                    </div>
                  )}
                  <div className="bid-actions">
                    {bid.status === "outbid" && (
                      <button className="btn primary">Place higher bid</button>
                    )}
                    {bid.status === "winning" && (
                      <button className="btn ghost">View auction</button>
                    )}
                    {bid.status === "lost" && (
                      <button className="btn ghost">View details</button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="settings-container">
            <div className="settings-section">
              <h2>Account Details</h2>
              <div className="settings-group inline" style={{ marginBottom: 0 }}>
                <label>Personal information</label>
                <button className="btn ghost" onClick={handleEditOpen}>Edit profile</button>
              </div>
            </div>
            
            <div className="settings-section">
              <h2>Privacy & Security</h2>
              <div className="settings-group inline">
                <label>Change password</label>
                <button className="btn ghost">Update password</button>
              </div>
              <div className="settings-group inline" style={{ marginBottom: 0 }}>
                <label style={{ color: "var(--error)" }}>Delete account</label>
                <button 
                  className="btn ghost" 
                  style={{ color: "var(--error)", borderColor: "var(--error-soft)" }}
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
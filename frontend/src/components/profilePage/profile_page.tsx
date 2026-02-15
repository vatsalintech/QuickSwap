// ProfilePage.tsx
import React, { useState } from "react";
import "./profile_page.css";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("listings");

  const userListings = [
    {
      id: 1,
      name: "Gaming Laptop RTX 3070",
      currentBid: "$780",
      startingBid: "$650",
      timeLeft: "1h 23m",
      bids: 12,
      status: "active",
      image: "https://images.pexels.com/photos/2115217/pexels-photo-2115217.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 2,
      name: "Mechanical Keyboard",
      currentBid: "$95",
      startingBid: "$80",
      timeLeft: "5m",
      bids: 8,
      status: "ending",
      image: "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 3,
      name: "iPad Pro 11-inch",
      finalPrice: "$520",
      startingBid: "$400",
      bids: 15,
      status: "sold",
      image: "https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=600",
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
      image: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 2,
      name: "Sony WH-1000XM5",
      yourBid: "$185",
      currentBid: "$185",
      timeLeft: "45m",
      status: "winning",
      image: "https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 3,
      name: "MacBook Air M2",
      yourBid: "$890",
      finalPrice: "$920",
      status: "lost",
      image: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
    },
  ];

  return (
    <div className="profile-page">
      {/* Header/Navbar */}
      <header className="profile-navbar">
        <div className="navbar-logo">
          <span className="logo-text">Quickswap</span>
        </div>
        <nav className="navbar-links">
          <a href="#browse">Browse</a>
          <a href="#sell">Sell</a>
          <a href="#profile" className="active">Profile</a>
        </nav>
        <div className="navbar-actions">
          <button className="btn ghost-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <img src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600" alt="User avatar" />
            <span className="profile-verified">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="profile-info">
            <h1>John Doe</h1>
            <p className="profile-username">@Johndoe</p>
            <p className="profile-bio">Tech enthusiast · Gainesville, FL · Member since Jan 2025</p>
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
          <button className="btn ghost">Edit profile</button>
          <button className="btn primary">Create listing</button>
        </div>
      </section>

      {/* Tabs */}
      <section className="profile-tabs">
        <button 
          className={`tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </section>

      {/* Content Area */}
      <section className="profile-content">
        {activeTab === "settings" && (
          <div className="settings-container">
            <div className="settings-section">
              <h2>Account Settings</h2>
              <div className="settings-group">
                <label>Email address</label>
                <input type="email" defaultValue="john.doe@example.com" />
              </div>
              <div className="settings-group">
                <label>Phone number</label>
                <input type="tel" defaultValue="+1 (352) 555-0123" />
              </div>
              <div className="settings-group">
                <label>Location</label>
                <input type="text" defaultValue="Gainesville, FL" />
              </div>
              <button className="btn primary">Save changes</button>
            </div>

            <div className="settings-section">
              <h2>Privacy & Security</h2>
              <div className="settings-group">
                <label>Change password</label>
                <button className="btn ghost">Update password</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
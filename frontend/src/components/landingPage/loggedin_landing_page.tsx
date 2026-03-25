import React from "react";
import { useNavigate } from "react-router-dom";
import "../landingPage/loggedin_landing_page.css"; 

// For now static, later you can fetch these
const trendingMock = [
  {
    id: 1,
    name: "Sony WH‑1000XM5 Wireless Headphones",
    price: "Current bid: $245",
    image:
      "https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg?auto=compress&cs=tinysrgb&w=600",
    tag: "Hot",
  },
  {
    id: 2,
    name: "MacBook Air M2 · 13‑inch",
    price: "Current bid: $910",
    image:
      "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
    tag: "Trending",
  },
  // add a few more so the scroll feels real
];

const endingSoonMock = [
  {
    id: 3,
    name: "Mechanical keyboard · 3 min left",
    price: "Current bid: $102",
    image:
      "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600",
    tag: "Ending soon",
  },
  // ...
];

const startingSoonMock = [
  {
    id: 4,
    name: "iPhone 14 Pro · starts in 20 min",
    price: "Starting bid: $600",
    image:
      "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600",
    tag: "Starting soon",
  },
  // ...
];

const LoggedInLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("user");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessTokenExpiry");
    localStorage.removeItem("user");
    // navigate("/", { replace: true }); // back to public landing
    window.location.href = "/";
  };

  const handleStartSelling = () => {
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    navigate("/start_selling");
  };

  const renderStrip = (
    title: string,
    items: typeof trendingMock,
    viewAllHref: string
  ) => (
    <section className="strip-section">
      <div className="strip-header">
        <h2>{title}</h2>
        <button
          className="strip-view-all"
          onClick={() => navigate(viewAllHref)}
        >
          Show all
        </button>
      </div>
      <div className="strip-scroll">
        {items.map((item) => (
          <article key={item.id} className="strip-card">
            <div className="strip-image-wrap">
              <img src={item.image} alt={item.name} />
              <span className="product-tag">{item.tag}</span>
            </div>
            <div className="strip-body">
              <h3>{item.name}</h3>
              <div className="strip-meta">
                <span className="product-price">{item.price}</span>
                <button
                  className="btn tiny"
                  onClick={() => navigate(`/auction/${item.id}`)}
                >
                  View
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <div className="landing">
      {/* Navbar – identical to your current one */}
      <header className="navbar">
        <div className="navbar-logo">
          <span className="logo-text">Quickswap</span>
        </div>
        <nav className="navbar-links">
          {/* remove “How it works” / “Live auctions” for logged‑in view */}
          {/* You can add “Home”, “Explore”, etc. later if you want */}
        </nav>
        <div className="navbar-actions">
          <button className="btn primary" onClick={handleStartSelling}>
            Start selling
          </button>
          {isLoggedIn && (
            <>
              <button
                className="btn ghost"
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>
              <button className="btn ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero strip can stay, or you can shrink it later */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">Live now · Tailored auctions</span>
          <h1>Pick up where you left off.</h1>
          <p>
            See trending auctions, lots you’re watching, and ones that are
            about to end — all in one place.
          </p>
          <div className="hero-actions">
            <button className="btn primary" onClick={handleStartSelling}>
              Start a new auction
            </button>
            <button
              className="btn ghost"
              onClick={() => navigate("/profile")}
            >
              View your activity
            </button>
          </div>
        </div>
        <div className="hero-visual">
          {/* you can reuse your existing hero visuals here */}
          <div className="hero-card main">
            <img
              src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Dashboard preview"
            />
            <div className="hero-tag">
              3 auctions ending in the next hour
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal strips */}
      {renderStrip("Trending now", trendingMock, "/explore/trending")}
      {renderStrip("Ending soon", endingSoonMock, "/explore/ending-soon")}
      {renderStrip("Starting soon", startingSoonMock, "/explore/starting-soon")}

      {/* Footer can stay the same if you like */}
      <footer className="footer">
        <span>© {new Date().getFullYear()} Quickswap. All rights reserved.</span>
        <span className="footer-links">
          <a href="#!">Privacy</a> · <a href="#!">Terms</a> ·{" "}
          <a href="#!">Support</a>
        </span>
      </footer>
    </div>
  );
};

export default LoggedInLandingPage;
import React from "react";
import "./auction_detail.css";

interface AuctionDetailProps {
  // later these will come from backend
  isSeller?: boolean;
  hasJoined?: boolean;
  isHighestBidder?: boolean;
  lastBidAmount?: number | null;
}

const AuctionDetail: React.FC<AuctionDetailProps> = ({
  isSeller = false,
  hasJoined = false,
  isHighestBidder = false,
  lastBidAmount = 220, // example static value
}) => {
  // simple static product data for now
  const productTitle = "Sony WH‑1000XM5 Wireless Headphones";
  const productSubtitle = "Matte black · Noise cancelling · Used · Excellent condition";
  const sellerName = "Alex Johnson";
  const currentBid = 245;
  const timeLeft = "18m 32s";
  const bidsCount = 9;

  // decide primary call‑to‑action text
  let primaryCtaLabel = "Join auction";
  if (isSeller) {
    primaryCtaLabel = "Manage listing";
  } else if (hasJoined && isHighestBidder) {
    primaryCtaLabel = "You’re leading – raise max bid";
  } else if (hasJoined && !isHighestBidder) {
    primaryCtaLabel = "Place higher bid";
  }

  return (
    <div className="auction-page">
      <button className="auction-back" onClick={() => window.history.back()}>
        ← Back to results
      </button>

      <div className="auction-layout">
        {/* Left: gallery */}
        <section className="auction-gallery">
          <div className="auction-main-image">
            <img
              src="https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Product"
            />
          </div>
          <div className="auction-thumbnails">
            {/* static thumbs for now */}
            {[1, 2, 3].map((i) => (
              <button key={i} className="auction-thumb">
                <img
                  src="https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt={`Thumbnail ${i}`}
                />
              </button>
            ))}
          </div>
        </section>

        {/* Right: summary + actions */}
        <section className="auction-summary">
          <header className="auction-header">
            <h1>{productTitle}</h1>
            <p className="auction-subtitle">{productSubtitle}</p>
          </header>

          <div className="auction-meta-row">
            <div>
              <span className="auction-label">Seller</span>
              <span className="auction-value">{sellerName}</span>
            </div>
            <div>
              <span className="auction-label">Time left</span>
              <span className="auction-value">{timeLeft}</span>
            </div>
            <div>
              <span className="auction-label">Bids</span>
              <span className="auction-value">{bidsCount}</span>
            </div>
          </div>

          <div className="auction-price-card">
            <div className="auction-price-main">
              <span className="auction-label">Current bid</span>
              <div className="auction-price-line">
                <span className="auction-price">${currentBid}</span>
                {!isSeller && hasJoined && (
                  <span
                    className={
                      "auction-badge " +
                      (isHighestBidder ? "auction-badge-success" : "auction-badge-warning")
                    }
                  >
                    {isHighestBidder ? "You are highest bidder" : "You’ve been outbid"}
                  </span>
                )}
              </div>
            </div>

            {!isSeller && hasJoined && (
              <div className="auction-last-bid">
                <span className="auction-label">Your last bid</span>
                <span className="auction-value">
                  {lastBidAmount ? `$${lastBidAmount}` : "—"}
                </span>
              </div>
            )}
          </div>

          {!isSeller && (
            <div className="auction-actions">
              {/* Primary action */}
              <button className="auction-btn-primary">
                {primaryCtaLabel}
              </button>

              {/* Secondary action: input to enter bid (static for now) */}
              {hasJoined && (
                <div className="auction-bid-input">
                  <label className="auction-label" htmlFor="bid-amount">
                    Enter your bid
                  </label>
                  <div className="auction-bid-row">
                    <span className="auction-bid-prefix">$</span>
                    <input
                      id="bid-amount"
                      type="number"
                      className="auction-bid-field"
                      placeholder={String(currentBid + 5)}
                    />
                    <button className="auction-btn-ghost">Bid</button>
                  </div>
                  {!isHighestBidder && (
                    <p className="auction-hint">
                      You’re currently outbid. Try at least ${currentBid + 5} to take the lead.
                    </p>
                  )}
                </div>
              )}

              {!hasJoined && (
                <p className="auction-hint">
                  Join the auction to place your first bid and get live updates when you are outbid.
                </p>
              )}
            </div>
          )}

          {/* Details section – fills blank space with useful info */}
          <section className="auction-details">
            <h2>Item details</h2>
            <ul>
              <li>Purchased in 2023, lightly used for commuting and office work.</li>
              <li>Includes original case, charging cable, and airplane adapter.</li>
              <li>Battery still lasts 25–30 hours on a single charge.</li>
            </ul>

            <h3>Pickup & payment</h3>
            <p>
              Local pickup in Gainesville, FL. Cash, Zelle, or Venmo accepted. Exact location
              shared with the winning bidder after the auction ends.
            </p>
          </section>
        </section>
      </div>
    </div>
  );
};

export default AuctionDetail;
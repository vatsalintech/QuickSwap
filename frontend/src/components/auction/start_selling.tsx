// src/components/sell/StartSelling.tsx
import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./start_selling.css";

interface StartSellingForm {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  subcategory: string;
  condition: string;
  brand: string;
  color: string;
  size: string;
  locationCity: string;
  startingBid: string;
  buyNowPrice: string;
  startTime: string;
  endTime: string;
  pickupNotes: string;
}

const subcategoriesByCategory: Record<string, string[]> = {
  electronics: ["Mobile phones", "Laptops", "Headphones", "Cameras", "Gaming consoles"],
  clothing: ["Men's T‑shirts", "Men's pants", "Women's tops", "Women's pants", "Jackets & coats"],
  home: ["Furniture", "Kitchen & dining", "Home decor", "Bedding", "Storage & organization"],
  books: ["Fiction", "Non‑fiction", "Textbooks", "Comics & graphic novels", "Kids' books"],
  sports: ["Fitness equipment", "Outdoor gear", "Team sports", "Cycling", "Sportswear"],
  other: ["Miscellaneous"],
};

const StartSelling: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<StartSellingForm>({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    subcategory: "",
    condition: "used_good",
    brand: "",
    color: "",
    size: "",
    locationCity: "",
    startingBid: "",
    buyNowPrice: "",
    startTime: "",
    endTime: "",
    pickupNotes: "",
  });

  const [photos, setPhotos] = useState<File[]>([]);

  const handleChange =
    (field: keyof StartSellingForm) =>
    (
      e:
        | ChangeEvent<HTMLInputElement>
        | ChangeEvent<HTMLTextAreaElement>
        | ChangeEvent<HTMLSelectElement>
    ) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // For now, just log. Later: POST to backend.
    console.log("New auction listing:", {
      ...form,
      photosCount: photos.length,
    });
    // Example: navigate to a confirmation or preview page
    // navigate("/auction/preview");
  };

  const subcategoryOptions =
    form.category && subcategoriesByCategory[form.category]
      ? subcategoriesByCategory[form.category]
      : [];

  return (
    <div className="sell-page">
      <button className="sell-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="sell-layout">
        {/* Left: photos */}
        <section className="sell-photos-card">
          <h2>Photos</h2>
          <p className="sell-helper">
            Upload clear photos that show the item from multiple angles.
          </p>

          <label className="sell-upload-area">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
            <span className="sell-upload-icon">＋</span>
            <span>Click to upload or drag and drop</span>
            <span className="sell-upload-sub">
              PNG, JPG up to 10MB each. First photo becomes the cover.
            </span>
          </label>

          {photos.length > 0 && (
            <div className="sell-photo-preview-row">
              {photos.slice(0, 4).map((file, idx) => (
                <div key={idx} className="sell-photo-chip">
                  <span className="sell-photo-name">{file.name}</span>
                </div>
              ))}
              {photos.length > 4 && (
                <div className="sell-photo-more">+{photos.length - 4} more</div>
              )}
            </div>
          )}
        </section>

        {/* Right: form */}
        <section className="sell-form-card">
          <h1>Create a new auction</h1>
          <p className="sell-subtitle">
            Describe your item, set a starting bid, and choose when the auction runs.
          </p>

          <form className="sell-form" onSubmit={handleSubmit}>
            {/* Basic info */}
            <div className="sell-field-group">
              <label>
                Title
                <input
                  type="text"
                  value={form.title}
                  onChange={handleChange("title")}
                  placeholder="e.g. Wooden dining table · seats 4"
                  required
                />
              </label>

              <label>
                Short subtitle
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={handleChange("subtitle")}
                  placeholder="e.g. Solid oak, includes 4 matching chairs"
                />
              </label>

              <label>
                Detailed description
                <textarea
                  value={form.description}
                  onChange={handleChange("description")}
                  placeholder="Describe condition, dimensions, what's included, and anything a buyer should know."
                  rows={4}
                />
              </label>
            </div>

            {/* Category & subcategory */}
            <div className="sell-two-column">
              <label>
                Category
                <select
                  value={form.category}
                  onChange={handleChange("category")}
                  required
                >
                  <option value="">Select category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing & accessories</option>
                  <option value="home">Home & kitchen</option>
                  <option value="books">Books</option>
                  <option value="sports">Sports & outdoors</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label>
                Subcategory
                <select
                  value={form.subcategory}
                  onChange={handleChange("subcategory")}
                  disabled={!form.category}
                  required
                >
                  <option value="">
                    {form.category ? "Select subcategory" : "Choose a category first"}
                  </option>
                  {subcategoryOptions.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Generic attributes */}
            <div className="sell-two-column">
              <label>
                Condition
                <select
                  value={form.condition}
                  onChange={handleChange("condition")}
                >
                  <option value="new">New / with tags</option>
                  <option value="like_new">Like new</option>
                  <option value="used_good">Used · Good</option>
                  <option value="used_fair">Used · Fair</option>
                </select>
              </label>

              <label>
                Brand (optional)
                <input
                  type="text"
                  value={form.brand}
                  onChange={handleChange("brand")}
                  placeholder="e.g. Apple, Nike, IKEA"
                />
              </label>
            </div>

            <div className="sell-two-column">
              <label>
                Color (optional)
                <input
                  type="text"
                  value={form.color}
                  onChange={handleChange("color")}
                  placeholder="e.g. black, blue, oak"
                />
              </label>

              <label>
                Size / variant (optional)
                <input
                  type="text"
                  value={form.size}
                  onChange={handleChange("size")}
                  placeholder="e.g. M, 42, Queen, 256GB"
                />
              </label>
            </div>

            <div className="sell-two-column">
              <label>
                City / Area
                <input
                  type="text"
                  value={form.locationCity}
                  onChange={handleChange("locationCity")}
                  placeholder="e.g. Gainesville, FL"
                />
              </label>
            </div>

            {/* Auction settings */}
            <div className="sell-auction-card">
              <h2>Auction settings</h2>

              <div className="sell-two-column">
                <label>
                  Starting bid
                  <div className="sell-inline-input">
                    <span className="sell-prefix">$</span>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={form.startingBid}
                      onChange={handleChange("startingBid")}
                      placeholder="e.g. 50"
                      required
                    />
                  </div>
                </label>

                <label>
                  Optional buy‑now price
                  <div className="sell-inline-input">
                    <span className="sell-prefix">$</span>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={form.buyNowPrice}
                      onChange={handleChange("buyNowPrice")}
                      placeholder="Leave empty if not needed"
                    />
                  </div>
                </label>
              </div>

              <div className="sell-two-column">
                <label>
                  Auction start time
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={handleChange("startTime")}
                    required
                  />
                </label>

                <label>
                  Auction end time
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={handleChange("endTime")}
                    required
                  />
                </label>
              </div>

              <label>
                Pickup & payment notes
                <textarea
                  value={form.pickupNotes}
                  onChange={handleChange("pickupNotes")}
                  placeholder="e.g. Local pickup only. Cash or digital payments accepted."
                  rows={3}
                />
              </label>
            </div>

            <div className="sell-actions">
              <button type="submit" className="sell-btn-primary">
                Publish auction
              </button>
              <p className="sell-disclaimer">
                Your auction will go live at the chosen start time. You’ll be notified when new bids come in.
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default StartSelling;
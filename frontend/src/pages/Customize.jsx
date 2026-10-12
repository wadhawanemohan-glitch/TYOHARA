import { useState } from "react";
import { Link } from "react-router-dom";

import Turnstile from "../components/Turnstile";
import { captchaEnabled } from "../captchaConfig";
import { fetchWithTimeout } from "../utils/api";
import siteConfig from "../siteConfig";

import "./Customize.css";

const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Diwali",
  "Raksha Bandhan",
  "Valentine",
  "Holi",
  "Eid",
  "Christmas",
  "New Year",
  "Corporate gifting",
  "Other"
];

const GIFT_TYPES = [
  "Photo gift",
  "Name / message gift",
  "Gift hamper",
  "Handmade gift",
  "Decor",
  "Something else"
];

const BUDGETS = [
  "Under Rs 500",
  "Rs 500 - 1,000",
  "Rs 1,000 - 2,500",
  "Rs 2,500 - 5,000",
  "Above Rs 5,000",
  "Not sure yet"
];

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  occasion: "",
  giftType: "",
  budget: "",
  neededBy: "",
  description: "",
  referenceLink: "",
  // Hidden field: real visitors never see or fill it
  website: ""
};

// Earliest date offered: tomorrow
const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

function Customize() {
  const [form, setForm] = useState(() => {
    // Pre-fill name and email for a logged-in customer
    try {
      const saved = JSON.parse(
        localStorage.getItem("tyohara-user") || "null"
      );

      if (saved) {
        return {
          ...EMPTY_FORM,
          name: saved.name || "",
          email: saved.email || ""
        };
      }
    } catch {
      // ignore unreadable saved data
    }

    return EMPTY_FORM;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentId, setSentId] = useState("");

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (captchaEnabled && !captchaToken) {
      setError("Please complete the captcha.");
      return;
    }

    setLoading(true);

    try {
      let token = null;

      try {
        token = localStorage.getItem("tyohara-token");
      } catch {
        // continue as a guest
      }

      const response = await fetchWithTimeout(
        `${import.meta.env.VITE_API_URL}/api/custom-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {})
          },
          body: JSON.stringify({
            ...form,
            captchaToken
          })
        },
        40000
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Could not send your request. Please try again."
        );
      }

      setSentId(data.requestId);

    } catch (err) {

      setError(
        err.name === "AbortError"
          ? "The server is taking too long to respond. It may be starting up, so please try again in a minute."
          : err.message
      );

      setCaptchaToken("");
      setCaptchaReset((value) => value + 1);

    } finally {
      setLoading(false);
    }
  };

  // ---------- Thank-you screen ----------

  if (sentId) {
    return (
      <div className="customize-page">
        <div className="customize-card customize-done">

          <p className="customize-small-title">
            REQUEST RECEIVED
          </p>

          <h1>
            Thank you! We have your idea.
          </h1>

          <p>
            Your request number is{" "}
            <strong>{sentId}</strong>. Our team will look at
            your idea and contact you on{" "}
            <strong>{form.phone}</strong> with the design and
            price. You do not need to pay anything now.
          </p>

          {siteConfig.whatsappNumber && (
            <p>
              Want to share photos or pictures?{" "}
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
                  `Hi TYOHARA, my custom gift request number is ${sentId}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Send them on WhatsApp
              </a>
              .
            </p>
          )}

          <Link to="/shop" className="customize-link">
            Continue shopping
          </Link>

        </div>
      </div>
    );
  }

  // ---------- Form ----------

  return (
    <div className="customize-page">

      <div className="customize-card">

        <p className="customize-small-title">
          MADE JUST FOR YOU
        </p>

        <h1>
          Customize Your Gift
        </h1>

        <p className="customize-intro">
          Tell us your idea and we will make it for you. Share
          what you have in mind, and our team will contact you
          with the design and the price. There is no payment
          until you are happy with it.
        </p>

        <form onSubmit={handleSubmit} className="customize-form">

          <div className="customize-row">

            <label>
              Your name *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={80}
                required
                autoComplete="name"
              />
            </label>

            <label>
              Mobile number *
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                maxLength={15}
                required
                autoComplete="tel"
              />
            </label>

          </div>

          <label>
            Email (optional)
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              maxLength={120}
              autoComplete="email"
            />
          </label>

          <div className="customize-row">

            <label>
              Occasion
              <select
                name="occasion"
                value={form.occasion}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {OCCASIONS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Type of gift
              <select
                name="giftType"
                value={form.giftType}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {GIFT_TYPES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

          </div>

          <div className="customize-row">

            <label>
              Budget
              <select
                name="budget"
                value={form.budget}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {BUDGETS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Needed by
              <input
                name="neededBy"
                type="date"
                min={tomorrow()}
                value={form.neededBy}
                onChange={handleChange}
              />
            </label>

          </div>

          <label>
            Describe your idea *
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              maxLength={2000}
              required
              placeholder="Who is it for? What should it look like? Any name, message, colours or photos you want on it?"
            />
          </label>

          <label>
            Link to photos or inspiration (optional)
            <input
              name="referenceLink"
              type="url"
              value={form.referenceLink}
              onChange={handleChange}
              maxLength={300}
              placeholder="Google Drive, Instagram or Pinterest link"
            />
          </label>

          {/* Spam trap: hidden from real visitors */}
          <div className="customize-trap" aria-hidden="true">
            <label>
              Website
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          <Turnstile
            onToken={setCaptchaToken}
            resetKey={captchaReset}
          />

          {error && (
            <div className="customize-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="customize-submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send my idea"}
          </button>

          <p className="customize-note">
            Made-to-order gifts are prepared specially for you.
            Please read our{" "}
            <Link to="/refund-policy">
              cancellation and refund policy
            </Link>
            .
          </p>

        </form>

      </div>

    </div>
  );
}

export default Customize;

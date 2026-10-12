import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./AdminCustomRequests.css";

const STATUSES = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["quoted", "Quoted"],
  ["accepted", "Accepted"],
  ["in-progress", "In progress"],
  ["ready", "Ready"],
  ["completed", "Completed"],
  ["declined", "Declined"]
];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "-";

const whatsappLink = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `https://wa.me/91${digits}`;
  }

  return `https://wa.me/${digits.replace(/^0+/, "")}`;
};


function RequestCard({ request, onSaved }) {
  const [status, setStatus] = useState(request.status);
  const [price, setPrice] = useState(
    request.quotedPrice ?? ""
  );
  const [note, setNote] = useState(request.adminNote || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const save = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/custom-requests/${request._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "tyohara-token"
            )}`
          },
          body: JSON.stringify({
            status,
            quotedPrice: price,
            adminNote: note
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save.");
      }

      onSaved(data.request);
      setMessage("Saved");

    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cr-card">

      <div className="cr-top">

        <div>
          <strong>{request.name}</strong>
          <span className="cr-id">{request.requestId}</span>
        </div>

        <span className={`cr-badge cr-${request.status}`}>
          {request.status}
        </span>

      </div>

      <p className="cr-meta">
        Received {formatDate(request.createdAt)}
        {request.neededBy
          ? ` | Needed by ${formatDate(request.neededBy)}`
          : ""}
      </p>

      <p className="cr-contact">
        <a href={`tel:${request.phone}`}>{request.phone}</a>
        {" | "}
        <a
          href={whatsappLink(request.phone)}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        {request.email && (
          <>
            {" | "}
            <a href={`mailto:${request.email}`}>
              {request.email}
            </a>
          </>
        )}
      </p>

      <p className="cr-tags">
        {[request.occasion, request.giftType, request.budget]
          .filter(Boolean)
          .join(" | ") || "No details selected"}
      </p>

      <p className="cr-description">
        {request.description}
      </p>

      {request.referenceLink && (
        <p>
          <a
            href={request.referenceLink}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            Open reference link
          </a>
        </p>
      )}

      <div className="cr-edit">

        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Quoted price (Rs)
          <input
            type="number"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </label>

        <label className="cr-note">
          Your notes
          <textarea
            rows={2}
            maxLength={1000}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        <div className="cr-save">
          <button
            type="button"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>

          {message && <span>{message}</span>}
        </div>

      </div>

    </div>
  );
}


function AdminCustomRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("tyohara-token");

      if (!token) {
        throw new Error("Admin login required.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/custom-requests`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Could not load requests."
        );
      }

      setRequests(data.requests || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const replace = (updated) =>
    setRequests((list) =>
      list.map((item) =>
        item._id === updated._id ? updated : item
      )
    );

  const shown =
    filter === "all"
      ? requests
      : requests.filter((item) => item.status === filter);

  const newCount = requests.filter(
    (item) => item.status === "new"
  ).length;

  return (
    <div className="cr-page">

      <div className="cr-container">

        <div className="cr-header">

          <div>
            <p className="cr-small-title">TYOHARA ADMIN</p>
            <h1>Custom Gift Requests</h1>
            <p>
              Ideas sent by customers.{" "}
              <strong>{newCount}</strong> new.
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="cr-back"
          >
            Dashboard
          </Link>

        </div>

        <div className="cr-filters">
          {[["all", "All"], ...STATUSES].map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                className={filter === value ? "active" : ""}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            )
          )}
        </div>

        {error && <div className="cr-error">{error}</div>}

        {loading ? (
          <p>Loading requests...</p>
        ) : shown.length === 0 ? (
          <p>No requests here yet.</p>
        ) : (
          shown.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onSaved={replace}
            />
          ))
        )}

      </div>

    </div>
  );
}

export default AdminCustomRequests;

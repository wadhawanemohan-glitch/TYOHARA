import { Link, useNavigate } from "react-router-dom";

import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("tyohara-user");

  const user = savedUser
    ? JSON.parse(savedUser)
    : null;

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h1>Please Login</h1>

          <p>
            You need to login to view your profile.
          </p>

          <Link
            to="/login"
            className="profile-login-button"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("tyohara-token");
    localStorage.removeItem("tyohara-user");

    navigate("/");
  };

  return (
    <div className="profile-page">
      <div className="profile-card">

        <div className="profile-icon">
          
        </div>

        <p className="profile-small-title">
          MY ACCOUNT
        </p>

        <h1>
          {user.name}
        </h1>

        <div className="profile-details">

          <div className="profile-row">
            <span>Name</span>
            <strong>{user.name}</strong>
          </div>

          <div className="profile-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="profile-row">
            <span>Account Type</span>
            <strong>{user.role}</strong>
          </div>

        </div>

        <div className="profile-actions">

          <Link
  to="/my-orders"
  className="profile-order-button"
>
   My Orders
</Link>

          <button
            onClick={handleLogout}
            className="profile-logout-button"
          >
            Logout
          </button>

        </div>

        <Link
          to="/"
          className="profile-home-link"
        >
           Back to Home
        </Link>

      </div>
    </div>
  );
}

export default Profile;




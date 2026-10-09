import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./AdminDashboard.css";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("tyohara-token");

      if (!token) {
        throw new Error(
          "Admin login required."
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch orders."
        );
      }

      setOrders(data.orders || []);

    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      setError(
        error.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const processingOrders = orders.filter(
    (order) =>
      order.status === "Processing"
  ).length;

  const shippedOrders = orders.filter(
    (order) =>
      order.status === "Shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.status === "Delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) =>
      order.status === "Cancelled"
  ).length;

  const totalSales = orders.reduce(
    (total, order) =>
      total + Number(order.total || 0),
    0
  );

  const averageOrderValue =
    totalOrders > 0
      ? Math.round(
          totalSales / totalOrders
        )
      : 0;

  const recentOrders = orders.slice(0, 5);

  const statusData = [
    {
      name: "Pending",
      count: pendingOrders
    },
    {
      name: "Processing",
      count: processingOrders
    },
    {
      name: "Shipped",
      count: shippedOrders
    },
    {
      name: "Delivered",
      count: deliveredOrders
    },
    {
      name: "Cancelled",
      count: cancelledOrders
    }
  ];

  const maxStatusCount = Math.max(
    ...statusData.map(
      (item) => item.count
    ),
    1
  );

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">

      <div className="admin-dashboard-container">

        {/* HEADER */}

        <div className="admin-dashboard-header">

          <div>
            <p className="admin-dashboard-small-title">
              TYOHARA ADMIN
            </p>

            <h1>
              Dashboard
            </h1>

            <p>
              Overview of your TYOHARA
              store and orders.
            </p>
          </div>

          <div className="admin-dashboard-actions">

            <button
              type="button"
              className="dashboard-refresh-button"
              onClick={fetchOrders}
            >
               Refresh
            </button>

            <Link
              to="/admin/orders"
              className="dashboard-orders-button"
            >
               Manage Orders
            </Link>

          </div>

        </div>

        {error && (
          <div className="admin-dashboard-error">
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="dashboard-summary-grid">

          <div className="dashboard-summary-card">
            <span>
              Total Orders
            </span>

            <strong>
              {totalOrders}
            </strong>

            <small>
              All customer orders
            </small>
          </div>

          <div className="dashboard-summary-card">
            <span>
              Total Sales
            </span>

            <strong>
              {totalSales}
            </strong>

            <small>
              Order revenue
            </small>
          </div>

          <div className="dashboard-summary-card">
            <span>
              Pending Orders
            </span>

            <strong>
              {pendingOrders}
            </strong>

            <small>
              Need attention
            </small>
          </div>

          <div className="dashboard-summary-card">
            <span>
              Delivered
            </span>

            <strong>
              {deliveredOrders}
            </strong>

            <small>
              Completed orders
            </small>
          </div>

        </div>

        {/* SECONDARY STATS */}

        <div className="dashboard-secondary-grid">

          <div className="dashboard-info-card">

            <p>
              Average Order Value
            </p>

            <h2>
              {averageOrderValue}
            </h2>

          </div>

          <div className="dashboard-info-card">

            <p>
              Processing
            </p>

            <h2>
              {processingOrders}
            </h2>

          </div>

          <div className="dashboard-info-card">

            <p>
              Shipped
            </p>

            <h2>
              {shippedOrders}
            </h2>

          </div>

        </div>

        {/* MAIN GRID */}

        <div className="dashboard-main-grid">

          {/* ORDER STATUS */}

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>
                <p className="panel-small-title">
                  ORDER ANALYSIS
                </p>

                <h2>
                  Orders by Status
                </h2>
              </div>

            </div>

            <div className="status-chart">

              {statusData.map((item) => {

                const percentage =
                  (item.count /
                    maxStatusCount) *
                  100;

                return (
                  <div
                    className="status-chart-row"
                    key={item.name}
                  >

                    <div className="status-chart-label">
                      <span>
                        {item.name}
                      </span>

                      <strong>
                        {item.count}
                      </strong>
                    </div>

                    <div className="status-bar-background">

                      <div
                        className="status-bar"
                        style={{
                          width: `${percentage}%`
                        }}
                      />

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          {/* QUICK ACTIONS */}

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>
                <p className="panel-small-title">
                  ADMIN TOOLS
                </p>

                <h2>
                  Quick Actions
                </h2>
              </div>

            </div>

            <div className="quick-actions">

              <Link
                to="/admin/orders"
                className="quick-action"
              >
                <span>
                  
                </span>

                <div>
                  <strong>
                    Manage Orders
                  </strong>

                  <small>
                    View and update orders
                  </small>
                </div>
              </Link>

              <Link
                to="/"
                className="quick-action"
              >
                <span>
                  
                </span>

                <div>
                  <strong>
                    View Store
                  </strong>

                  <small>
                    Open customer website
                  </small>
                </div>
              </Link>

              <Link
                to="/admin/orders"
                className="quick-action"
              >
                <span>
                  
                </span>

                <div>
                  <strong>
                    Update Delivery
                  </strong>

                  <small>
                    Change order status
                  </small>
                </div>
              </Link>

            </div>

          </div>

        </div>

        {/* RECENT ORDERS */}

        <div className="dashboard-panel recent-orders-panel">

          <div className="dashboard-panel-header">

            <div>
              <p className="panel-small-title">
                LATEST ACTIVITY
              </p>

              <h2>
                Recent Orders
              </h2>
            </div>

            <Link
              to="/admin/orders"
              className="view-all-link"
            >
              View All 
            </Link>

          </div>

          <div className="recent-orders-list">

            {recentOrders.length === 0 ? (

              <div className="no-dashboard-orders">
                No orders found.
              </div>

            ) : (

              recentOrders.map((order) => (

                <div
                  className="recent-order-row"
                  key={order.orderId}
                >

                  <div className="recent-order-id">
                    <strong>
                      {order.orderId}
                    </strong>

                    <span>
                      {order.customer?.name}
                    </span>
                  </div>

                  <div className="recent-order-items">
                    {order.items
                      ?.map(
                        (item) =>
                          `${item.name}  ${item.quantity}`
                      )
                      .join(", ")}
                  </div>

                  <strong className="recent-order-total">
                    {order.total}
                  </strong>

                  <span
                    className={`dashboard-status status-${order.status
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {order.status}
                  </span>

                </div>

              ))
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;





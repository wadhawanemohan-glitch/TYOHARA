import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./AdminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingOrder, setUpdatingOrder] =
    useState(null);


  // ======================================================
  // GET ADMIN TOKEN
  // ======================================================

  const getToken = () => {
    return localStorage.getItem(
      "giftwala-token"
    );
  };


  // ======================================================
  // FETCH ALL ORDERS
  // ======================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin login required."
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
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
        "Admin orders error:",
        error
      );

      setError(
        error.message ||
        "Unable to load orders."
      );

    } finally {
      setLoading(false);
    }
  };


  // ======================================================
  // LOAD ORDERS WHEN PAGE OPENS
  // ======================================================

  useEffect(() => {
    fetchOrders();
  }, []);


  // ======================================================
  // UPDATE ORDER STATUS
  // ======================================================

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    try {

      setUpdatingOrder(orderId);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin login required."
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          "Failed to update order status."
        );
      }


      // Update the order locally
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                status: newStatus
              }
            : order
        )
      );

    } catch (error) {

      console.error(
        "Status update error:",
        error
      );

      alert(
        error.message ||
        "Unable to update order status."
      );

    } finally {
      setUpdatingOrder(null);
    }
  };


  // ======================================================
  // SUMMARY CALCULATIONS
  // ======================================================

  const totalOrders =
    orders.length;

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status === "Pending"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status === "Delivered"
    ).length;

  const totalSales =
    orders.reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0
    );


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="admin-orders-page">

        <div className="admin-orders-loading">
          Loading orders...
        </div>

      </div>
    );
  }


  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="admin-orders-page">

      <div className="admin-orders-container">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="admin-orders-header">

          <div>

            <p className="admin-orders-small-title">
              TYOHARA ADMIN
            </p>

            <h1>
              Order Management
            </h1>

            <p>
              Manage customer orders and
              update order status.
            </p>

          </div>


          <div className="admin-orders-actions">

  <Link
    to="/admin/dashboard"
    className="admin-dashboard-button"
  >
     Dashboard
  </Link>

  <button
    type="button"
    className="refresh-orders-button"
    onClick={fetchOrders}
  >
    Refresh Orders
  </button>

</div>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="admin-orders-error">

            {error}

          </div>
        )}


        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="admin-summary-grid">

          <div className="admin-summary-card">

            <span>
              Total Orders
            </span>

            <strong>
              {totalOrders}
            </strong>

          </div>


          <div className="admin-summary-card">

            <span>
              Pending
            </span>

            <strong>
              {pendingOrders}
            </strong>

          </div>


          <div className="admin-summary-card">

            <span>
              Delivered
            </span>

            <strong>
              {deliveredOrders}
            </strong>

          </div>


          <div className="admin-summary-card">

            <span>
              Total Sales
            </span>

            <strong>
              {totalSales}
            </strong>

          </div>

        </div>


        {/* ==================================================
            ORDERS TABLE
        ================================================== */}

        <div className="admin-orders-table-container">

          <table className="admin-orders-table">

            <thead>

              <tr>

                <th>
                  Order ID
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Items
                </th>

                <th>
                  Total
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {orders.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="no-orders-message"
                  >
                    No orders found.
                  </td>

                </tr>

              ) : (

                orders.map((order) => (

                  <tr
                    key={order.orderId}
                  >

                    {/* ORDER ID */}

                    <td>

                      <strong>
                        {order.orderId}
                      </strong>

                    </td>


                    {/* CUSTOMER */}

                    <td>

                      <div className="customer-info">

                        <strong>
                          {order.customer?.name}
                        </strong>

                        <span>
                          {order.customer?.phone}
                        </span>

                        <span>
                          {order.customer?.email}
                        </span>

                      </div>

                    </td>


                    {/* ITEMS */}

                    <td>

                      <div className="order-items">

                        {order.items?.map(
                          (item) => (

                            <div
                              key={`${order.orderId}-${item.productId}`}
                            >
                              {item.name} {" "}
                              {item.quantity}
                            </div>

                          )
                        )}

                      </div>

                    </td>


                    {/* TOTAL */}

                    <td>

                      <strong>
                        {order.total}
                      </strong>

                    </td>


                    {/* PAYMENT */}

                    <td>

                      {order.paymentMethod}

                    </td>


                    {/* STATUS */}

                    <td>

                      <select
                        value={order.status}
                        disabled={
                          updatingOrder ===
                          order.orderId
                        }
                        onChange={(event) =>
                          handleStatusChange(
                            order.orderId,
                            event.target.value
                          )
                        }
                        className="status-select"
                      >

                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Confirmed">
                          Confirmed
                        </option>

                        <option value="Processing">
                          Processing
                        </option>

                        <option value="Shipped">
                          Shipped
                        </option>

                        <option value="Out for Delivery">
                          Out for Delivery
                        </option>

                        <option value="Delivered">
                          Delivered
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>

                      </select>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AdminOrders;




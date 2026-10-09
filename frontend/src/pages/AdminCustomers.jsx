import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./AdminCustomers.css";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);

  const [summary, setSummary] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalSpent: 0
  });

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ======================================================
  // GET ADMIN TOKEN
  // ======================================================

  const getToken = () => {
    return localStorage.getItem(
      "tyohara-token"
    );
  };


  // ======================================================
  // FETCH CUSTOMERS
  // ======================================================

  const fetchCustomers = async () => {
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
        `${import.meta.env.VITE_API_URL}/api/customers`,
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
            "Failed to fetch customers."
        );
      }

      setCustomers(
        data.customers || []
      );

      setSummary(
        data.summary || {
          totalCustomers: 0,
          totalOrders: 0,
          totalSpent: 0
        }
      );

    } catch (error) {

      console.error(
        "Customer management error:",
        error
      );

      setError(
        error.message ||
          "Unable to load customers."
      );

    } finally {
      setLoading(false);
    }
  };


  // ======================================================
  // LOAD CUSTOMERS
  // ======================================================

  useEffect(() => {
    fetchCustomers();
  }, []);


  // ======================================================
  // SEARCH
  // ======================================================

  const filteredCustomers =
    customers.filter((customer) => {

      const searchText =
        search.toLowerCase().trim();

      if (!searchText) {
        return true;
      }

      return (
        customer.name
          ?.toLowerCase()
          .includes(searchText) ||

        customer.email
          ?.toLowerCase()
          .includes(searchText)
      );
    });


  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="admin-customers-page">

        <div className="admin-customers-loading">
          Loading customers...
        </div>

      </div>
    );
  }


  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="admin-customers-page">

      <div className="admin-customers-container">


        {/* ================================================
            HEADER
        ================================================= */}

        <div className="admin-customers-header">

          <div>

            <p className="customers-small-title">
              TYOHARA ADMIN
            </p>

            <h1>
              Customer Management
            </h1>

            <p>
              View registered customers and
              their order activity.
            </p>

          </div>


          <div className="customers-actions">

  <Link
    to="/admin/dashboard"
    className="customers-dashboard-button"
  >
     Dashboard
  </Link>

</div>

        </div>


        {/* ================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="customers-error">
            {error}
          </div>
        )}


        {/* ================================================
            SUMMARY
        ================================================= */}

        <div className="customers-summary-grid">

          <div className="customers-summary-card">

            <span>
              Total Customers
            </span>

            <strong>
              {summary.totalCustomers}
            </strong>

            <small>
              Registered customer accounts
            </small>

          </div>


          <div className="customers-summary-card">

            <span>
              Total Orders
            </span>

            <strong>
              {summary.totalOrders}
            </strong>

            <small>
              Orders from customers
            </small>

          </div>


          <div className="customers-summary-card">

            <span>
              Total Customer Spending
            </span>

            <strong>
              {summary.totalSpent}
            </strong>

            <small>
              Combined order value
            </small>

          </div>

        </div>


        {/* ================================================
            SEARCH
        ================================================= */}

        <div className="customers-search-section">

          <div>

            <p className="search-small-title">
              CUSTOMER DIRECTORY
            </p>

            <h2>
              All Customers
            </h2>

          </div>


          <div className="customers-search-box">

            <span>
              
            </span>

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>


        {/* ================================================
            CUSTOMER TABLE
        ================================================= */}

        <div className="customers-table-container">

          <table className="customers-table">

            <thead>

              <tr>

                <th>
                  Customer
                </th>

                <th>
                  Email
                </th>

                <th>
                  Account Type
                </th>

                <th>
                  Orders
                </th>

                <th>
                  Total Spent
                </th>

                <th>
                  Registered
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredCustomers.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="no-customers"
                  >
                    {search
                      ? "No customers found for your search."
                      : "No customers found."}
                  </td>

                </tr>

              ) : (

                filteredCustomers.map(
                  (customer) => (

                    <tr
                      key={customer.id}
                    >

                      {/* CUSTOMER */}

                      <td>

                        <div className="customer-name-cell">

                          <div className="customer-avatar">
                            {customer.name
                              ?.charAt(0)
                              ?.toUpperCase() || "?"}
                          </div>

                          <div>

                            <strong>
                              {customer.name}
                            </strong>

                            <span>
                              Customer ID:{" "}
                              {String(
                                customer.id
                              ).slice(-8)}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td>

                        <span className="customer-email">
                          {customer.email}
                        </span>

                      </td>


                      {/* ROLE */}

                      <td>

                        <span className="customer-role">
                          {customer.role}
                        </span>

                      </td>


                      {/* ORDERS */}

                      <td>

                        <strong className="customer-order-count">
                          {customer.orderCount}
                        </strong>

                      </td>


                      {/* TOTAL SPENT */}

                      <td>

                        <strong className="customer-spending">
                          {customer.totalSpent}
                        </strong>

                      </td>


                      {/* DATE */}

                      <td>

                        <span className="customer-date">
                          {formatDate(
                            customer.createdAt
                          )}
                        </span>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>


        {/* ================================================
            RESULT COUNT
        ================================================= */}

        <div className="customers-result-count">

          Showing{" "}
          <strong>
            {filteredCustomers.length}
          </strong>{" "}
          of{" "}
          <strong>
            {customers.length}
          </strong>{" "}
          customers

        </div>

      </div>

    </div>
  );
}

export default AdminCustomers;




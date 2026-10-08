import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The secret key saved when the order was placed lets this
    // browser see the full order details without logging in.
    let key = "";

    try {
      const lastOrder = JSON.parse(
        localStorage.getItem("giftwala-last-order") || "null"
      );

      if (lastOrder?.orderId === id && lastOrder.accessKey) {
        key = lastOrder.accessKey;
      }
    } catch (error) {
      console.error("Could not read saved order:", error);
    }

    const token = localStorage.getItem("giftwala-token");

    fetch(
      `${import.meta.env.VITE_API_URL}/api/orders/${encodeURIComponent(id)}${
        key ? `?key=${encodeURIComponent(key)}` : ""
      }`,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {}
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Order not found");
        }

        return response.json();
      })
      .then((data) => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching order:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="order-not-found">
        <h1>Loading Order...</h1>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <h1>Order Not Found</h1>

        <p>
          We could not find your order details.
        </p>

        <Link to="/shop">
          Continue Shopping 
        </Link>
      </div>
    );
  }

  return (
    <div className="order-success-page">

      <div className="success-card">

        <div className="success-icon">
  &#10003;
</div>

        <p className="success-label">
          THANK YOU FOR SHOPPING WITH TYOHARA
        </p>

        <h1>
          Order Placed Successfully!
        </h1>

        <p className="success-message">
          Your gift order has been placed successfully.
          We will start preparing your order soon.
        </p>

        <div className="order-number">
          <span>Order ID</span>

          <strong>
            {order.orderId}
          </strong>
        </div>

        {/* Order Status */}

        <div className="order-status-box">

          <span>Order Status</span>

          <strong>
            {order.status}
          </strong>

        </div>

        <div className="success-details">

          <div>
            <span>Total Amount</span>
            <strong>&#8377;{Number(order.total).toLocaleString("en-IN")}</strong>
          </div>

          <div>
            <span>Payment Method</span>

            <strong>
              {order.paymentMethod}
              {order.paymentStatus === "Paid" ? " (Paid)" : ""}
            </strong>
          </div>

          <div>
            <span>Estimated Delivery</span>

            <strong>
              3 Business Days
            </strong>
          </div>

        </div>

        <div className="delivery-address">

          <h3>Delivery Address</h3>

          <p>
            {order.customer.name}
          </p>

          {order.customer.address ? (
            <>
              <p>
                {order.customer.address}
              </p>

              <p>
                {order.customer.city},{" "}
                {order.customer.state} -{" "}
                {order.customer.pincode}
              </p>

              <p>
                {order.customer.phone}
              </p>
            </>
          ) : (
            <p>
              {order.customer.city},{" "}
              {order.customer.state}
            </p>
          )}

        </div>

        <div className="success-buttons">

          <Link
            to="/shop"
            className="success-primary"
          >
            Continue Shopping 
          </Link>

          <Link
            to="/"
            className="success-secondary"
          >
            Back to Home
          </Link>

        </div>

      </div>

    </div>
  );
}

export default OrderSuccess;




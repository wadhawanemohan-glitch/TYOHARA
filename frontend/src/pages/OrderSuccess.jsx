import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`)
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

        <div className="success-icon">`r`n            &#10003;`r`n          </div>

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
              {order.paymentMethod === "cod"
                ? "Cash on Delivery"
                : "Online Payment"}
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




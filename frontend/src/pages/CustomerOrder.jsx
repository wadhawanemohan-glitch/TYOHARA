import { useState } from "react";
import "./CustomerOrder.css";

function CustomerOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchOrder = async (event) => {
    event.preventDefault();

    if (!orderId.trim()) {
      setError("Please enter your Order ID.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId.trim()}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Order not found");
      }

      setOrder(data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Order not found. Please check your Order ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-order-page">

      <div className="customer-order-header">
        <p>TYOHARA</p>
        <h1>Track Your Order</h1>
        <span>
          Enter your Order ID to check your order status.
        </span>
      </div>

      <form
        className="order-search-form"
        onSubmit={searchOrder}
      >
        <input
          type="text"
          placeholder="Enter Order ID e.g. GW03590134"
          value={orderId}
          onChange={(event) =>
            setOrderId(event.target.value)
          }
        />

        <button type="submit">
          {loading ? "Searching..." : "Track Order"}
        </button>
      </form>

      {error && (
        <div className="order-error">
          {error}
        </div>
      )}

      {order && (
        <div className="customer-order-card">

          <div className="customer-order-top">
            <div>
              <span>Order ID</span>
              <strong>{order.orderId}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong className="order-status">
                {order.status}
              </strong>
            </div>
          </div>

          <div className="customer-order-info">

            <div>
              <span>Customer</span>
              <strong>{order.customer.name}</strong>
            </div>

            <div>
              <span>Payment</span>
              <strong>
                {order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </strong>
            </div>

            <div>
              <span>Total Amount</span>
              <strong>{order.total}</strong>
            </div>

          </div>

          <div className="customer-order-items">

            <h2>Order Items</h2>

            {order.items.map((item) => (
              <div
                className="customer-order-item"
                key={item.productId}
              >
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.price}  {item.quantity}
                  </span>
                </div>

                <strong>
                  {item.price * item.quantity}
                </strong>
              </div>
            ))}

          </div>

          <div className="customer-delivery">

            <h2>Delivery Address</h2>

            <p>{order.customer.name}</p>

            <p>{order.customer.address}</p>

            <p>
              {order.customer.city},{" "}
              {order.customer.state} -{" "}
              {order.customer.pincode}
            </p>

            <p> {order.customer.phone}</p>

          </div>

          <div className="customer-order-totals">

            <div>
              <span>Subtotal</span>
              <strong>{order.subtotal}</strong>
            </div>

            <div>
              <span>Delivery</span>
              <strong>
                {order.delivery === 0
                  ? "FREE"
                  : `{order.delivery}`}
              </strong>
            </div>

            <div className="grand-total">
              <span>Total</span>
              <strong>{order.total}</strong>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default CustomerOrder;







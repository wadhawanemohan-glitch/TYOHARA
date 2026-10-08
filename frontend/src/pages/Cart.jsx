
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Cart.css";

function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛍️</div>

        <h1>Your Cart is Empty</h1>

        <p>
          Looks like you haven't added any gifts yet.
        </p>

        <Link to="/shop" className="shop-now-button">
          Start Shopping
        </Link>
      </div>
    );
  }

  const deliveryCharge = cartTotal >= 1000 ? 0 : 60;
  const finalTotal = cartTotal + deliveryCharge;

  return (
    <div className="cart-page">
      {/* Header */}
      <div className="cart-header">
        <p>YOUR SHOPPING BAG</p>
        <h1>Your Cart</h1>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          {cartItems.map((item) => (
            <div className="cart-item" key={item.productId ?? item.id}>
              <div className="cart-item-image">
                <img
                  src={item.image}
                  alt={item.name}
                />
              </div>

              <div className="cart-item-info">
                <span>{item.type}</span>

                <h2>{item.name}</h2>

                <p>{formatPrice(item.price)}</p>

                <button
                  className="remove-button"
                  onClick={() => removeFromCart(item.productId ?? item.id)}
                >
                  Remove
                </button>
              </div>

              <div className="cart-item-actions">
                <div className="cart-quantity">
                  <button
                    onClick={() => decreaseQuantity(item.productId ?? item.id)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.productId ?? item.id)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <strong>
                  {formatPrice(item.price * item.quantity)}
                </strong>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>

          <div className="summary-row">
            <span>Delivery</span>

            <strong>
              {deliveryCharge === 0
                ? "FREE"
                : formatPrice(deliveryCharge)}
            </strong>
          </div>

          {deliveryCharge > 0 && (
            <p className="free-delivery-message">
              Add {formatPrice(1000 - cartTotal)} more for FREE delivery.
            </p>
          )}

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(finalTotal)}</strong>
          </div>

          <Link
            to="/checkout"
            className="checkout-button"
          >
            Proceed to Checkout
          </Link>

          <Link
            to="/shop"
            className="continue-shopping-button"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;
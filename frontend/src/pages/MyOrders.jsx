import { useEffect, useState } from "react";

import {
  Link
} from "react-router-dom";

import "./MyOrders.css";


const MyOrders = () => {

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // Review popup states
  const [showReviewForm, setShowReviewForm] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [rating, setRating] =
    useState(0);

  const [review, setReview] =
    useState("");

  const [reviewLoading, setReviewLoading] =
    useState(false);

  const [reviewError, setReviewError] =
    useState("");

  const [reviewSuccess, setReviewSuccess] =
    useState("");


  // =====================================================
  // FETCH MY ORDERS
  // =====================================================

  const fetchOrders = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "giftwala-token"
        );


      if (!token) {

        setError(
          "Please login to view your orders."
        );

        setLoading(false);

        return;
      }


      const user =
  JSON.parse(
    localStorage.getItem(
      "giftwala-user"
    )
  );

if (!user?.email) {
  throw new Error(
    "Please login to view your orders."
  );
}

const response =
  await fetch(
    `${import.meta.env.VITE_API_URL}/api/orders/customer/${encodeURIComponent(
      user.email
    )}`
  );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to fetch orders"
        );
      }


      setOrders(
        data.orders || []
      );


    } catch (error) {

      console.error(
        "Fetch orders error:",
        error
      );

      setError(
        error.message
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchOrders();

  }, []);


  // =====================================================
  // OPEN REVIEW FORM
  // =====================================================

  const handleOpenReview = async (
    order,
    product
  ) => {

    try {

      setReviewError("");
      setReviewSuccess("");

      setRating(0);
      setReview("");

      setSelectedOrder(order);
      setSelectedProduct(product);


      const token =
        localStorage.getItem(
          "giftwala-token"
        );


      const response =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/reviews/check/${product.productId}/${order.orderId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to check review status"
        );
      }


      if (data.reviewed) {

        setReviewError(
          "You have already reviewed this product for this order."
        );

        setShowReviewForm(true);

        return;
      }


      if (!data.canReview) {

        setReviewError(
          data.message ||
          "This product cannot be reviewed yet."
        );

        setShowReviewForm(true);

        return;
      }


      setShowReviewForm(true);

    } catch (error) {

      console.error(
        "Review check error:",
        error
      );

      setReviewError(
        error.message
      );

      setShowReviewForm(true);
    }
  };


  // =====================================================
  // CLOSE REVIEW FORM
  // =====================================================

  const handleCloseReview = () => {

    setShowReviewForm(false);

    setSelectedProduct(null);

    setSelectedOrder(null);

    setRating(0);

    setReview("");

    setReviewError("");

    setReviewSuccess("");
  };


  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleSubmitReview = async (
    event
  ) => {

    event.preventDefault();


    setReviewError("");
    setReviewSuccess("");


    if (rating === 0) {

      setReviewError(
        "Please select a rating."
      );

      return;
    }


    if (!review.trim()) {

      setReviewError(
        "Please write a review."
      );

      return;
    }


    try {

      setReviewLoading(true);


      const token =
        localStorage.getItem(
          "giftwala-token"
        );


      const response =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/reviews`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body:
              JSON.stringify({
                productId:
                  selectedProduct.productId,

                orderId:
                  selectedOrder.orderId,

                rating:
                  rating,

                review:
                  review.trim()
              })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to submit review"
        );
      }


      setReviewSuccess(
        "Review submitted successfully! ?"
      );


      setTimeout(() => {

        handleCloseReview();

      }, 1500);


    } catch (error) {

      console.error(
        "Submit review error:",
        error
      );

      setReviewError(
        error.message
      );

    } finally {

      setReviewLoading(false);

    }
  };


  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {

    return `{Number(
      price || 0
    ).toLocaleString("en-IN")}`;

  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

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


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="my-orders-page">

        <div className="my-orders-container">

          <div className="orders-loading">
            Loading your orders...
          </div>

        </div>

      </div>
    );

  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div className="my-orders-page">

      <div className="my-orders-container">


        {/* HEADER */}

        <div className="my-orders-header">

          <div>

            <p className="orders-small-title">
              TYOHARA
            </p>

            <h1>
              My Orders
            </h1>

            <p>
              Track your orders and review
              products you have received.
            </p>

          </div>


          <Link
            to="/shop"
            className="orders-shop-button"
          >
            Continue Shopping
          </Link>

        </div>


        {/* ERROR */}

        {error && (

          <div className="orders-error">
            {error}
          </div>

        )}


        {/* NO ORDERS */}

        {!error &&
          orders.length === 0 && (

            <div className="no-orders">

              <div className="no-orders-icon">
                
              </div>

              <h2>
                No Orders Yet
              </h2>

              <p>
                You haven't placed any orders yet.
              </p>

              <Link
                to="/shop"
                className="orders-shop-button"
              >
                Start Shopping
              </Link>

            </div>

          )}


        {/* ORDERS */}

        <div className="orders-list">

          {orders.map(
            (order) => (

              <div
                className="order-card"
                key={
                  order._id ||
                  order.orderId
                }
              >


                {/* ORDER HEADER */}

                <div className="order-card-header">

                  <div>

                    <span>
                      Order ID
                    </span>

                    <strong>
                      #{order.orderId}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Order Date
                    </span>

                    <strong>
                      {formatDate(
                        order.orderDate
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Total
                    </span>

                    <strong>
                      {formatPrice(
                        order.total
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Status
                    </span>

                    <strong
                      className={
                        `order-status status-${String(
                          order.status || ""
                        )
                          .toLowerCase()
                          .replaceAll(
                            " ",
                            "-"
                          )}`
                      }
                    >
                      {order.status}
                    </strong>

                  </div>

                </div>


                {/* PRODUCTS */}

                <div className="order-products">

                  {order.items?.map(
                    (item, index) => (

                      <div
                        className="order-product"
                        key={
                          `${order.orderId}-${item.productId}-${index}`
                        }
                      >

                        <div className="order-product-icon">
                          
                        </div>


                        <div className="order-product-info">

                          <Link
                            to={`/product/${item.productId}`}
                            className="order-product-name"
                          >
                            {item.name}
                          </Link>

                          <span>
                            Quantity:{" "}
                            {item.quantity}
                          </span>

                          <strong>
                            {formatPrice(
                              item.price
                            )}
                          </strong>

                        </div>


                        {/* REVIEW BUTTON */}

                        {order.status ===
                          "Delivered" && (

                          <button
                            type="button"
                            className="rate-review-button"
                            onClick={() =>
                              handleOpenReview(
                                order,
                                item
                              )
                            }
                          >
                            ? Rate & Review
                          </button>

                        )}

                      </div>

                    )
                  )}

                </div>


                {/* ORDER FOOTER */}

                <div className="order-card-footer">

                  <span>
                    Payment:{" "}
                    <strong>
                      {order.paymentMethod}
                    </strong>
                  </span>

                  <span>
                    Delivery:{" "}
                    <strong>
                      {formatPrice(
                        order.delivery
                      )}
                    </strong>
                  </span>

                </div>

              </div>

            )
          )}

        </div>

      </div>


      {/* =================================================
          REVIEW MODAL
          ================================================= */}

      {showReviewForm && (

        <div
          className="review-modal-overlay"
          onClick={handleCloseReview}
        >

          <div
            className="review-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            <button
              type="button"
              className="review-modal-close"
              onClick={handleCloseReview}
            >
              
            </button>


            <div className="review-modal-header">

              <div className="review-product-icon">
                
              </div>

              <div>

                <p>
                  RATE YOUR PRODUCT
                </p>

                <h2>
                  {selectedProduct?.name}
                </h2>

              </div>

            </div>


            {reviewError && (

              <div className="review-form-error">
                {reviewError}
              </div>

            )}


            {reviewSuccess && (

              <div className="review-form-success">
                {reviewSuccess}
              </div>

            )}


            {!reviewError.includes(
              "already reviewed"
            ) &&
              !reviewSuccess && (

              <form
                onSubmit={
                  handleSubmitReview
                }
              >

                {/* STAR RATING */}

                <div className="rating-section">

                  <label>
                    Your Rating
                  </label>

                  <div className="star-rating">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (

                        <button
                          type="button"
                          key={star}
                          className={
                            star <= rating
                              ? "star active"
                              : "star"
                          }
                          onClick={() =>
                            setRating(
                              star
                            )
                          }
                        >
                          
                        </button>

                      )
                    )}

                  </div>

                  {rating > 0 && (

                    <span className="rating-text">

                      {rating === 1 &&
                        "Poor"}

                      {rating === 2 &&
                        "Fair"}

                      {rating === 3 &&
                        "Good"}

                      {rating === 4 &&
                        "Very Good"}

                      {rating === 5 &&
                        "Excellent"}

                    </span>

                  )}

                </div>


                {/* REVIEW */}

                <div className="review-input-section">

                  <label>
                    Your Review
                  </label>

                  <textarea
                    value={review}
                    onChange={(event) =>
                      setReview(
                        event.target.value
                      )
                    }
                    placeholder="Share your experience with this product..."
                    rows="5"
                    maxLength="500"
                  />

                  <small>
                    {review.length}/500
                  </small>

                </div>


                {/* BUTTONS */}

                <div className="review-form-actions">

                  <button
                    type="button"
                    className="review-cancel-button"
                    onClick={
                      handleCloseReview
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="review-submit-button"
                    disabled={
                      reviewLoading
                    }
                  >
                    {reviewLoading
                      ? "Submitting..."
                      : "Submit Review ?"}
                  </button>

                </div>

              </form>

            )}


            {reviewError.includes(
              "already reviewed"
            ) && (

              <button
                type="button"
                className="review-cancel-button review-close-button"
                onClick={
                  handleCloseReview
                }
              >
                Close
              </button>

            )}

          </div>

        </div>

      )}

    </div>

  );
};


export default MyOrders;




import { useEffect, useState } from "react";

import {
  Link,
  useParams,
  useNavigate
} from "react-router-dom";

import { useCart } from "../context/CartContext";

import "./ProductDetails.css";


function ProductDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();


  const [product, setProduct] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [quantity, setQuantity] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);


  // =====================================================
  // FETCH PRODUCT
  // =====================================================

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        setLoading(true);

        const response =
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/products`
          );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        const data =
          await response.json();

        const foundProduct =
          data.products.find(
            (item) =>
              item.productId ===
              Number(id)
          );

        setProduct(foundProduct);

      } catch (error) {

        console.error(
          "Error fetching product:",
          error
        );

      } finally {

        setLoading(false);

      }
    };


    fetchProduct();

  }, [id]);


  // =====================================================
  // FETCH REVIEWS
  // =====================================================

  useEffect(() => {

    const fetchReviews = async () => {

      try {

        setReviewsLoading(true);

        const response =
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/reviews/product/${id}`
          );

        if (!response.ok) {

          throw new Error(
            "Failed to fetch reviews"
          );

        }

        const data =
          await response.json();

        setReviews(
          data.reviews || []
        );

      } catch (error) {

        console.error(
          "Error fetching reviews:",
          error
        );

        setReviews([]);

      } finally {

        setReviewsLoading(false);

      }
    };


    fetchReviews();

  }, [id]);


  // =====================================================
  // QUANTITY
  // =====================================================

  const increaseQuantity = () => {

    if (
      product &&
      quantity < product.stock
    ) {

      setQuantity(
        quantity + 1
      );

    }

  };


  const decreaseQuantity = () => {

    if (quantity > 1) {

      setQuantity(
        quantity - 1
      );

    }

  };


  // =====================================================
  // FORMAT REVIEW DATE
  // =====================================================

  const formatReviewDate = (date) => {

    if (!date) {
      return "";
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
  // STAR DISPLAY
  // =====================================================

  const renderStars = (rating) => {

    return (
      <span className="review-stars">

        {[1, 2, 3, 4, 5].map(
          (star) => (

            <span
              key={star}
              className={
                star <= rating
                  ? "review-star filled"
                  : "review-star empty"
              }
            >
              
            </span>

          )
        )}

      </span>
    );

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="product-not-found">

        <h1>
          Loading Product...
        </h1>

      </div>

    );

  }


  // =====================================================
  // PRODUCT NOT FOUND
  // =====================================================

  if (!product) {

    return (

      <div className="product-not-found">

        <h1>
          Product Not Found
        </h1>

        <p>
          Sorry, we could not find this product.
        </p>

        <Link
          to="/shop"
          className="back-to-shop"
        >
           Back to Shop
        </Link>

      </div>

    );

  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div className="product-details-page">


      {/* =========================================
          BREADCRUMB
      ========================================= */}

      <div className="product-breadcrumb">

        <Link to="/">
          Home
        </Link>

        <span>
          /
        </span>

        <Link to="/shop">
          Shop
        </Link>

        <span>
          /
        </span>

        <span>
          {product.name}
        </span>

      </div>


      {/* =========================================
          PRODUCT DETAILS
      ========================================= */}

      <section className="product-details-container">


        {/* PRODUCT IMAGE */}

        <div className="product-details-image">
         <img
  src={item.image}
  alt={item.name}
/>
        </div>


        {/* PRODUCT INFORMATION */}

        <div className="product-details-info">

          <span className="product-details-category">
            {product.type}
          </span>


          <h1>
            {product.name}
          </h1>


          {/* PRODUCT RATING */}

          <div className="product-details-rating">

            {renderStars(
              Number(product.rating || 0)
            )}

            <strong>
              {Number(
                product.rating || 0
              ).toFixed(1)}
            </strong>

            <span>
              (
              {product.reviews || 0}
              {" "}
              reviews)
            </span>

          </div>


          {/* PRICE */}

          <div className="product-details-price">
            
            {Number(
              product.price || 0
            ).toLocaleString("en-IN")}
          </div>


          {/* DESCRIPTION */}

          <p className="product-details-description">
            {product.description}
          </p>


          {/* PRODUCT BENEFITS */}

          <div className="product-benefits">

            <div>

              

              <strong>
                Beautiful Packaging
              </strong>

              <span>
                Gift-ready packaging included
              </span>

            </div>


            <div>

              

              <strong>
                Secure Payment
              </strong>

              <span>
                Safe and secure checkout
              </span>

            </div>

          </div>


          {/* QUANTITY */}

          <div className="quantity-section">

            <span>
              Quantity
            </span>

            <div className="quantity-control">

              <button
                onClick={
                  decreaseQuantity
                }
              >
                
              </button>

              <span>
                {quantity}
              </span>

              <button
                onClick={
                  increaseQuantity
                }
              >
                +
              </button>

            </div>

            <small>
              {product.stock}
              {" "}
              items available
            </small>

          </div>


          {/* BUTTONS */}

          <div className="details-buttons">

            <button
              className="details-cart-button"
              onClick={() => {

                addToCart(
                  product,
                  quantity
                );

                navigate("/cart");

              }}
            >
              &#128722; Add to Cart
            </button>


            <button
              className="buy-now-button"
              onClick={() => {

                addToCart(
                  product,
                  quantity
                );

                navigate("/checkout");

              }}
            >
              Buy Now
            </button>

          </div>


          <Link
            to="/shop"
            className="continue-shopping"
          >
             Continue Shopping
          </Link>

        </div>

      </section>


      {/* =========================================
          CUSTOMER REVIEWS
      ========================================= */}

      <section className="customer-reviews-section">


        <div className="reviews-header">

          <div>

            <p className="reviews-small-title">
              CUSTOMER FEEDBACK
            </p>

            <h2>
              Customer Reviews
            </h2>

            <p>
              See what customers say about this product.
            </p>

          </div>


          {/* REVIEW SUMMARY */}

          <div className="reviews-summary">

            <div className="reviews-average">

              <strong>
                {Number(
                  product.rating || 0
                ).toFixed(1)}
              </strong>

              <span>
                out of 5
              </span>

            </div>


            <div>

              <div className="summary-stars">

                {renderStars(
                  Math.round(
                    Number(
                      product.rating || 0
                    )
                  )
                )}

              </div>

              <span className="summary-count">
                Based on{" "}
                {product.reviews || 0}
                {" "}
                review
                {Number(
                  product.reviews || 0
                ) !== 1
                  ? "s"
                  : ""}
              </span>

            </div>

          </div>

        </div>


        {/* REVIEWS */}

        {reviewsLoading ? (

          <div className="reviews-loading">
            Loading reviews...
          </div>

        ) : reviews.length === 0 ? (

          <div className="no-reviews">

            <div className="no-reviews-icon">
              ?
            </div>

            <h3>
              No Reviews Yet
            </h3>

            <p>
              Be the first customer to review this product.
            </p>

          </div>

        ) : (

          <div className="reviews-list">

            {reviews.map(
              (item) => (

                <div
                  className="review-card"
                  key={
                    item._id
                  }
                >

                  <div className="review-card-header">

                    <div className="review-customer">

                      <div className="customer-avatar">
                        {item.customerName
                          ?.charAt(0)
                          ?.toUpperCase() || "C"}
                      </div>

                      <div>

                        <strong>
                          {item.customerName}
                        </strong>

                        <span>
                          Verified Customer
                        </span>

                      </div>

                    </div>


                    <span className="review-date">
                      {formatReviewDate(
                        item.createdAt
                      )}
                    </span>

                  </div>


                  <div className="review-card-rating">

                    {renderStars(
                      Number(
                        item.rating
                      )
                    )}

                    <span>
                      {Number(
                        item.rating
                      ).toFixed(0)}/5
                    </span>

                  </div>


                  <p className="review-text">
                    "{item.review}"
                  </p>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </div>

  );

}


export default ProductDetails;





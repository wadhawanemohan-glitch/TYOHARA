import { useState } from "react";

import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

import "./Checkout.css";


function Checkout() {

  const {
    cartItems,
    cartTotal,
    clearCart
  } = useCart();


  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });


  const [paymentMethod, setPaymentMethod] =
    useState("cod");


  const [processingPayment, setProcessingPayment] =
    useState(false);


  const deliveryCharge =
    cartTotal >= 1000 ? 0 : 60;


  const finalTotal =
    cartTotal + deliveryCharge;


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {

    const {
      name,
      value
    } = event.target;


    setFormData({
      ...formData,
      [name]: value
    });

  };


  // =====================================================
  // PAYMENT METHOD CHANGE
  // =====================================================

  const handlePaymentChange = (event) => {

    setPaymentMethod(
      event.target.value
    );

  };


  // =====================================================
  // LOAD RAZORPAY CHECKOUT
  // =====================================================

  const loadRazorpay = () => {

    return new Promise((resolve) => {

      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );


      if (existingScript) {

        resolve(true);

        return;

      }


      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {

        resolve(true);

      };

      script.onerror = () => {

        resolve(false);

      };


      document.body.appendChild(script);

    });

  };


  // =====================================================
  // CREATE TYOHARA ORDER OBJECT
  // =====================================================

  const createOrderData = (
    orderId,
    selectedPayment
  ) => {

    return {

      orderId,

      customer: formData,

      items: cartItems.map(
        (item) => ({

          productId:
            item.productId,

          name:
            item.name,

          price:
            item.price,

          quantity:
            item.quantity

        })
      ),

      subtotal:
        cartTotal,

      delivery:
        deliveryCharge,

      total:
        finalTotal,

      paymentMethod:
        selectedPayment,

      orderDate:
        new Date().toISOString()

    };

  };


  // =====================================================
  // SAVE TYOHARA ORDER
  // =====================================================

  const saveOrder = async (
    order
  ) => {

    const response =
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify(order)

        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Failed to place order."
      );

    }


    return data;

  };


  // =====================================================
  // COD ORDER
  // =====================================================

  const handleCODOrder = async (
    orderId
  ) => {

    const order =
      createOrderData(
        orderId,
        "Cash on Delivery"
      );


    await saveOrder(order);


    localStorage.setItem(
      "giftwala-last-order",
      JSON.stringify(order)
    );


    clearCart();


    window.location.href =
      `/order-success/${orderId}`;

  };


  // =====================================================
  // RAZORPAY PAYMENT
  // =====================================================

  const handleOnlinePayment = async (
    orderId
  ) => {

    setProcessingPayment(true);


    try {

      // -------------------------------------------------
      // LOAD RAZORPAY SCRIPT
      // -------------------------------------------------

      const razorpayLoaded =
        await loadRazorpay();


      if (!razorpayLoaded) {

        throw new Error(
          "Razorpay Checkout could not be loaded."
        );

      }


      // -------------------------------------------------
      // CREATE RAZORPAY ORDER
      // -------------------------------------------------

      const razorpayResponse =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({
                amount: finalTotal
              })

          }
        );


      const razorpayData =
        await razorpayResponse.json();


      if (
        !razorpayResponse.ok ||
        !razorpayData.success
      ) {

        throw new Error(
          razorpayData.message ||
          "Unable to create payment order."
        );

      }


      // -------------------------------------------------
      // RAZORPAY CHECKOUT OPTIONS
      // -------------------------------------------------

      const options = {

        key:
          razorpayData.key,

        amount:
          razorpayData.order.amount,

        currency:
          razorpayData.order.currency,

        name:
          "TYOHARA",

        description:
          "Festival Gift Purchase",

        order_id:
          razorpayData.order.id,


        prefill: {

          name:
            formData.name,

          email:
            formData.email,

          contact:
            formData.phone

        },


        notes: {

          tyohara_order_id:
            orderId

        },


        theme: {

          color:
            "#8b5cf6"

        },


        handler:
          async function (
            response
          ) {

            try {

              // -----------------------------------------
              // VERIFY PAYMENT ON BACKEND
              // -----------------------------------------

              const verifyResponse =
                await fetch(
                  `${import.meta.env.VITE_API_URL}/api/payment/verify`,
                  {

                    method: "POST",

                    headers: {

                      "Content-Type":
                        "application/json"

                    },

                    body:
                      JSON.stringify({

                        razorpay_order_id:
                          response.razorpay_order_id,

                        razorpay_payment_id:
                          response.razorpay_payment_id,

                        razorpay_signature:
                          response.razorpay_signature

                      })

                  }
                );


              const verifyData =
                await verifyResponse.json();


              if (
                !verifyResponse.ok ||
                !verifyData.success
              ) {

                throw new Error(
                  verifyData.message ||
                  "Payment verification failed."
                );

              }


              // -----------------------------------------
              // SAVE TYOHARA ORDER
              // -----------------------------------------

              const order =
                createOrderData(
                  orderId,
                  paymentMethod === "upi"
                    ? "UPI"
                    : "Credit / Debit Card"
                );


              await saveOrder(order);


              // -----------------------------------------
              // SAVE LAST ORDER
              // -----------------------------------------

              localStorage.setItem(
                "giftwala-last-order",
                JSON.stringify({

                  ...order,

                  razorpayOrderId:
                    response.razorpay_order_id,

                  razorpayPaymentId:
                    response.razorpay_payment_id

                })
              );


              // -----------------------------------------
              // CLEAR CART
              // -----------------------------------------

              clearCart();


              // -----------------------------------------
              // ORDER SUCCESS
              // -----------------------------------------

              window.location.href =
                `/order-success/${orderId}`;

            } catch (error) {

              console.error(
                "Payment verification error:",
                error
              );


              alert(
                error.message ||
                "Payment verification failed."
              );


              setProcessingPayment(false);

            }

          },


        modal: {

          ondismiss:
            function () {

              setProcessingPayment(false);

            }

        }

      };


      const razorpay =
        new window.Razorpay(
          options
        );


      razorpay.on(
        "payment.failed",
        function (response) {

          console.error(
            "Razorpay payment failed:",
            response.error
          );


          alert(
            response.error?.description ||
            "Payment failed. Please try again."
          );


          setProcessingPayment(false);

        }
      );


      razorpay.open();


    } catch (error) {

      console.error(
        "Razorpay error:",
        error
      );


      alert(
        error.message ||
        "Unable to start payment."
      );


      setProcessingPayment(false);

    }

  };


  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    if (processingPayment) {

      return;

    }


    const orderId =
      "GW" +
      Date.now()
        .toString()
        .slice(-8);


    try {

      // -------------------------------------------------
      // CASH ON DELIVERY
      // -------------------------------------------------

      if (
        paymentMethod === "cod"
      ) {

        await handleCODOrder(
          orderId
        );

        return;

      }


      // -------------------------------------------------
      // RAZORPAY
      // -------------------------------------------------

      await handleOnlinePayment(
        orderId
      );

    } catch (error) {

      console.error(
        "Order creation failed:",
        error
      );


      alert(
        error.message ||
        "Unable to place order. Please try again."
      );


      setProcessingPayment(false);

    }

  };


  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cartItems.length === 0) {

    return (

      <div className="checkout-empty">

        <h1>
          Your cart is empty 🛒
        </h1>

        <p>
          Please add a gift before
          proceeding to checkout.
        </p>

        <Link to="/shop">
          Continue Shopping →
        </Link>

      </div>

    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="checkout-page">


      {/* HEADER */}

      <div className="checkout-header">

        <p>
          SAFE & SECURE CHECKOUT
        </p>

        <h1>
          Complete Your Order
        </h1>

      </div>


      <div className="checkout-layout">


        {/* =================================================
            CUSTOMER DETAILS
        ================================================= */}

        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >


          {/* CONTACT INFORMATION */}

          <div className="checkout-section">

            <h2>
              1. Contact Information
            </h2>


            <div className="form-grid">


              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />

              </div>


            </div>


            <div className="form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />

            </div>

          </div>


          {/* =================================================
              DELIVERY ADDRESS
          ================================================= */}

          <div className="checkout-section">

            <h2>
              2. Delivery Address
            </h2>


            <div className="form-group">

              <label>
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House No, Street, Area"
                rows="4"
                required
              />

            </div>


            <div className="form-grid">


              <div className="form-group">

                <label>
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                />

              </div>

            </div>


            <div className="form-group">

              <label>
                PIN Code
              </label>

              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6-digit PIN code"
                maxLength="6"
                required
              />

            </div>

          </div>


          {/* =================================================
              PAYMENT METHOD
          ================================================= */}

          <div className="checkout-section">

            <h2>
              3. Payment Method
            </h2>


            {/* COD */}

            <label
              className={`payment-option ${
                paymentMethod === "cod"
                  ? "payment-selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="payment"
                value="cod"
                checked={
                  paymentMethod === "cod"
                }
                onChange={
                  handlePaymentChange
                }
              />


              <div className="payment-option-content">

                <div className="payment-icon">
                  💵
                </div>


                <div>

                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay when your gift is delivered
                  </span>

                </div>

              </div>

            </label>


            {/* UPI */}

            <label
              className={`payment-option ${
                paymentMethod === "upi"
                  ? "payment-selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="payment"
                value="upi"
                checked={
                  paymentMethod === "upi"
                }
                onChange={
                  handlePaymentChange
                }
              />


              <div className="payment-option-content">

                <div className="payment-icon">
                  📱
                </div>


                <div>

                  <strong>
                    UPI
                  </strong>

                  <span>
                    Pay securely with Razorpay
                  </span>

                </div>

              </div>

            </label>


            {/* CARD */}

            <label
              className={`payment-option ${
                paymentMethod === "card"
                  ? "payment-selected"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="payment"
                value="card"
                checked={
                  paymentMethod === "card"
                }
                onChange={
                  handlePaymentChange
                }
              />


              <div className="payment-option-content">

                <div className="payment-icon">
                  💳
                </div>


                <div>

                  <strong>
                    Credit / Debit Card
                  </strong>

                  <span>
                    Pay securely with Razorpay
                  </span>

                </div>

              </div>

            </label>


            {/* SECURITY NOTE */}

            <div className="payment-security-note">

              🔒

              <span>
                Payments are securely processed by Razorpay.
                TYOHARA does not store card or CVV details.
              </span>

            </div>


          </div>


          {/* =================================================
              PLACE ORDER
          ================================================= */}

          <button
            type="submit"
            className="place-order-button"
            disabled={processingPayment}
          >

            {processingPayment
              ? "Processing Payment..."
              : `Place Order ₹${Number(
                  finalTotal
                ).toLocaleString("en-IN")} →`}

          </button>


        </form>


        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <div className="checkout-summary">

          <h2>
            Your Order
          </h2>


          {cartItems.map(
            (item) => (

              <div
                className="checkout-product"
                key={item.id}
              >

                <div className="checkout-product-image">

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                </div>


                <div>

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    Qty: {item.quantity}
                  </p>

                </div>


                <strong>

                  ₹
                  {Number(
                    item.price *
                    item.quantity
                  ).toLocaleString("en-IN")}

                </strong>

              </div>

            )
          )}


          <div className="checkout-summary-row">

            <span>
              Subtotal
            </span>

            <strong>
              ₹
              {Number(
                cartTotal
              ).toLocaleString("en-IN")}
            </strong>

          </div>


          <div className="checkout-summary-row">

            <span>
              Delivery
            </span>

            <strong>

              {deliveryCharge === 0
                ? "FREE"
                : `₹${Number(
                    deliveryCharge
                  ).toLocaleString("en-IN")}`}

            </strong>

          </div>


          <div className="checkout-total">

            <span>
              Total
            </span>

            <strong>
              ₹
              {Number(
                finalTotal
              ).toLocaleString("en-IN")}
            </strong>

          </div>


          <Link
            to="/cart"
            className="back-cart"
          >

            ← Back to Cart

          </Link>


        </div>


      </div>

    </div>

  );

}


export default Checkout;
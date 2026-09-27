import { useState } from "react";

import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

import QRCode from "react-qr-code";

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


  const [paymentDetails, setPaymentDetails] =
    useState({
      upiId: "",
      cardNumber: "",
      cardName: "",
      expiry: "",
      cvv: ""
    });


  const deliveryCharge =
    cartTotal >= 1000 ? 0 : 60;

  const finalTotal =
    cartTotal + deliveryCharge;


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


  const handlePaymentChange = (event) => {

    setPaymentMethod(
      event.target.value
    );

  };


  const handlePaymentDetailsChange = (
    event
  ) => {

    const {
      name,
      value
    } = event.target;

    setPaymentDetails({
      ...paymentDetails,
      [name]: value
    });

  };


  const handleSubmit = async (event) => {

    event.preventDefault();


    /*
      Validate UPI
    */

    if (paymentMethod === "upi") {

      if (!paymentDetails.upiId.trim()) {

        alert(
          "Please enter your UPI ID."
        );

        return;
      }

    }


    /*
      Validate Card
    */

    if (paymentMethod === "card") {

      if (
        !paymentDetails.cardNumber.trim() ||
        !paymentDetails.cardName.trim() ||
        !paymentDetails.expiry.trim() ||
        !paymentDetails.cvv.trim()
      ) {

        alert(
          "Please enter all card details."
        );

        return;
      }

    }


    const orderId =
      "GW" +
      Date.now()
        .toString()
        .slice(-8);


    /*
      Only payment method is saved.
      Card number, CVV and UPI ID
      are NOT saved in MongoDB.
    */

    let selectedPayment = "";


    if (paymentMethod === "cod") {

      selectedPayment =
        "Cash on Delivery";

    }


    if (paymentMethod === "upi") {

      selectedPayment =
        "UPI";

    }


    if (paymentMethod === "card") {

      selectedPayment =
        "Credit / Debit Card";

    }


    const order = {

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


    try {

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
          "Failed to place order"
        );

      }


      localStorage.setItem(
        "giftwala-last-order",
        JSON.stringify(order)
      );


      clearCart();


      window.location.href =
        `/order-success/${orderId}`;


    } catch (error) {

      console.error(
        "Order creation failed:",
        error
      );

      alert(
        "Unable to place order. Please try again."
      );

    }

  };


  if (cartItems.length === 0) {

    return (

      <div className="checkout-empty">

        <h1>
          Your cart is empty &#128722;
        </h1>

        <p>
          Please add a gift before
          proceeding to checkout.
        </p>

        <Link to="/shop">
          Continue Shopping 
        </Link>

      </div>

    );

  }


  return (

    <div className="checkout-page">


      <div className="checkout-header">

        <p>
          SAFE & SECURE CHECKOUT
        </p>

        <h1>
          Complete Your Order
        </h1>

      </div>


      <div className="checkout-layout">


        {/* CUSTOMER DETAILS */}

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


          {/* DELIVERY ADDRESS */}

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


          {/* PAYMENT METHOD */}

          <div className="checkout-section">

            <h2>
              3. Payment Method
            </h2>


            {/* CASH ON DELIVERY */}

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
                  
                </div>


                <div>

                  <strong>
                    UPI
                  </strong>

                  <span>
                    Pay using UPI ID
                  </span>

                </div>

              </div>

            </label>


            {/* UPI DETAILS */}

            {paymentMethod === "upi" && (

  <div className="payment-details-box upi-payment-box">

    <div className="upi-payment-content">

      <div className="upi-qr-section">

        <QRCode
          value={`upi://pay?pa=tyoharagifts@upi&pn=TYOHARA&am=${finalTotal}&cu=INR`}
          size={180}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
        />

      </div>


      <div className="upi-payment-info">

        <h3>
          Scan QR Code to Pay
        </h3>

        <p>
          Open Google Pay, PhonePe, Paytm,
          BHIM or another UPI app and scan this QR code.
        </p>


        <div className="upi-amount">

          <span>
            Amount
          </span>

          <strong>
            {finalTotal}
          </strong>

        </div>


        <div className="upi-id-display">

          <span>
            UPI ID
          </span>

          <strong>
            tyoharagifts@upi
          </strong>

        </div>


        <small className="upi-instruction">
          After successful payment, click
          "Place Order" below.
        </small>

      </div>

    </div>

  </div>

)}


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
                  
                </div>


                <div>

                  <strong>
                    Credit / Debit Card
                  </strong>

                  <span>
                    Pay securely using your card
                  </span>

                </div>

              </div>

            </label>


            {/* CARD DETAILS */}

            {paymentMethod === "card" && (

              <div className="payment-details-box">


                <div className="form-group">

                  <label>
                    Card Number
                  </label>

                  <input
                    type="text"
                    name="cardNumber"
                    value={
                      paymentDetails.cardNumber
                    }
                    onChange={
                      handlePaymentDetailsChange
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    inputMode="numeric"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Card Holder Name
                  </label>

                  <input
                    type="text"
                    name="cardName"
                    value={
                      paymentDetails.cardName
                    }
                    onChange={
                      handlePaymentDetailsChange
                    }
                    placeholder="Name on card"
                  />

                </div>


                <div className="card-details-grid">

                  <div className="form-group">

                    <label>
                      Expiry Date
                    </label>

                    <input
                      type="text"
                      name="expiry"
                      value={
                        paymentDetails.expiry
                      }
                      onChange={
                        handlePaymentDetailsChange
                      }
                      placeholder="MM/YY"
                      maxLength="5"
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      CVV
                    </label>

                    <input
                      type="password"
                      name="cvv"
                      value={
                        paymentDetails.cvv
                      }
                      onChange={
                        handlePaymentDetailsChange
                      }
                      placeholder="123"
                      maxLength="4"
                      inputMode="numeric"
                    />

                  </div>

                </div>


                <small>
                   Card details are not stored by TYOHARA.
                </small>


              </div>

            )}


            <div className="payment-security-note">

              

              <span>
                Your payment information is kept secure.
              </span>

            </div>


          </div>


          {/* PLACE ORDER */}

          <button
            type="submit"
            className="place-order-button"
          >

            Place Order 
            {finalTotal}
            {" "}
            

          </button>


        </form>


        {/* ORDER SUMMARY */}

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
                  
                  {item.price *
                    item.quantity}
                </strong>

              </div>

            )
          )}


          <div className="checkout-summary-row">

            <span>
              Subtotal
            </span>

            <strong>
              {cartTotal}
            </strong>

          </div>


          <div className="checkout-summary-row">

            <span>
              Delivery
            </span>

            <strong>
  {deliveryCharge === 0
    ? "FREE"
    : `?${deliveryCharge}`}
</strong>

          </div>


          <div className="checkout-total">

            <span>
              Total
            </span>

            <strong>
              {finalTotal}
            </strong>

          </div>


          <Link
            to="/cart"
            className="back-cart"
          >

             Back to Cart

          </Link>


        </div>

      </div>

    </div>

  );

}


export default Checkout;






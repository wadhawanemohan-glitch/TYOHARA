import AdminProductForm from "./pages/AdminProductForm";
import AdminProducts from "./pages/AdminProducts";
import AdminCustomers from "./pages/AdminCustomers";
import AdminDashboard from "./pages/AdminDashboard";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useCart } from "./context/CartContext";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import AdminOrders from "./pages/AdminOrders";
import CustomerOrder from "./pages/CustomerOrder";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import AdminLogin from "./pages/AdminLogin";

import "./App.css";


// ======================================================
// HOME PAGE
// ======================================================

function Home() {
  const navigate = useNavigate();

  const { addToCart, cartCount } = useCart();

  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);


  // ====================================================
  // LOAD LOGGED-IN USER
  // ====================================================

  useEffect(() => {
    const savedUser =
      localStorage.getItem("tyohara-user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error(
          "Error reading saved user:",
          error
        );

        localStorage.removeItem(
          "tyohara-user"
        );
      }
    }
  }, []);


  // ====================================================
  // GET PRODUCTS FROM MONGODB
  // ====================================================

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_API_URL}/api/products`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        return response.json();
      })
      .then((data) => {
        setProducts(
          data.products.slice(0, 4)
        );
      })
      .catch((error) => {
        console.error(
          "Error fetching home products:",
          error
        );
      });
  }, []);


  // ====================================================
  // ADD TO CART
  // ====================================================

  const handleAddToCart = (product) => {
    addToCart(product, 1);

    navigate("/cart");
  };


  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "tyohara-token"
    );

    localStorage.removeItem(
      "tyohara-user"
    );

    setUser(null);

    navigate("/");
  };


  // ====================================================
  // HOME UI
  // ====================================================

  return (
    <div className="app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">

        <Link
          to="/"
          className="logo"
        >
           <span>TYOHARA</span>
        </Link>


        {/* NAVIGATION */}

        <nav
          className={menuOpen ? "nav open" : "nav"}
          onClick={() => setMenuOpen(false)}
        >

          <Link to="/">
            Home
          </Link>

          <Link to="/shop">
            Shop
          </Link>

          <a href="#festivals">
            Festivals
          </a>

          <a href="#personalized">
            Personalized Gifts
          </a>

          <Link to="/track-order">
            Track Order
          </Link>

        </nav>


        {/* HEADER ACTIONS */}

        <div className="header-actions">

          {/* MENU (phones) */}

          <button
            type="button"
            className="menu-toggle"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>


          {/* SEARCH */}

          <Link
            to="/shop?focus=search"
            className="icon-button"
            aria-label="Search gifts"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>


          {/* CART */}

          <Link
            to="/cart"
            className="cart-button"
          >
            &#128722;

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </Link>


          {/* USER / LOGIN */}

          {user ? (

  <div className="user-menu">

    <button
      type="button"
      className="user-menu-button"
      onClick={(event) => {
        const menu =
          event.currentTarget.nextElementSibling;

        menu.classList.toggle("show");
      }}
    >
       {user.name}
      <span className="dropdown-arrow">
        
      </span>
    </button>


    <div className="user-dropdown">

      <Link
        to="/profile"
        className="dropdown-item"
      >
         Profile
      </Link>

      <Link
        to="/my-orders"
        className="dropdown-item"
      >
         My Orders
      </Link>

      <button
        type="button"
        className="dropdown-item logout-item"
        onClick={handleLogout}
      >
         Logout
      </button>

    </div>

  </div>

) : (

  <Link
    to="/login"
    className="login-button"
  >
    Login
  </Link>

)}

        </div>
      </header>

      {/* =================================================
          HERO SECTION
      ================================================= */}

      <section
        className="hero"
        id="home"
      >

        <div className="hero-content">

          <p className="hero-small-title">
            MAKE EVERY MOMENT SPECIAL
          </p>

          <h1>
            Find the Perfect
            <br />

            <span>
              Gift for Everyone
            </span>
          </h1>

          <p className="hero-description">
            Beautiful gifts for every festival,
            celebration and special moment.
            Make someone smile today.
          </p>

          </div>



      </section>


      {/* =================================================
          FESTIVALS
      ================================================= */}

      <section
        className="festivals"
        id="festivals"
      >

        <div className="section-heading">

          <p>
            CELEBRATE EVERY OCCASION
          </p>

          <h2>
            Shop By Festival
          </h2>

          <span>
            Find something special for
            every celebration
          </span>

        </div>


        <div className="festival-grid">


          {/* DIWALI */}

          <Link
            to="/shop?category=Diwali"
            className="festival-card"
          >

            <div className="festival-icon">
              
            </div>

            <h3>
              Diwali
            </h3>

            <p>
              Festival of Lights
            </p>

          </Link>


          {/* RAKSHA BANDHAN */}

          <Link
            to="/shop?category=Raksha%20Bandhan"
            className="festival-card"
          >

            <div className="festival-icon">
              
            </div>

            <h3>
              Raksha Bandhan
            </h3>

            <p>
              Celebrate the Bond
            </p>

          </Link>


          {/* EID */}

          <Link
            to="/shop?category=Eid"
            className="festival-card"
          >

            <div className="festival-icon">
              
            </div>

            <h3>
              Eid
            </h3>

            <p>
              Share Happiness
            </p>

          </Link>


          {/* CHRISTMAS */}

          <Link
            to="/shop?category=Christmas"
            className="festival-card"
          >

            <div className="festival-icon">
              
            </div>

            <h3>
              Christmas
            </h3>

            <p>
              Season of Joy
            </p>

          </Link>


          {/* HOLI */}

          <Link
            to="/shop?category=Holi"
            className="festival-card"
          >

            <div className="festival-icon">
              
            </div>

            <h3>
              Holi
            </h3>

            <p>
              Festival of Colors
            </p>

          </Link>


          {/* NEW YEAR */}

          <Link
            to="/shop?category=New%20Year"
            className="festival-card"
          >

            <div className="festival-icon">
              
            </div>

            <h3>
              New Year
            </h3>

            <p>
              New Beginnings
            </p>

          </Link>

        </div>

      </section>


      {/* =================================================
          BEST SELLERS
      ================================================= */}

      <section
        className="products"
        id="shop"
      >

        <div className="section-heading">

          <p>
            OUR COLLECTION
          </p>

          <h2>
            Best Selling Gifts
          </h2>

          <span>
            Gifts that people love the most
          </span>

        </div>


        <div className="product-grid">

          {products.map((product) => (

            <div
              className="product-card"
              key={product.productId}
            >

              <div className="product-image">
  <img
    src={product.image}
    alt={product.name}
  />
</div>


              <div className="product-info">

                <span className="product-category">
                  {product.type}
                </span>

                <h3>
                  {product.name}
                </h3>


                <div className="rating">

                  &#9733; {product.rating}

                  <span>
                    {" "}
                    ({product.reviews})
                  </span>

                </div>


                <div className="price">
                  &#8377;{Number(product.price).toLocaleString("en-IN")}
                </div>


                <button
                  type="button"
                  className="add-button"
                  onClick={() =>
                    handleAddToCart(product)
                  }
                >
                  Add to Cart
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* =================================================
          WHY TYOHARA
      ================================================= */}

      <section
        className="why-us"
        id="personalized"
      >

        <div className="section-heading">

          <p>
            WHY CHOOSE US
          </p>

          <h2>
            Gifting Made Easy
          </h2>

        </div>


        <div className="features">


          <div className="feature">

            <div>&#128666;</div>

            <h3>
              Fast Delivery
            </h3>

            <p>
              Get your gifts delivered
              safely and on time.
            </p>

          </div>


          <div className="feature">

            <div>&#127873;</div>

            <h3>
              Beautiful Packaging
            </h3>

            <p>
              Every gift is packed
              beautifully with care.
            </p>

          </div>


          <div className="feature">

              <div>&#128274;</div>


            <h3>
              Secure Payment
            </h3>

            <p>
              Safe and secure payment
              for every order.
            </p>

          </div>


          <div className="feature">

            <div>&#10084;</div>

            <h3>
              Made With Love
            </h3>

            <p>
              We help you make every
              celebration memorable.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <div className="footer-logo">
           TYOHARA
        </div>

        <p>
          Making every celebration
          a little more special.
        </p>


        <div className="footer-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/shop">
            Shop
          </Link>

          <a href="#festivals">
            Festivals
          </a>

          <a href="#personalized">
            Personalized Gifts
          </a>

          <Link to="/track-order">
            Track Order
          </Link>

        </div>


        <div className="copyright">
          &copy; {new Date().getFullYear()} TYOHARA.
          All rights reserved.
        </div>

      </footer>

    </div>
  );
}


// ======================================================
// MAIN APP
// ======================================================

function App() {
  return (

    <BrowserRouter>

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* AUTH */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
  path="/my-orders"
  element={<MyOrders />}
/>

<Route
  path="/admin-login"
  element={<AdminLogin />}
/>

<Route
  path="/admin/products"
  element={<AdminProducts />}
/>

<Route
  path="/admin/products/new"
  element={<AdminProductForm />}
/>

<Route
  path="/admin/products/edit/:productId"
  element={<AdminProductForm />}
/>

<Route
  path="/admin/customers"
  element={<AdminCustomers />}
/>


        {/* SHOP */}

        <Route
          path="/shop"
          element={<Shop />}
        />


        {/* PRODUCT DETAILS */}

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />


        {/* CART */}

        <Route
          path="/cart"
          element={<Cart />}
        />


        {/* CHECKOUT */}

        <Route
          path="/checkout"
          element={<Checkout />}
        />


        {/* ORDER SUCCESS */}

        <Route
          path="/order-success/:id"
          element={<OrderSuccess />}
        />


        {/* CUSTOMER ORDER TRACKING */}

        <Route
          path="/track-order"
          element={<CustomerOrder />}
        />


        {/* ADMIN ORDERS */}

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        <Route
  path="/admin/dashboard"
  element={<AdminDashboard />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams
} from "react-router-dom";

import { useCart } from "../context/CartContext";

import "./Shop.css";

function Shop() {
  const navigate = useNavigate();

  const { addToCart } = useCart();

  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [sortBy, setSortBy] = useState("default");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================
  // CATEGORIES
  // =========================

  const categories = [
  "All",
  "Diwali",
  "Raksha Bandhan",
  "Eid",
  "Christmas",
  "Holi",
  "New Year",
  "Birthday",
  "Valentine",
  "Personalized"
];


  // =========================
  // GET CATEGORY FROM URL
  // =========================

  useEffect(() => {
    const categoryFromURL =
      searchParams.get("category");

    if (
      categoryFromURL &&
      categories.includes(categoryFromURL)
    ) {
      setSelectedCategory(categoryFromURL);
    } else {
      setSelectedCategory("All");
    }
  }, [searchParams]);


  // =========================
  // GET PRODUCTS FROM MONGODB
  // =========================

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        return response.json();
      })
      .then((data) => {
        setProducts(data.products);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Error fetching products:",
          error
        );

        setError(
          "Unable to load products."
        );

        setLoading(false);
      });
  }, []);


 // =========================
// FILTER PRODUCTS
// =========================

let filteredProducts;

if (selectedCategory === "All") {
  filteredProducts = products;
} else if (selectedCategory === "Personalized") {
  filteredProducts = products.filter(
    (product) =>
      product.category === "Personalized" ||
      product.occasion === "Personalized"
  );
} else {
  filteredProducts = products.filter(
    (product) =>
      product.occasion === selectedCategory
  );
}


  // =========================
  // SORT PRODUCTS
  // =========================

  if (sortBy === "low") {
    filteredProducts = [
      ...filteredProducts
    ].sort(
      (a, b) => a.price - b.price
    );
  }

  if (sortBy === "high") {
    filteredProducts = [
      ...filteredProducts
    ].sort(
      (a, b) => b.price - a.price
    );
  }


  // =========================
  // CATEGORY CLICK
  // =========================

  const handleCategoryChange = (
    category
  ) => {
    setSelectedCategory(category);

    if (category === "All") {
      navigate("/shop");
    } else {
      navigate(
        `/shop?category=${encodeURIComponent(
          category
        )}`
      );
    }
  };


  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = (
    event,
    product
  ) => {
    event.preventDefault();

    addToCart(product, 1);

    navigate("/cart");
  };


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="shop-page">

        <section className="shop-hero">

          <p>
            OUR COLLECTION
          </p>

          <h1>
            Find Your Perfect Gift 
          </h1>

          <span>
            Beautiful gifts for every
            festival and special moment.
          </span>

        </section>

        <div className="product-count">
          Loading products...
        </div>

      </div>
    );
  }


  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="shop-page">

        <section className="shop-hero">

          <p>
            OUR COLLECTION
          </p>

          <h1>
            Find Your Perfect Gift 
          </h1>

          <span>
            Beautiful gifts for every
            festival and special moment.
          </span>

        </section>

        <div className="product-count">
          {error}
        </div>

      </div>
    );
  }


  // =========================
  // SHOP PAGE
  // =========================

  return (
    <div className="shop-page">

      {/* SHOP HEADER */}

      <section className="shop-hero">

        <p>
          OUR COLLECTION
        </p>

        <h1>
          Find Your Perfect Gift 
        </h1>

        <span>
          Beautiful gifts for every
          festival and special moment.
        </span>

      </section>


      {/* SHOP CONTENT */}

      <section className="shop-content">


        {/* TOOLBAR */}

        <div className="shop-toolbar">

          <div className="category-filters">

            {categories.map(
              (category) => (

                <button
                  key={category}
                  className={
                    selectedCategory ===
                    category
                      ? "category-button active"
                      : "category-button"
                  }
                  onClick={() =>
                    handleCategoryChange(
                      category
                    )
                  }
                >
                  {category}
                </button>

              )
            )}

          </div>


          {/* SORT */}

          <select
            className="sort-select"
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value
              )
            }
          >

            <option value="default">
              Sort By
            </option>

            <option value="low">
              Price: Low to High
            </option>

            <option value="high">
              Price: High to Low
            </option>

          </select>

        </div>


        {/* PRODUCT COUNT */}

        <div className="product-count">

          Showing{" "}
          {filteredProducts.length}{" "}
          gifts

        </div>


        {/* PRODUCTS */}

        <div className="shop-product-grid">

          {filteredProducts.map(
            (product) => (

              <Link
                to={`/product/${product.productId}`}
                className="shop-product-card"
                key={product.productId}
              >

                {/* PRODUCT IMAGE */}

                <div className="shop-product-image">
  <img
  src={product.image}
  alt={product.name}
/>
</div>


                {/* PRODUCT INFO */}

                <div className="shop-product-info">

                  <span className="shop-product-category">
                    {product.type}
                  </span>


                  <h3>
                    {product.name}
                  </h3>


                  <div className="shop-rating">

                    ? {product.rating}

                    <span>
                      {" "}
                      ({product.reviews})
                    </span>

                  </div>


                  <p className="shop-product-description">

                    {product.description}

                  </p>


                  {/* PRICE + CART */}

                  <div className="shop-product-bottom">

                    <strong>
                      {product.price}
                    </strong>


                    <button
                      onClick={(event) =>
                        handleAddToCart(
                          event,
                          product
                        )
                      }
                    >
                      Add to Cart
                    </button>

                  </div>

                </div>

              </Link>

            )
          )}

        </div>


        {/* NO PRODUCTS */}

        {filteredProducts.length === 0 && (

          <div className="product-count">

            No products found
            for{" "}
            <strong>
              {selectedCategory}
            </strong>

          </div>

        )}

      </section>

    </div>
  );
}

export default Shop;




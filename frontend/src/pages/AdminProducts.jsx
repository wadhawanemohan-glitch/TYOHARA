import { useEffect, useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import "./AdminProducts.css";


const AdminProducts = () => {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);


  // =========================================
  // FETCH PRODUCTS
  // =========================================

  const fetchProducts = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products`
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to fetch products"
        );

      }

      setProducts(
        data.products || []
      );

    } catch (error) {

      console.error(
        "Product fetch error:",
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

    fetchProducts();

  }, []);


  // =========================================
  // DELETE PRODUCT
  // =========================================

  const handleDeleteProduct = async (product) => {

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );


    if (!confirmed) {
      return;
    }


    try {

      setDeletingId(
        product.productId
      );

      setError("");


      const token =
        localStorage.getItem(
          "giftwala-token"
        );


      if (!token) {

        throw new Error(
          "Admin login required."
        );

      }


      const response = await fetch(

        `${import.meta.env.VITE_API_URL}/api/products/${product.productId}`,

        {
          method: "DELETE",

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
          "Failed to delete product"
        );

      }


      // Remove deleted product
      // from the current table

      setProducts(
        (previousProducts) =>

          previousProducts.filter(
            (item) =>
              item.productId !==
              product.productId
          )

      );


    } catch (error) {

      console.error(
        "Delete product error:",
        error
      );

      setError(
        error.message
      );

    } finally {

      setDeletingId(null);

    }

  };


  // =========================================
  // SEARCH PRODUCTS
  // =========================================

  const filteredProducts =
    products.filter((product) => {

      const searchText =
        search.toLowerCase();


      return (

        product.name
          ?.toLowerCase()
          .includes(searchText) ||

        product.category
          ?.toLowerCase()
          .includes(searchText) ||

        product.type
          ?.toLowerCase()
          .includes(searchText) ||

        String(
          product.productId
        ).includes(searchText)

      );

    });


  // =========================================
  // FORMAT PRICE
  // =========================================

  const formatPrice = (price) => {
  return `?${Number(price || 0).toLocaleString("en-IN")}`;
};


  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }


    return new Date(
      date
    ).toLocaleDateString(
      "en-IN"
    );

  };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="admin-products-loading">

        Loading products...

      </div>

    );

  }


  // =========================================
  // PAGE
  // =========================================

  return (

    <div className="admin-products-page">

      <div className="admin-products-container">


        {/* =====================================
            HEADER
        ===================================== */}

        <div className="admin-products-header">

          <div>

            <p className="products-small-title">
              TYOHARA ADMIN
            </p>


            <h1>
              Product Management
            </h1>


            <p>
              Manage your TYOHARA products
            </p>

          </div>


          <div className="products-actions">


            <Link
              to="/admin/dashboard"
              className="products-dashboard-button"
            >
               Dashboard
            </Link>


            <button
              type="button"
              className="products-add-button"
              onClick={() =>
                navigate(
                  "/admin/products/new"
                )
              }
            >
              + Add Product
            </button>


          </div>

        </div>


        {/* =====================================
            ERROR
        ===================================== */}

        {error && (

          <div className="products-error">

            {error}

          </div>

        )}


        {/* =====================================
            SUMMARY
        ===================================== */}

        <div className="products-summary-grid">


          <div className="products-summary-card">

            <span>
              Total Products
            </span>


            <strong>
              {products.length}
            </strong>


            <small>
              Products in store
            </small>

          </div>


          <div className="products-summary-card">

            <span>
              Categories
            </span>


            <strong>

              {
                new Set(

                  products.map(
                    (product) =>
                      product.category
                  )

                ).size
              }

            </strong>


            <small>
              Product categories
            </small>

          </div>


          <div className="products-summary-card">

            <span>
              Total Stock
            </span>


            <strong>

              {products.reduce(

                (total, product) =>

                  total +
                  Number(
                    product.stock || 0
                  ),

                0

              )}

            </strong>


            <small>
              Available units
            </small>

          </div>


        </div>


        {/* =====================================
            SEARCH
        ===================================== */}

        <div className="products-search-section">

          <div>

            <p className="search-small-title">
              PRODUCT LIST
            </p>


            <h2>
              All Products
            </h2>

          </div>


          <div className="products-search-box">

            <span>
              
            </span>


            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>


        {/* =====================================
            TABLE
        ===================================== */}

        <div className="products-table-container">

          <table className="products-table">


            <thead>

              <tr>

                <th>
                  Product
                </th>

                <th>
                  Product ID
                </th>

                <th>
                  Category
                </th>

                <th>
                  Type
                </th>

                <th>
                  Price
                </th>

                <th>
                  Stock
                </th>

                <th>
                  Rating
                </th>

                <th>
                  Added
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>


              {filteredProducts.length === 0 ? (

                <tr>

                  <td
                    colSpan="9"
                    className="no-products"
                  >
                    No products found.
                  </td>

                </tr>

              ) : (

                filteredProducts.map(
                  (product) => (

                    <tr
                      key={
                        product._id
                      }
                    >


                      {/* PRODUCT */}

                      <td>

                        <div className="product-name-cell">

  <div className="product-avatar">
    <img
      src={product.image}
      alt={product.name}
    />
  </div>

  <div>
    <strong>
      {product.name}
    </strong>

    <span>
      {product.description
        ? product.description.substring(0, 45) + "..."
        : "No description"}
    </span>
  </div>

</div>

                      </td>


                      {/* PRODUCT ID */}

                      <td>

                        #{product.productId}

                      </td>


                      {/* CATEGORY */}

                      <td>

                        <span className="product-category">

                          {product.category}

                        </span>

                      </td>


                      {/* TYPE */}

                      <td>

                        {product.type || "-"}

                      </td>


                      {/* PRICE */}

                      <td>

                        <strong className="product-price">

                          {formatPrice(
                            product.price
                          )}

                        </strong>

                      </td>


                      {/* STOCK */}

                      <td>

                        <span
                          className={

                            Number(
                              product.stock || 0
                            ) === 0

                              ? "product-stock out"

                              : Number(
                                  product.stock || 0
                                ) <= 5

                              ? "product-stock low"

                              : "product-stock"

                          }
                        >

                          {product.stock || 0}

                        </span>

                      </td>


                      {/* RATING */}

                      <td>

                        ?{" "}

                        {product.rating || 0}

                      </td>


                      {/* DATE */}

                      <td>

                        <span className="product-date">

                          {formatDate(
                            product.createdAt
                          )}

                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="product-actions">


                          {/* EDIT */}

                          <button
                            type="button"
                            className="product-edit-button"
                            onClick={() =>
                              navigate(
                                `/admin/products/edit/${product.productId}`
                              )
                            }
                          >
                            Edit
                          </button>


                          {/* DELETE */}

                          <button
                            type="button"
                            className="product-delete-button"
                            onClick={() =>
                              handleDeleteProduct(
                                product
                              )
                            }
                            disabled={
                              deletingId ===
                              product.productId
                            }
                          >

                            {deletingId ===
                            product.productId

                              ? "Deleting..."

                              : "Delete"}

                          </button>


                        </div>

                      </td>


                    </tr>

                  )

                )

              )}


            </tbody>

          </table>

        </div>


        {/* =====================================
            RESULT COUNT
        ===================================== */}

        <div className="products-result-count">

          Showing{" "}

          <strong>
            {filteredProducts.length}
          </strong>

          {" "}of{" "}

          <strong>
            {products.length}
          </strong>

          {" "}products

        </div>


      </div>

    </div>

  );

};


export default AdminProducts;




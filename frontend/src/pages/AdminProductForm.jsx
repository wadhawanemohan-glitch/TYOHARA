import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import "./AdminProductForm.css";


const AdminProductForm = () => {

  const { productId } = useParams();

  const navigate = useNavigate();

  const isEditMode = Boolean(productId);


  const [formData, setFormData] = useState({
  productId: "",
  name: "",
  price: "",
  category: "",
  type: "",
  description: "",
  image: "",
  stock: ""
});


  const [loading, setLoading] = useState(false);

  const [loadingProduct, setLoadingProduct] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // =========================================
  // LOAD PRODUCT FOR EDIT
  // =========================================

  useEffect(() => {

    if (!isEditMode) {
      return;
    }


    const fetchProduct = async () => {

      try {

        setLoadingProduct(true);

        setError("");


        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/${productId}`
        );


        const data = await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to fetch product"
          );

        }


        const product = data.product;


        setFormData({

          productId:
            product.productId || "",

          name:
            product.name || "",

          price:
            product.price ?? "",

          category:
            product.category || "",

          type:
            product.type || "",

          description:
  product.description || "",

image:
  product.image || "",

stock:
  product.stock ?? ""

        });

      } catch (error) {

        console.error(
          "Error loading product:",
          error
        );

        setError(
          error.message
        );

      } finally {

        setLoadingProduct(false);

      }

    };


    fetchProduct();

  }, [isEditMode, productId]);


  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (event) => {

    const {
      name,
      value
    } = event.target;


    setFormData((previous) => ({

      ...previous,

      [name]: value

    }));

  };


  // =========================================
  // SUBMIT FORM
  // =========================================

  const handleSubmit = async (event) => {

    event.preventDefault();


    setError("");

    setSuccess("");


    // =======================================
    // VALIDATION
    // =======================================

    if (
      (!isEditMode && !formData.productId) ||
      !formData.name.trim() ||
      !formData.price ||
      !formData.category.trim()
    ) {

      setError(

        isEditMode

          ? "Product name, price and category are required."

          : "Product ID, name, price and category are required."

      );

      return;

    }


    try {

      setLoading(true);


      const token =
        localStorage.getItem(
          "giftwala-token"
        );


      // =====================================
      // PRODUCT DATA
      // =====================================

      const productData = {

        name:
          formData.name.trim(),

        price:
          Number(formData.price),

        category:
          formData.category.trim(),

        type:
          formData.type.trim(),

        description:
  formData.description.trim(),

image:
  formData.image.trim(),

stock:
  Number(formData.stock || 0)

      };


      // =====================================
      // ADD PRODUCT
      // =====================================

      if (!isEditMode) {

        productData.productId =
          Number(
            formData.productId
          );

      }


      // =====================================
      // URL
      // =====================================

      const url = isEditMode

        ? `${import.meta.env.VITE_API_URL}/api/products/${productId}`

        : `${import.meta.env.VITE_API_URL}/api/products`;


      // =====================================
      // METHOD
      // =====================================

      const method = isEditMode
        ? "PUT"
        : "POST";


      // =====================================
      // API REQUEST
      // =====================================

      const response = await fetch(
        url,
        {
          method,

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`

          },

          body:
            JSON.stringify(
              productData
            )

        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(

          data.message ||
          "Failed to save product"

        );

      }


      // =====================================
      // SUCCESS
      // =====================================

      setSuccess(

        isEditMode

          ? "Product updated successfully."

          : "Product added successfully."

      );


      // =====================================
      // GO BACK TO PRODUCTS
      // =====================================

      setTimeout(() => {

        navigate(
          "/admin/products"
        );

      }, 1000);


    } catch (error) {

      console.error(
        "Save product error:",
        error
      );

      setError(
        error.message
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // LOADING PRODUCT
  // =========================================

  if (loadingProduct) {

    return (

      <div className="admin-product-form-loading">

        Loading product...

      </div>

    );

  }


  // =========================================
  // PAGE
  // =========================================

  return (

    <div className="admin-product-form-page">

      <div className="admin-product-form-container">


        {/* =====================================
            HEADER
        ===================================== */}

        <div className="product-form-header">

          <div>

            <p className="product-form-small-title">

              TYOHARA ADMIN

            </p>


            <h1>

              {isEditMode
                ? "Edit Product"
                : "Add Product"}

            </h1>


            <p>

              {isEditMode

                ? "Update product information"

                : "Add a new product to your store"}

            </p>

          </div>


          <Link
            to="/admin/products"
            className="product-form-back-button"
          >

             Products

          </Link>

        </div>


        {/* =====================================
            ERROR
        ===================================== */}

        {error && (

          <div className="product-form-error">

            {error}

          </div>

        )}


        {/* =====================================
            SUCCESS
        ===================================== */}

        {success && (

          <div className="product-form-success">

            {success}

          </div>

        )}


        {/* =====================================
            FORM
        ===================================== */}

        <form
          className="product-form"
          onSubmit={handleSubmit}
        >


          {/* ===================================
              BASIC INFORMATION
          =================================== */}

          <div className="form-section">

            <h2>
              Basic Information
            </h2>


            <div className="form-grid">


              {/* PRODUCT ID */}

              <div className="form-group">

                <label>
                  Product ID *
                </label>


                <input
                  type="number"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  disabled={isEditMode}
                  placeholder="Example: 101"
                />


                {isEditMode && (

                  <small>
                    Product ID cannot be changed.
                  </small>

                )}

              </div>


              {/* PRODUCT NAME */}

              <div className="form-group">

                <label>
                  Product Name *
                </label>


                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Premium Gift Hamper"
                />

              </div>


              {/* PRICE */}

              <div className="form-group">

                <label>
                  Price *
                </label>


                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  placeholder="Example: 799"
                />

              </div>


              {/* CATEGORY */}

              <div className="form-group">

                <label>
                  Category *
                </label>


                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Example: Diwali"
                />

              </div>


              {/* TYPE */}

              <div className="form-group">

                <label>
                  Type
                </label>


                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="Example: Gift Hamper"
                />

              </div>


              {/* IMAGE */}

<div className="form-group">
  <label>
    Product Image
  </label>

  <input
    type="text"
    name="image"
    value={formData.image}
    onChange={handleChange}
    placeholder="/images/product-name.jpeg"
  />

  <small>
    Example: /images/tea-connoisseur-gift-set.jpeg
  </small>
</div>
              
              {/* STOCK */}

              <div className="form-group">

                <label>
                  Stock
                </label>


                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="Example: 50"
                />

              </div>


            </div>

          </div>


          {/* =====================================
              DESCRIPTION
          ===================================== */}

          <div className="form-section">

            <h2>
              Product Description
            </h2>


            <div className="form-group">

              <label>
                Description
              </label>


              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Enter product description..."
              />

            </div>

          </div>


          {/* =====================================
              CUSTOMER RATINGS
          ===================================== */}

          <div className="rating-info-box">

            <span>
              ?
            </span>


            <div>

              <strong>
                Customer Ratings & Reviews
              </strong>


              <p>

                Rating and review count are managed
                automatically from customer reviews.
                Admin does not enter these values.

              </p>

            </div>

          </div>


          {/* =====================================
              BUTTONS
          ===================================== */}

          <div className="product-form-actions">


            <Link
              to="/admin/products"
              className="form-cancel-button"
            >

              Cancel

            </Link>


            <button
              type="submit"
              className="form-save-button"
              disabled={loading}
            >

              {loading

                ? "Saving..."

                : isEditMode

                ? "Update Product"

                : "Add Product"}

            </button>


          </div>


        </form>

      </div>

    </div>

  );

};


export default AdminProductForm;

import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate(); // <-- for navigation with state

  // Fetch product + parameters and navigate to CreateProduct page
  const fetchProductParams = async (productId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`);
      const data = await res.json();
      console.log(data); // contains product + parameters

      // Navigate to CreateProduct and pass data as state
      navigate("/createProduct", { state: { productData: data } });
    } catch (err) {
      console.error("Error fetching product parameters:", err);
    }
  };

  // Delete product
  const deleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: "DELETE"
        });
        
        if (res.ok) {
          alert("Product deleted successfully!");
          // Refresh the products list
          const updatedProducts = products.filter(p => p.id !== productId);
          setProducts(updatedProducts);
        } else {
          const error = await res.json();
          alert("Error deleting product: " + (error.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Error deleting product: " + err.message);
      }
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products/allProducts");
        const data = await res.json();
        console.log(data);
        setProducts(data);
        console.log("products state:", data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1 className="mainHead">Existing Product</h1>

      <table border="1" className="tbl">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Edit Parameters</th>
            <th>Edit Parameter Values</th>
            <th>Delete Product</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>
                <button onClick={() => fetchProductParams(p.id)}>
                  Edit Parameters
                </button>
              </td>
              <td>
                <Link to={`/parameters/${p.id}`}>
                  <button>Edit Parameter Values</button>
                </Link>
              </td>
              <td>
                <button onClick={() => deleteProduct(p.id, p.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/createProduct">
        <button className="createNew">Create New +</button>
      </Link>
    </div>
  );
};

export default Home;

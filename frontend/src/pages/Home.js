import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(15);
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

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when products change
  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get the list of all products
        const res = await fetch("http://localhost:5000/api/products/allProducts");
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const productsList = await res.json();
        console.log("Raw API response:", productsList);
        
        // Ensure data is an array
        if (Array.isArray(productsList)) {
          // Now fetch complete data for each product including parameters
          const productsWithParams = await Promise.all(
            productsList.map(async (product) => {
              try {
                const productRes = await fetch(`http://localhost:5000/api/products/${product.id}`);
                if (productRes.ok) {
                  const productData = await productRes.json();
                  return productData; // This includes the parameters
                } else {
                  console.warn(`Failed to fetch details for product ${product.id}`);
                  return product; // Return basic product data if detailed fetch fails
                }
              } catch (err) {
                console.warn(`Error fetching details for product ${product.id}:`, err);
                return product; // Return basic product data if detailed fetch fails
              }
            })
          );
          
          setProducts(productsWithParams);
          console.log("products with parameters:", productsWithParams);
        } else {
          console.error("API returned non-array data:", productsList);
          setError("Invalid data format received from server");
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div>
        <h1 className="mainHead">Loading products...</h1>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div>
        <h1 className="mainHead">Error Loading Products</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mainHead">Existing Product</h1>

      {products && products.length > 0 ? (
        <table border="1" className="tbl">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Parameters</th>
              <th>Edit Parameters</th>
              <th>Edit Parameter Values</th>
              <th>Delete Product</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>
                  {p.parameters && p.parameters.length > 0 ? (
                    <div>
                      {p.parameters.map((param, index) => (
                        <div key={index} style={{ marginBottom: '5px', padding: '3px', border: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                          <strong>{param.parameterName}</strong>
                          <br />
                          Max: {param.max_value || param.max || '-'} | 
                          Min: {param.min_value || param.min || '-'} | 
                          Unit: {param.unit || '-'} | 
                          Sample: {param.sample_size || param.sampleSize || '-'} | 
                          Compulsory: {param.compulsory === 1 || param.compulsory === true ? 'Yes' : 'No'} | 
                          Status: {param.status || '-'}
                          <br />
                          <button 
                            onClick={() => fetchProductParams(p.id)} 
                            style={{ marginTop: '5px', padding: '2px 8px', fontSize: '12px' }}
                          >
                            EDIT
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span>No parameters</span>
                  )}
                </td>
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
      ) : (
        <p>No products found.</p>
      )}

      {/* Pagination Controls */}
      {products.length > productsPerPage && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div style={{ marginBottom: '10px' }}>
            <span>Page {currentPage} of {totalPages}</span>
            <span style={{ marginLeft: '20px' }}>
              Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, products.length)} of {products.length} products
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={goToPreviousPage} 
              disabled={currentPage === 1}
              style={{ 
                padding: '8px 16px', 
                border: '1px solid #ccc', 
                backgroundColor: currentPage === 1 ? '#f5f5f5' : 'white',
                color: currentPage === 1 ? '#999' : '#333',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => goToPage(pageNumber)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  backgroundColor: currentPage === pageNumber ? '#007bff' : 'white',
                  color: currentPage === pageNumber ? 'white' : '#333',
                  cursor: 'pointer',
                  minWidth: '40px'
                }}
              >
                {pageNumber}
              </button>
            ))}
            
            <button 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages}
              style={{ 
                padding: '8px 16px', 
                border: '1px solid #ccc', 
                backgroundColor: currentPage === totalPages ? '#f5f5f5' : 'white',
                color: currentPage === totalPages ? '#999' : '#333',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Link to="/createProduct">
        <button className="createNew">Create New +</button>
      </Link>
    </div>
  );
};

export default Home;

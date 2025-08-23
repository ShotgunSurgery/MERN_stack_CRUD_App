import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import { Link, useNavigate } from "react-router-dom";

const ExpandableRow = ({ product }) => {
  return (
    <tr className="expandable-row">
      <td colSpan="5">
        <div className="expandable-content">
          <h3>Parameters</h3>
          {product.parameters && product.parameters.length > 0 ? (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Max Value</th>
                  <th>Min Value</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {product.parameters.map((param) => (
                  <tr key={param.id}>
                    <td>{param.parameterName}</td>
                    <td>{param.max_value}</td>
                    <td>{param.min_value}</td>
                    <td>{param.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No parameters found.</p>
          )}
          <h3>Parameter Values</h3>
          {product.parameterValues && product.parameterValues.length > 0 ? (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Record Name</th>
                  <th>Parameter Name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {product.parameterValues.map((paramValue) => (
                  <tr key={paramValue.id}>
                    <td>{paramValue.record_name}</td>
                    <td>{paramValue.parameter_name}</td>
                    <td>{paramValue.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No parameter values found.</p>
          )}
        </div>
      </td>
    </tr>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(15);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const navigate = useNavigate();

  const handleToggleExpand = (productId) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  const fetchProductParams = async (productId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`);
      const data = await res.json();
      navigate("/createProduct", { state: { productData: data } });
    } catch (err) {
      console.error("Error fetching product parameters:", err);
    }
  };

  const deleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("Product deleted successfully!");
          setProducts(products.filter((p) => p.id !== productId));
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
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:5000/api/products/all-with-details");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const productsList = await res.json();
        if (Array.isArray(productsList)) {
          setProducts(productsList);
        } else {
          setError("Invalid data format received from server");
          setProducts([]);
        }
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  if (loading) {
    return <div><h1 className="mainHead">Loading products...</h1></div>;
  }

  if (error) {
    return (
      <div>
        <h1 className="mainHead">Error Loading Products</h1>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mainHead">Existing Product</h1>
      {products.length > 0 ? (
        <table className="tbl">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Details</th>
              <th>Edit</th>
              <th>Edit Values</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((p) => (
              <React.Fragment key={p.id}>
                <tr>
                  <td>{p.name}</td>
                  <td>
                    <button onClick={() => handleToggleExpand(p.id)}>
                      {expandedProductId === p.id ? "Collapse" : "View Details"}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => fetchProductParams(p.id)}>Edit</button>
                  </td>
                  <td>
                    <Link to={`/parameters/${p.id}`}>
                      <button>Edit Values</button>
                    </Link>
                  </td>
                  <td>
                    <button onClick={() => deleteProduct(p.id, p.name)}>Delete</button>
                  </td>
                </tr>
                {expandedProductId === p.id && <ExpandableRow product={p} />}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No products found.</p>
      )}
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

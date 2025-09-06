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
            <table className="nested-table">
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
            <table className="nested-table">
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
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="spinner"></div>
          <h1>Loading products...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="error-container">
          <h1>Error Loading Products</h1>
          <div className="error-message">Error: {error}</div>
          <button className="btn-retry" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Existing Products</h1>
        <div className="action-buttons">
          <Link to="/createProduct" className="btn-create">
            Create New Product
          </Link>
        </div>
      </div>
      
      {products.length > 0 ? (
        <div className="products-table-container">
          <table className="products-table">
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
                    <td className="product-name">{p.name}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-action btn-details"
                          onClick={() => handleToggleExpand(p.id)}
                        >
                          {expandedProductId === p.id ? "Collapse" : "View Details"}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-action btn-edit"
                          onClick={() => fetchProductParams(p.id)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/parameters/${p.id}`}>
                          <button className="btn-action btn-edit-values">Edit Values</button>
                        </Link>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-action btn-delete"
                          onClick={() => deleteProduct(p.id, p.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedProductId === p.id && <ExpandableRow product={p} />}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Products Found</h3>
          <p>Start by creating your first product to get started.</p>
          <Link to="/createProduct" className="btn-create">
            Create Your First Product
          </Link>
        </div>
      )}
      {products.length > productsPerPage && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>Page {currentPage} of {totalPages}</span>
            <span style={{ marginLeft: '20px' }}>
              Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, products.length)} of {products.length} products
            </span>
          </div>
          
          <div className="pagination-controls">
            <button 
              className="pagination-button"
              onClick={goToPreviousPage} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                onClick={() => goToPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            
            <button 
              className="pagination-button"
              onClick={goToNextPage} 
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

import React, { useEffect, useMemo, useState } from "react";
import "../styles/Home.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { FaEye, FaPen, FaTrash } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ExpandableRow = ({ product }) => {
  return (
    <tr className="expandable-row">
      <td colSpan="7">
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
        </div>
      </td>
    </tr>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const initialPerPage = parseInt(searchParams.get("perPage") || "15", 10);
  const [currentPage, setCurrentPage] = useState(Number.isNaN(initialPage) ? 1 : initialPage);
  const [productsPerPage, setProductsPerPage] = useState(Number.isNaN(initialPerPage) ? 15 : initialPerPage);
  const [isPageLoading, setIsPageLoading] = useState(false);

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

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setProducts(items); // Update frontend immediately for smooth UX

    // Send updated order to backend
    try {
      const productIds = items.map(p => p.id);
      const res = await fetch(`http://localhost:5000/api/products/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to reorder products on backend");
      }
      console.log("Products reordered successfully on backend.");
    } catch (err) {
      console.error("Error persisting product order:", err);
      alert("Error saving new product order: " + err.message);
      // Optionally, revert frontend state if backend update fails
      // setProducts(originalItems);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `http://localhost:5000/api/products/all-with-details`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
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

  // Keep URL in sync when page or perPage changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(currentPage));
    params.set("perPage", String(productsPerPage));
    setSearchParams(params, { replace: true });
  }, [currentPage, productsPerPage]);

  // Smooth page transition indicator
  useEffect(() => {
    if (loading) return;
    setIsPageLoading(true);
    const id = setTimeout(() => setIsPageLoading(false), 150);
    return () => clearTimeout(id);
  }, [currentPage, productsPerPage, loading]);

  const totalPages = Math.ceil(products.length / productsPerPage); // This should be correct
  const indexOfFirstProduct = (currentPage - 1) * productsPerPage;
  const indexOfLastProduct = Math.min(indexOfFirstProduct + productsPerPage, products.length);
  
  const currentProducts = useMemo(
    () => products.slice(indexOfFirstProduct, indexOfLastProduct),
    [products, indexOfFirstProduct, indexOfLastProduct]
  );

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

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  const handlePerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setProductsPerPage(value);
    setCurrentPage(1);
  };

  const visiblePageButtons = useMemo(() => {
    const pages = [];
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }
    const left = Math.max(1, currentPage - 2);
    const right = Math.min(totalPages, currentPage + 2);
    let start = left;
    let end = right;
    if (right - left + 1 < maxButtons) {
      if (currentPage <= 3) {
        start = 1;
        end = 5;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages;
      }
    }
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

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
              {(isPageLoading ? Array.from({ length: Math.min(productsPerPage, products.length - indexOfFirstProduct) }) : currentProducts).map((p, i) => (
                <React.Fragment key={p?.id || `skeleton-${i}`}>
                  <tr>
                    <td className="product-name">{isPageLoading ? <div className="skeleton skeleton-text" /> : p.name}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-action btn-details"
                          onClick={() => !isPageLoading && handleToggleExpand(p.id)}
                          disabled={isPageLoading}
                        >
                          {isPageLoading ? "Loading..." : expandedProductId === p?.id ? "Collapse" : "View Details"}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-action btn-edit"
                          onClick={() => !isPageLoading && fetchProductParams(p.id)}
                          disabled={isPageLoading}
                        >
                          {isPageLoading ? "..." : "Edit"}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        {isPageLoading ? (
                          <button className="btn-action btn-edit-values" disabled>...</button>
                        ) : (
                          <Link to={`/parameters/${p.id}`}>
                            <button className="btn-action btn-edit-values">Edit Values</button>
                          </Link>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-action btn-delete"
                          onClick={() => !isPageLoading && deleteProduct(p.id, p.name)}
                          disabled={isPageLoading}
                        >
                          {isPageLoading ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {p && expandedProductId === p.id && !isPageLoading && <ExpandableRow product={p} />}
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
            <span>Showing {products.length === 0 ? 0 : indexOfFirstProduct + 1}-{indexOfLastProduct} of {products.length} results</span>
            <span style={{ marginLeft: '20px' }}>Page {currentPage} of {totalPages}</span>
          </div>

          <div className="pagination-controls">
            <label style={{ marginRight: 8 }}>Results per page:</label>
            <select value={productsPerPage} onChange={handlePerPageChange} disabled={isPageLoading}>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <button 
              className="pagination-button"
              onClick={goToFirstPage}
              disabled={currentPage === 1 || isPageLoading}
              style={{ marginLeft: 12 }}
            >
              First
            </button>
            <button 
              className="pagination-button"
              onClick={goToPreviousPage} 
              disabled={currentPage === 1 || isPageLoading}
            >
              Previous
            </button>

            {visiblePageButtons[0] > 1 && (
              <>
                <button
                  className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
                  onClick={() => goToPage(1)}
                  disabled={isPageLoading}
                >
                  1
                </button>
                {visiblePageButtons[0] > 2 && <span className="pagination-ellipsis">…</span>}
              </>
            )}

            {visiblePageButtons.map((pageNumber) => (
              <button
                key={pageNumber}
                className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                onClick={() => goToPage(pageNumber)}
                disabled={isPageLoading}
              >
                {pageNumber}
              </button>
            ))}

            {visiblePageButtons[visiblePageButtons.length - 1] < totalPages && (
              <>
                {visiblePageButtons[visiblePageButtons.length - 1] < totalPages - 1 && (
                  <span className="pagination-ellipsis">…</span>
                )}
                <button
                  className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
                  onClick={() => goToPage(totalPages)}
                  disabled={isPageLoading}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button 
              className="pagination-button"
              onClick={goToNextPage} 
              disabled={currentPage === totalPages || isPageLoading}
            >
              Next
            </button>
            <button 
              className="pagination-button"
              onClick={goToLastPage}
              disabled={currentPage === totalPages || isPageLoading}
            >
              Last
            </button>

            <div style={{ marginLeft: 16 }}>
              <label style={{ marginRight: 8 }}>Jump to page:</label>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const v = parseInt(e.target.value || "1", 10);
                  if (!Number.isNaN(v)) goToPage(v);
                }}
                style={{ width: 70 }}
                disabled={isPageLoading}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
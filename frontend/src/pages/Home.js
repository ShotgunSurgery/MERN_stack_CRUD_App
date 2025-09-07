import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaPen, FaTrash } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ExpandableRow = ({ product }) => {
  return (
    <tr className="expandable-row">
      <td colSpan="7">
        <div className="expandable-content">
          <div className="expandable-section">
            <h3>Parameters</h3>
            {product.parameters && product.parameters.length > 0 ? (
              <table className="table">
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
          </div>
          <div className="expandable-section">
            <h3>Parameter Values</h3>
            {product.parameterValues && product.parameterValues.length > 0 ? (
              <table className="table">
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
        </div>
      </td>
    </tr>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  if (loading) {
    return <div className="loading-container"><h1 className="mainHead">Loading products...</h1></div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h1 className="mainHead">Error Loading Products</h1>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="mainHead">Existing Product</h1>
        <Link to="/createProduct">
          <button className="btn btn-primary">Create New +</button>
        </Link>
      </div>
      {products.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Drag</th>
                <th>Product Name</th>
                <th>Details</th>
                <th>Edit Parameter</th>
                <th>Edit Parameter Values</th>
                <th>Delete</th>
              </tr>
            </thead>
            <Droppable droppableId="products">
              {(provided) => (
                <tbody {...provided.droppableProps} ref={provided.innerRef}>
                  {products.map((p, index) => (
                    <Draggable key={p.id} draggableId={p.id.toString()} index={index}>
                      {(provided) => (
                        <React.Fragment>
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <td>{index + 1}</td>
                            <td {...provided.dragHandleProps} style={{ cursor: "grab" }}>
                              ☰
                            </td>
                            <td>{p.name}</td>
                            <td>
                              <button onClick={() => handleToggleExpand(p.id)} className="btn btn-secondary">
                                <FaEye /> {expandedProductId === p.id ? "Collapse" : "View Details"}
                              </button>
                            </td>
                            <td>
                              <button onClick={() => fetchProductParams(p.id)} className="btn btn-warning">
                                <FaPen /> Edit
                              </button>
                            </td>
                            <td>
                              <Link to={`/parameters/${p.id}`}>
                                <button className="btn btn-info">
                                  <FaPen /> Edit Values
                                </button>
                              </Link>
                            </td>
                            <td>
                              <button onClick={() => deleteProduct(p.id, p.name)} className="btn btn-danger">
                                <FaTrash /> Delete
                              </button>
                            </td>
                          </tr>
                          {expandedProductId === p.id && <ExpandableRow product={p} />}
                        </React.Fragment>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
};

export default Home;
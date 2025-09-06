import React, { useState } from "react";
import "../styles/CreateProduct.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Link, useLocation, useNavigate } from "react-router-dom";

const CreateProduct = () => {
  const location = useLocation();
  const productData = location.state?.productData;
  const navigate = useNavigate();

  const [productName, setProductName] = useState(
    productData ? productData.name : ""
  );

  // Map database field names to frontend field names
  const mapParametersForFrontend = (dbParameters) => {
    return dbParameters.map((param) => ({
      parameterName: param.parameterName,
      max: param.max_value || "", // Map max_value to max
      min: param.min_value || "", // Map min_value to min
      unit: param.unit || "",
      evaluation: param.evaluation || "",
      sampleSize: param.sample_size || "", // Map sample_size to sampleSize
      compulsory: param.compulsory === 1 || param.compulsory === true, // Handle boolean conversion
      status: param.status || "",
    }));
  };

  const [parameters, setParameters] = useState(
    productData ? mapParametersForFrontend(productData.parameters) : []
  );

  const deleteParameter = (index) => {
    const updated = [...parameters];
    updated.splice(index, 1);
    setParameters(updated);
  };

  const addParameter = () => {
    setParameters([
      ...parameters,
      {
        parameterName: "",
        max: "",
        min: "",
        unit: "",
        evaluation: "",
        sampleSize: "",
        compulsory: false,
        status: "",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...parameters];
    updated[index][field] = value;
    setParameters(updated);
  };

  const submitProduct = async () => {
    const data = {
      name: productName,
      parameters: parameters,
    };

    try {
      const isEditMode = productData && productData.id;
      const url = isEditMode
        ? `http://localhost:5000/api/products/${productData.id}`
        : "http://localhost:5000/api/products";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Server response:", result);
      
      if (response.ok) {
        alert(productData && productData.id ? "Product updated successfully!" : "Product created successfully!");
        if (!productData || !productData.id) {
          // If creating new product, redirect to home
          window.location.href = "/";
        }
      } else {
        alert("Error: " + (result.error || "Failed to save product"));
      }
    } catch (error) {
      console.error("Error sending data:", error);
      alert("Error: " + error.message);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(parameters);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setParameters(items);
  };

  return (
    <div className="main-content">
      <div className="create-product-header">
        <h1 className="create-product-title">Add Product</h1>
        <h2 className="create-product-subtitle">Product Name</h2>
      </div>
      
      <div className="product-name-section">
        <label className="product-name-label">Product Name</label>
        <input
          className="product-name-input"
          placeholder="Enter Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>
      
      <div className="parameters-section">
        <div className="parameters-header">
          <h3 className="parameters-title">Parameters</h3>
          <button className="btn-add-parameter" onClick={addParameter}>
            Add Parameter
          </button>
        </div>

        {parameters.length > 0 ? (
          <div className="parameters-table-container">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="parameters">
                {(provided) => (
                  <table
                    className="parameters-table"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Drag</th>
                        <th>Parameter Name</th>
                        <th>Max</th>
                        <th>Min</th>
                        <th>Unit</th>
                        <th>Evaluation technique</th>
                        <th>Sample size</th>
                        <th>Compulsory</th>
                        <th>Parameter Status</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parameters.map((param, index) => (
                        <Draggable
                          key={index}
                          draggableId={index.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <tr ref={provided.innerRef} {...provided.draggableProps}>
                              {/* Order Number */}
                              <td>
                                <div className="order-number">{index + 1}</div>
                              </td>

                              {/* Drag Handle */}
                              <td
                                {...provided.dragHandleProps}
                                className="drag-handle"
                              >
                                Drag
                              </td>

                              <td>
                                <input
                                  className="table-input"
                                  placeholder="Parameter Name"
                                  value={param.parameterName}
                                  onChange={(e) =>
                                    handleChange(
                                      index,
                                      "parameterName",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="table-input"
                                  placeholder="Max Value"
                                  value={param.max}
                                  onChange={(e) =>
                                    handleChange(index, "max", e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="table-input"
                                  placeholder="Min Value"
                                  value={param.min}
                                  onChange={(e) =>
                                    handleChange(index, "min", e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="table-input"
                                  placeholder="Unit"
                                  value={param.unit}
                                  onChange={(e) =>
                                    handleChange(index, "unit", e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="table-input"
                                  placeholder="Evaluation"
                                  value={param.evaluation}
                                  onChange={(e) =>
                                    handleChange(index, "evaluation", e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="table-input"
                                  placeholder="Sample Size"
                                  value={param.sampleSize}
                                  onChange={(e) =>
                                    handleChange(index, "sampleSize", e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="checkbox"
                                  className="table-checkbox"
                                  checked={param.compulsory}
                                  onChange={(e) =>
                                    handleChange(
                                      index,
                                      "compulsory",
                                      e.target.checked
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <select
                                  className="table-select"
                                  value={param.status}
                                  onChange={(e) =>
                                    handleChange(index, "status", e.target.value)
                                  }
                                >
                                  <option value="">Select Status</option>
                                  <option value="Active">Active</option>
                                  <option value="Inactive">Inactive</option>
                                  <option value="Pending">Pending</option>
                                </select>
                              </td>
                              <td>
                                <button 
                                  className="btn-delete-parameter"
                                  onClick={() => deleteParameter(index)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        ) : (
          <div className="empty-parameters">
            <h3>No Parameters Added</h3>
            <p>Click "Add Parameter" to start adding parameters to your product.</p>
          </div>
        )}
      </div>

      <div className="action-buttons-section">
        <button className="btn-save" onClick={submitProduct}>
          {productData && productData.id ? "Update Product" : "Create Product"}
        </button>
        {productData && productData.id && (
          <Link to={`/parameters/${productData.id}`} className="btn-manage-values">
            Manage Parameter Values
          </Link>
        )}
      </div>
    </div>
  );
};

export default CreateProduct;

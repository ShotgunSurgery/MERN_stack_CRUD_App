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
      //   console.log("Server response:", result);
      // } catch (error) {
      //   console.error("Error sending data:", error);
      if (isEditMode) {
        navigate("/parameters", { state: { productId: productData.id } });
      }
    } catch (error) {
      console.error("Error sending data:", error);
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
    <div>
      <h1 className="mainhead">Add Product</h1>
      <h2 className="mainhead">Product Name</h2>
      <input
        placeholder="Enter Product Name"
        style={{ marginLeft: "20px" }}
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />
      <button onClick={addParameter}>Add Parameter</button>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="parameters">
          {(provided) => (
            <table
              className="table"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <thead>
                <tr style={{ border: "solid black" }}>
                  <td>#</td>
                  <td>Drag</td>
                  <td>Parameter Name</td>
                  <td>Max</td>
                  <td>Min</td>
                  <td>Unit</td>
                  <td>Evaluation technique</td>
                  <td>Sample size</td>
                  <td>Compulsory</td>
                  <td>Parameter Status</td>
                  <td>Delete</td>
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
                        <td>{index + 1}</td>

                        {/* Drag Handle */}
                        <td
                          {...provided.dragHandleProps}
                          style={{ cursor: "grab" }}
                        >
                          ☰
                        </td>

                        <td>
                          <input
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
                            value={param.max}
                            onChange={(e) =>
                              handleChange(index, "max", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={param.min}
                            onChange={(e) =>
                              handleChange(index, "min", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={param.unit}
                            onChange={(e) =>
                              handleChange(index, "unit", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={param.evaluation}
                            onChange={(e) =>
                              handleChange(index, "evaluation", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            value={param.sampleSize}
                            onChange={(e) =>
                              handleChange(index, "sampleSize", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
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
                          <button onClick={() => deleteParameter(index)}>
                            🗑️
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

      <button className="sb" onClick={submitProduct}>
        Save Values
      </button>
      <Link to="/parameters">
        <button className="sb" onClick={submitProduct}>
          Next
        </button>
      </Link>
    </div>
  );
};

export default CreateProduct;

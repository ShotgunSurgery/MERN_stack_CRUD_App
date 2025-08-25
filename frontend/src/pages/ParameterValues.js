import React, { useState, useEffect } from "react";
import "../styles/shared.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useParams, useNavigate } from "react-router-dom";

const ParameterValues = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [parameters, setParameters] = useState([]);
  const [productName, setProductName] = useState("");

  // if we declare the function outside then react will call it on every render, but useEffect hook ensures it
  // only runs when the page is initially loaded and when the productId changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product and parameters
        const res = await fetch(`http://localhost:5000/api/products/${productId}`);
        const data = await res.json();
        setProductName(data.name);
        setParameters(data.parameters || []);

        // Fetch existing values
        const valuesRes = await fetch(`http://localhost:5000/api/products/${productId}/values`);
        const valuesData = await valuesRes.json();
        
        // Update parameters with existing values
        if (valuesData.length > 0) {
          const updatedParams = data.parameters.map(param => {
            const existingValue = valuesData[0][param.parameterName];
            return {
              ...param,
              value: existingValue || ''
            };
          });
          setParameters(updatedParams);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    
    if (productId) {
      fetchData();
    }
  }, [productId]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(parameters);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setParameters(items);
  };

   const handleChange = (index, field, value) => {
    const updated = [...parameters];
    updated[index][field] = value;
    setParameters(updated);
  };

  const deleteRow = (index) => {
    const updated = [...parameters];
    updated.splice(index, 1);
    setParameters(updated);
  };

  const addRow = () => {
    setParameters([
      ...parameters,
      {
        parameterName: "",
        value: "",
      },
    ]);
  };

  const saveValues = async () => {
    try {
      // Transform the data to match backend expectations
      const rows = parameters.map(param => ({
        name: `Record ${param.parameterName}`,
        [param.parameterName]: param.value || ''
      }));

      const res = await fetch(
        `http://localhost:5000/api/products/${productId}/values`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows }),
        }
      );
      const result = await res.json();
      console.log("Saved:", result);
      alert("Values saved successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error saving values:", err);
      alert("Error saving values: " + err.message);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="mainhead">{productName}</h1>
        <div>
          <button className="btn btn-primary" onClick={addRow}>Add Row</button>
          <button className="btn btn-primary" onClick={saveValues}>Save Values</button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="parameters">
          {(provided) => (
            <table
              className="table"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <thead>
                <tr>
                  <td>#</td>
                  <td>Drag</td>
                  <td>Parameter Name</td>
                  <td>Value</td>
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
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        {/* Row number */}
                        <td>{index + 1}</td>

                        {/* Drag handle */}
                        <td {...provided.dragHandleProps} style={{ cursor: "grab" }}>
                          ☰
                        </td>

                        {/* Parameter name (fetched from DB) */}
                        <td>
                          <input
                            value={param.parameterName}
                            disabled
                          />
                        </td>

                        {/* Editable value */}
                        <td>
                          <input
                            value={param.value || ""}
                            onChange={(e) =>
                              handleChange(index, "value", e.target.value)
                            }
                          />
                        </td>

                        {/* Delete row */}
                        <td>
                          <button className="btn btn-danger" onClick={() => deleteRow(index)}>🗑️</button>
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
  );
};

export default ParameterValues;

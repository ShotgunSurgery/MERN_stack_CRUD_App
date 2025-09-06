import React, { useState, useEffect } from "react";
import "../styles/shared.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const ParameterValues = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [parameters, setParameters] = useState([]);
  const [productName, setProductName] = useState("");
  const [rows, setRows] = useState([]); // Array of row objects, each containing values for all parameters
  
  // const productId = location.state?.productId;

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
        
        // Transform existing values into rows format
        if (valuesData.length > 0) {
          // Each item in valuesData represents a row with existing values
          const existingRows = valuesData.map(rowData => {
            const row = { name: rowData.name || "" };
            // Add values for each parameter
            data.parameters.forEach(param => {
              row[param.parameterName] = rowData[param.parameterName] || "";
            });
            return row;
          });
          setRows(existingRows);
        } else {
          // If no existing values, create one empty row
          setRows([createEmptyRow(data.parameters || [])]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        // Initialize with one empty row on error
        setRows([createEmptyRow([])]);
      }
    };
    
    if (productId) {
      fetchData();
    }
  }, [productId]);

  // Create an empty row object with all parameter fields
  const createEmptyRow = (params) => {
    const row = { name: "" }; // First column is always "name"
    params.forEach(param => {
      row[param.parameterName] = ""; // Add a field for each parameter
    });
    return row;
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(rows);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setRows(items);
  };

  const handleChange = (rowIndex, field, value) => {
    const updated = [...rows];
    updated[rowIndex][field] = value;
    setRows(updated);
  };

  const deleteRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, createEmptyRow(parameters)]);
  };

  const saveValues = async () => {
    try {
      // Use the actual rows state that contains user input
      const res = await fetch(
        `http://localhost:5000/api/products/${productId}/values`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: rows }), // Send the actual rows state
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
        <Droppable droppableId="rows">
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
                  <td>Name</td>
                  {parameters.map((param, index) => (
                    <td key={index}>{param.parameterName}</td>
                  ))}
                  <td>Delete</td>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <Draggable
                    key={rowIndex}
                    draggableId={rowIndex.toString()}
                    index={rowIndex}
                  >
                    {(provided) => (
                      <tr ref={provided.innerRef} {...provided.draggableProps}>
                        {/* Row number */}
                        <td>{rowIndex + 1}</td>

                        {/* Drag handle */}
                        <td
                          {...provided.dragHandleProps}
                          style={{ cursor: "grab" }}
                        >
                          ☰
                        </td>

                        {/* Name column */}
                        <td>
                          <input
                            value={row.name || ""}
                            onChange={(e) =>
                              handleChange(rowIndex, "name", e.target.value)
                            }
                            placeholder="Enter name"
                          />
                        </td>

                        {/* Parameter value columns */}
                        {parameters.map((param, paramIndex) => (
                          <td key={paramIndex}>
                            <input
                              value={row[param.parameterName] || ""}
                              onChange={(e) =>
                                handleChange(rowIndex, param.parameterName, e.target.value)
                              }
                              placeholder={`Enter ${param.parameterName}`}
                            />
                          </td>
                        ))}

                        {/* Delete row */}
                        <td>
                          <button className="btn btn-danger" onClick={() => deleteRow(rowIndex)}>🗑️</button>
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

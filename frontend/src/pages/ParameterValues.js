import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ParameterValues = ({ productId }) => {
  const [parameters, setParameters] = useState([]);
  const [productName, setProductName] = useState("");

  // if we declare the function outside then react will call it on every render, but useEffect hook ensures it
  // only runs when the page is initially loaded and when the productId changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${productId}`);
        const data = await res.json();
        setProductName(data.name);
        setParameters(data.parameters || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
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
      const res = await fetch(
        `http://localhost:5000/api/products/${productId}/values`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parameters }),
        }
      );
      const result = await res.json();
      console.log("Saved:", result);
    } catch (err) {
      console.error("Error saving values:", err);
    }
  };

  return (
    <div>
      <h1 className="mainhead">{productName}</h1>
      <button onClick={addRow}>Add Row</button>

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
                          <button onClick={() => deleteRow(index)}>🗑️</button>
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

      <button onClick={saveValues}>Save Values</button>
    </div>
  );
};

export default ParameterValues;

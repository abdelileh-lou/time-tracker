import React, { useState, useEffect } from "react";

const ManageTrackingTypes = () => {
  const [trackingTypes, setTrackingTypes] = useState([]);
  const [newType, setNewType] = useState("");

  useEffect(() => {
    // Fetch tracking types from the API
    const fetchTrackingTypes = async () => {
      const response = await fetch("/api/tracking-types");
      const data = await response.json();
      setTrackingTypes(data);
    };

    fetchTrackingTypes();
  }, []);

  const handleAddType = async () => {
    const response = await fetch("/api/tracking-types", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newType }),
    });

    if (response.ok) {
      const addedType = await response.json();
      setTrackingTypes([...trackingTypes, addedType]);
      setNewType("");
    }
  };

  const handleDeleteType = async (id) => {
    const response = await fetch(`/api/tracking-types/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setTrackingTypes(trackingTypes.filter((type) => type.id !== id));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Tracking Types</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          placeholder="New Tracking Type"
          className="border p-2 mr-2"
        />
        <button onClick={handleAddType} className="bg-blue-500 text-white p-2">
          Add
        </button>
      </div>
      <ul>
        {trackingTypes.map((type) => (
          <li key={type.id} className="flex justify-between items-center mb-2">
            <span>{type.name}</span>
            <button
              onClick={() => handleDeleteType(type.id)}
              className="bg-red-500 text-white p-1">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageTrackingTypes;

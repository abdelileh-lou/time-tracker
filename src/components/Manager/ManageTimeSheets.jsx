import React, { useState, useEffect } from "react";

const ManageTimeSheets = () => {
  const [timeSheets, setTimeSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeSheets = async () => {
      try {
        const response = await fetch("/api/timesheets"); // Adjust the API endpoint as needed
        if (!response.ok) {
          throw new Error("Failed to fetch time sheets");
        }
        const data = await response.json();
        setTimeSheets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSheets();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/timesheets/${id}`, {
        method: "DELETE",
      });
      setTimeSheets(timeSheets.filter((sheet) => sheet.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdd = async (newSheet) => {
    try {
      const response = await fetch("/api/timesheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSheet),
      });
      const addedSheet = await response.json();
      setTimeSheets([...timeSheets, addedSheet]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = async (updatedSheet) => {
    try {
      const response = await fetch(`/api/timesheets/${updatedSheet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSheet),
      });
      const editedSheet = await response.json();
      setTimeSheets(
        timeSheets.map((sheet) =>
          sheet.id === editedSheet.id ? editedSheet : sheet,
        ),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Time Sheets</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Employee</th>
            <th className="border px-4 py-2">Hours</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {timeSheets.map((sheet) => (
            <tr key={sheet.id}>
              <td className="border px-4 py-2">{sheet.id}</td>
              <td className="border px-4 py-2">{sheet.employeeName}</td>
              <td className="border px-4 py-2">{sheet.hours}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(sheet)}
                  className="text-blue-500">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(sheet.id)}
                  className="text-red-500 ml-2">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Add functionality for adding new time sheets here */}
    </div>
  );
};

export default ManageTimeSheets;

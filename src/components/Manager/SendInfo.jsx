import React, { useState } from "react";

const SendInfo = () => {
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleSend = () => {
    // Logic to send the message to the selected employee
    console.log(`Sending message to ${recipient}: ${message}`);
    // Reset fields after sending
    setMessage("");
    setRecipient("");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Send Information to Employees</h2>
      <div className="mb-4">
        <label className="block mb-2" htmlFor="recipient">
          Select Employee:
        </label>
        <select
          id="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="border rounded p-2 w-full">
          <option value="">Select an employee</option>
          {/* Replace with dynamic employee list */}
          <option value="employee1">Employee 1</option>
          <option value="employee2">Employee 2</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2" htmlFor="message">
          Message:
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border rounded p-2 w-full"
          rows="4"
        />
      </div>
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white rounded p-2">
        Send
      </button>
    </div>
  );
};

export default SendInfo;

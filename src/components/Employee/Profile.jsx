import React, { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    updateUser({ name, email });
    setIsEditing(false);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        ) : (
          <p className="mt-1 text-gray-900">{name}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        {isEditing ? (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        ) : (
          <p className="mt-1 text-gray-900">{email}</p>
        )}
      </div>
      <button
        onClick={isEditing ? handleSave : () => setIsEditing(true)}
        className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded">
        {isEditing ? "Save" : "Edit"}
      </button>
    </div>
  );
};

export default Profile;

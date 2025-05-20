import { useState, useEffect } from "react";
import React from "react";

const EditProfileView = ({ employee, setEmployee }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(employee?.photoUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        password: "",
        confirmPassword: "",
      });
      setPhotoPreview(employee.photoUrl || null);
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("La taille de la photo doit être inférieure à 5 Mo");
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreview = reader.result;
        setPhotoPreview(newPreview);
        // Store the preview in a more persistent way
        localStorage.setItem('profilePhotoPreview', newPreview);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Only validate password if either password field is filled
    if ((formData.password || formData.confirmPassword) && 
        formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Only append fields that have been changed and are not empty
      if (formData.name && formData.name !== employee.name) {
        formDataToSend.append("name", formData.name);
      }
      if (formData.email && formData.email !== employee.email) {
        formDataToSend.append("email", formData.email);
      }
      if (formData.password) {
        formDataToSend.append("password", formData.password);
      }
      if (photo) {
        formDataToSend.append("imageFile", photo);
      }

      // Only proceed if there are changes to send
      if (formDataToSend.entries().next().done) {
        setError("Aucune modification à enregistrer");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:8092/api/employee/${employee.id}`,
        {
          method: "PUT",
          body: formDataToSend,
        },
      );

      if (!response.ok) {
        throw new Error("Échec de la mise à jour du profil");
      }

      const updatedEmployee = await response.json();
      
      // Update the employee state while preserving the photo URL
      const updatedEmployeeWithPhoto = {
        ...updatedEmployee,
        photoUrl: updatedEmployee.photoUrl || employee.photoUrl || photoPreview
      };
      
      setEmployee(prevEmployee => ({
        ...prevEmployee,
        ...updatedEmployeeWithPhoto
      }));

      // Update photo preview with the new URL or keep the current preview
      if (updatedEmployee.photoUrl) {
        setPhotoPreview(updatedEmployee.photoUrl);
      } else if (photoPreview) {
        // Keep the current preview if no new URL is provided
        setPhotoPreview(photoPreview);
      }

      setSuccess(true);

      // Only clear password fields if they were updated
      if (formData.password) {
        setFormData(prev => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
      }

      // Clear the photo state after successful upload
      setPhoto(null);
    } catch (err) {
      setError(err.message);
      // If there's an error, keep the current photo preview
      if (photoPreview) {
        setPhotoPreview(photoPreview);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to restore photo preview on component mount
  useEffect(() => {
    const savedPreview = localStorage.getItem('profilePhotoPreview');
    if (savedPreview && !photoPreview) {
      setPhotoPreview(savedPreview);
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-sky-800">Modifier Mon Profil</h2>

      {success && (
        <div className="mb-4 p-4 bg-teal-100 text-teal-700 rounded">
          Votre profil a été mis à jour avec succès!
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-rose-100 text-rose-700 rounded">
          Erreur: {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6 text-center">
          <div className="relative inline-block">
            <img
              src={photoPreview || employee?.photoUrl || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-slate-200"
            />
            <label className="absolute bottom-0 right-0 bg-sky-500 p-2 rounded-full cursor-pointer hover:bg-sky-600">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Cliquez sur l'icône pour changer votre photo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-slate-700">
              Nom Complet (optionnel)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500"
              placeholder={employee?.name || "Votre nom"}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-slate-700">
              Email (optionnel)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500"
              placeholder={employee?.email || "Votre email"}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-slate-700">
              Nouveau Mot de Passe (optionnel)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-sm font-medium text-slate-700">
              Confirmer le Mot de Passe (optionnel)
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50">
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileView;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setAuthData } from "../Auth/auth";
import { CalendarClock } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Make the login request
      const response = await axios.post(
        "http://localhost:8092/api/auth/login",
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          validateStatus: (status) => status < 500, // Don't throw for 4xx errors
        },
      );

      console.log("Login response:", response);

      // 2. Handle different response statuses
      // Inside handleLogin function after successful login
      if (response.status === 200) {
        // Successful login
        const { token, role, employeeId } = response.data; // Destructure employeeId from response

        // Validate required fields
        if (!token || !role || !employeeId) {
          throw new Error("Missing token, role, or employeeId in response");
        }

        // Create user object with id, username, and role
        const user = { username, role, id: employeeId };

        console.log("Data: ", token, role, user);
        // Store authentication data
        setAuthData(token, role, user);

        // 3. Redirect based on role
        const roleRoutes = {
          admin: "/admin",
          manager: "/manager",
          chef: "/chef",
          employee: "/employee",
        };

        const redirectPath = roleRoutes[role.toLowerCase()] || "/";
        navigate(redirectPath);
      } else if (response.status === 401) {
        // Unauthorized
        throw new Error(
          response.data.message || "Invalid username or password",
        );
      } else {
        // Other 4xx errors
        throw new Error(
          response.data.message || "Login failed. Please try again.",
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <CalendarClock size="3rem" className="text-blue-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Login</h2>
          <p className="text-gray-600 mt-2">
            Enter your credentials to access your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } transition-colors`}>
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>

        <div className="mt-4 text-center text-sm">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Your Company. All rights reserved.
        </div>
      </form>
    </div>
  );
};

export default Login;

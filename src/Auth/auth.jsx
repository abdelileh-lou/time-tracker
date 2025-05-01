// export const setAuthData = (token, role, userData) => {
//   localStorage.setItem("token", token);
//   localStorage.setItem("role", role);
//   localStorage.setItem("userData", JSON.stringify(userData)); // Store user data
// };

// export const getAuthToken = () => {
//   return localStorage.getItem("token");
// };

// export const getUserRole = () => {
//   return localStorage.getItem("role");
// };

// export const getUserData = () => {
//   const userData = localStorage.getItem("userData");
//   return userData ? JSON.parse(userData) : null; // Parse user data if it exists
// };

// export const isAuthenticated = () => {
//   const token = getAuthToken();
//   return !!token; // Returns true if token exists, false otherwise
// };

// export const logout = () => {
//   localStorage.removeItem("token");
//   localStorage.removeItem("role");
//   localStorage.removeItem("userData"); // Clear user data
// };

// export const isTokenExpired = () => {
//   const token = getAuthToken();
//   if (!token) return true;

//   try {
//     const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
//     const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
//     return payload.exp < currentTime; // Check if token is expired
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return true; // Assume expired if decoding fails
//   }
// };

// auth.js
export const setAuthData = (token, role, responseData) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem(
    "userData",
    JSON.stringify({
      id: responseData.id, // Use responseData.id instead of employeeId
      username: responseData.username,
      role: responseData.role, // Optionally include role if needed
    }),
  );
};
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const getUserRole = () => {
  return localStorage.getItem("role");
};

export const getUserData = () => {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userData");
};

export const isTokenExpired = () => {
  const token = getAuthToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

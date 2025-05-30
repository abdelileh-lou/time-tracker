import React from "react";
import { Link } from "react-router-dom";

const Error = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="bg-[#0486c3] text-white px-6 py-2 rounded-3xl hover:bg-transparent hover:text-black border-4 border-[#0486c3] transition-all duration-300">
        Go Back Home
      </Link>
    </div>
  );
};

export default Error;

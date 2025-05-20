import React from "react";
import { Link } from "react-router";
import { Monitor } from "lucide-react";

const Header = () => {
  return (
    <header className="shadow-lg bg-sky-50 p-5">
      <div className="max-w-screen-xl mx-auto flex justify-center items-center">
        <div className="flex items-center justify-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Monitor size="3rem" className="text-sky-600" />
            <span className="text-2xl font-bold text-sky-600">TimeTracker</span>
          </Link>
          <ul className="flex gap-8 items-center">
            <li>
              <Link
                to="/"
                className="text-sky-700 hover:text-sky-600 transition-all duration-300 ease-in-out">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/service"
                className="text-sky-700 hover:text-sky-600 transition-all duration-300 ease-in-out">
                Services
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-sky-700 hover:text-sky-600 transition-all duration-300 ease-in-out">
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-sky-700 hover:text-sky-600 transition-all duration-300 ease-in-out">
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="bg-sky-600 px-5 py-2 rounded-lg cursor-pointer 
                  hover:bg-sky-700 hover:text-white transition-all duration-300 
                  ease-in-out border-2 border-sky-600 text-white shadow-md 
                  hover:shadow-lg">
                Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from "react";
import { Link } from "react-router";
import { Monitor } from "lucide-react";

const Header = () => {
  return (
    <header className="shadow-lg bg-white p-5">
      <div className="max-w-screen-xl mx-auto flex justify-center items-center">
        <div className="flex items-center justify-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Monitor size="3rem" className="text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-600">TimeTracker</span>
          </Link>
          <ul className="flex gap-8 items-center">
            <li>
              <Link
                to="/"
                className="hover:text-emerald-600 transition-all duration-300 ease-in-out">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/service"
                className="hover:text-emerald-600 transition-all duration-300 ease-in-out">
                Services
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-emerald-600 transition-all duration-300 ease-in-out">
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-emerald-600 transition-all duration-300 ease-in-out">
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="bg-emerald-600 px-5 py-2 rounded-3xl cursor-pointer hover:bg-transparent hover:text-emerald-600 transition-all duration-300 ease-in-out border-4 border-emerald-600 text-white">
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
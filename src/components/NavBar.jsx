import React from "react";
import { Link } from "react-router";
import { CalendarClock } from "lucide-react";

const Header = () => {
  return (
    <header className="shadow-xl bg-white p-5">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div>
          <Link to="/">
            <CalendarClock size="3rem" color="#0486c3" />
          </Link>
        </div>

        <div className="flex justify-between basis-[80%] font-bold">
          <ul className="flex gap-8 items-center justify-between basis-[70%]">
            <li>
              <Link
                to="/"
                className="hover:text-[#0486c3] transition-all duration-300 ease-in-out">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/service"
                className="hover:text-[#0486c3] transition-all duration-300 ease-in-out">
                Services
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-[#0486c3] transition-all duration-300 ease-in-out">
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-[#0486c3] transition-all duration-300 ease-in-out">
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="bg-[#0486c3] px-5 py-2 rounded-3xl cursor-pointer hover:bg-transparent hover:text-[#0486c3] transition-all duration-300 ease-in-out border-4 border-[#0486c3] text-white">
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

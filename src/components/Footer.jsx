import React from "react";

const Footer = () => {
  return (
    <div>
      <footer>
        <div className="flex items-center justify-center bg-gray-800 text-white h-16">
          <p className="text-sm">
            © 2023 Your Company Name. All rights reserved.
          </p>
        </div>
        <div className="flex items-center justify-center bg-gray-900 text-white h-16">
          <p className="text-sm">Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;

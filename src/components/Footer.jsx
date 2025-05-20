import React from "react";

const Footer = () => {
  return (
    <footer className="bg-sky-50">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex items-center justify-between py-8 px-4 border-b border-sky-200">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-sky-900">TimeTracker</h3>
            <p className="text-sky-700">Modern time tracking solution</p>
          </div>

          <div className="flex gap-8 text-sky-600">
            <a href="#" className="hover:text-sky-800 transition-colors">
              About
            </a>
            <a href="#" className="hover:text-sky-800 transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-sky-800 transition-colors">
              Support
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between py-6 px-4 bg-sky-100">
          <p className="text-sm text-sky-700">
            © 2024 TimeTracker. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-sky-600">
            <a href="#" className="hover:text-sky-800 transition-colors">
              Privacy Policy
            </a>
            <span className="text-sky-400">|</span>
            <a href="#" className="hover:text-sky-800 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-white h-16 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <a href="https://superlabs.co/" target="_blank" rel="noopener noreferrer">
          <img src={logo} alt="superlabs-logo" className="w-32 h-auto" />
        </a>
      </div>

      {/* Desktop Menu */}
      {/* <ul className="hidden lg:flex items-center space-x-8 text-gray-700 font-semibold">
        <li className="hover:text-red-500 cursor-pointer">Work</li>
        <li className="hover:text-red-500 cursor-pointer">Services</li>
        <li className="hover:text-red-500 cursor-pointer">Strategy</li>
        <li className="hover:text-red-500 cursor-pointer">Careers</li>
      </ul> */}

      {/* Mobile Menu */}
      {/* <div className="lg:hidden">
        <ul className="flex space-x-4 text-gray-700">
          <li className="hover:text-red-500 cursor-pointer">Work</li>
          <li className="hover:text-red-500 cursor-pointer">Services</li>
          <li className="hover:text-red-500 cursor-pointer">Strategy</li>
          <li className="hover:text-red-500 cursor-pointer">Careers</li>
        </ul>
      </div> */}
    </nav>
  );
};

export default Navbar;
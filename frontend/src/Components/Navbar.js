import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBook,
  faChalkboardTeacher,
  faSignInAlt,
  faUserPlus,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center font-Dosis">
      <div className="text-white text-3xl">
        <Link to="/">
          Rate <span className="text-red-500">My</span> Course
        </Link>
      </div>
      <div className="lg:hidden">
        <button className="text-white focus:outline-none" onClick={toggleMenu}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
      {/* Sidebar */}
      <div
        className={`${
          isMenuOpen ? "fixed inset-0 bg-gray-800 bg-opacity-75 z-50" : "hidden"
        } lg:hidden`}
        onClick={toggleMenu}
      >
        {/* Sidebar Content */}
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 p-4">
          <div className="text-white mb-4 text-2xl">
            <Link to="/">Rate My Course</Link>
          </div>
          <div className="text-white">
            <Link
              to="/"
              className="block py-2 hover:text-red-400 active:text-red-500 transition duration-300 ease-in-out"
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Home
            </Link>
            <Link
              to="/courses"
              className="block py-2 hover:text-red-400 active:text-red-500 transition duration-300 ease-in-out"
            >
              <FontAwesomeIcon icon={faBook} className="mr-2" />
              Courses
            </Link>
            <Link
              to="/instructors"
              className="block py-2 hover:text-red-400 active:text-red-500 transition duration-300 ease-in-out"
            >
              <FontAwesomeIcon icon={faChalkboardTeacher} className="mr-2" />
              Instructors
            </Link>
            <Link
              to="/login"
              className="block py-2 hover:text-red-400 active:text-red-500 transition duration-300 ease-in-out"
            >
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
              Login
            </Link>
            <Link
              to="/adminOrStudent"
              className="block py-2 hover:text-red-400 active:text-red-500 transition duration-300 ease-in-out"
            >
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
              Signup
            </Link>
          </div>
        </div>
      </div>
      {/* Large Screen Icons */}
      <div className="hidden lg:flex items-center text-white">
        <Link
          to="/"
          className="mx-2 hover:text-red-400 active:text-red-500 transition duration-300 ease-in-out"
        >
          <FontAwesomeIcon icon={faHome} className="mr-2" />
        </Link>
        <Link
          to="/courses"
          className="mx-2 hover:text-red-400 active:text-red-500 transition duration-300 ease-in-out"
        >
          Courses
        </Link>
        <Link
          to="/instructors"
          className="mx-2 hover:text-red-400 active:text-red-500 transition duration-300 ease-in-out"
        >
          Instructors
        </Link>
        <Link
          to="/login"
          className="mx-2 hover:text-red-400 active:text-red-500 transition duration-300 ease-in-out"
        >
          Login
        </Link>
        <Link
          to="/adminOrStudent"
          className="mx-2 hover:text-red-400 active:text-red-500 transition duration-300 ease-in-out"
        >
          Signup
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

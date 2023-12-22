import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4 flex justify-between items-center">
      <div className="text-white text-2xl font-bold">
        <Link to="/">Rate My Course</Link>
      </div>
      <div className="text-white ml-4 text-lg no-underline">
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/instructors">Instructors</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </div>
    </nav>
  );
};

export default Navbar;

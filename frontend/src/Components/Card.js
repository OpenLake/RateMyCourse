import React from "react";
import Image from "../Assets/Student.svg";

const Card = () => {
  return (
    <div className="w-72 my-4 mx-7 bg-gray-200 shadow-md rounded p-4 font-sans">
      <div>
        <img src={Image} alt="" />
      </div>
      <div className="mt-4">
        <h2 className="text-2xl font-bold text-gray-800 font-Dosis">Course Name</h2>
        <p>Instructor : ABC</p>
        <p>Course Ratings : 3.5/5</p>
      </div>
    </div>
  );
};

export { Card };

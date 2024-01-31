import React from "react";
import { useNavigate } from "react-router-dom";
import Image from "../Assets/Student.svg";

const InstructorCard = () => {
  const navigate = useNavigate();

  const gotoDetails = () => {
    navigate("/instructorDetails");
  };

  return (
    <div
      onClick={gotoDetails}
      className=" w-40 md:w-52 lg:w-60 xl:w-72 my-4 mx-3 md:mx-4 lg:mx-7 bg-gray-200 shadow-md rounded p-4 font-sans"
    >
      <div>
        <img src={Image} alt="" />
      </div>
      <div className="mt-4 text-sm md:text-base">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 font-Dosis">
          Instructor Name
        </h2>
        <p>Department : ABC</p>
        <p>Instructor Ratings : 3.5/5</p>
      </div>
    </div>
  );
};

export { InstructorCard };

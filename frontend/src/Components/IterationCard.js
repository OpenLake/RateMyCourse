import React from "react";
import { useNavigate } from "react-router-dom";

const IterationCard = () => {
  const navigate = useNavigate();

  const gotoDetails = () => {
    navigate("/courseDetails");
  };

  return (
    <div
      onClick={gotoDetails}
      className=" w-40 md:w-52 lg:w-60 xl:w-72 my-4 mx-3 md:mx-4 lg:mx-7 bg-gray-200 shadow-md rounded p-4 font-sans"
    >
      <div className="mt-4 text-sm md:text-base">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 font-Dosis">
          Course Name
        </h2>
        <p>Iteration : 2024-25-M</p>
      </div>
    </div>
  );
};

export { IterationCard };

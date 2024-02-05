import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const Searchbar = () => {
  return (
    <div className=" flex flex-row h-5 md:h-auto shadow-md rounded-lg">
      <input
        placeholder="Search"
        className="bg-gray-200 text-xs md: w-20 p-2 rounded-l-lg"
      />
      <button className="bg-gray-800 text-white text-xs flex justify-center p-1 md:p-2 md:px-3 rounded-r-lg ">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
    </div>
  );
};

export { Searchbar };

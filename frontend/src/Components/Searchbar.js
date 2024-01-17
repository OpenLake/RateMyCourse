import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const Searchbar = () => {
  return (
    <div className="w-fit shadow-md rounded-lg">
      <input placeholder="Search" className="bg-gray-200 p-2 rounded-l-lg" />
      <button className="bg-gray-800 text-white p-2 px-3 rounded-r-lg ">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
    </div>
  );
};

export { Searchbar };

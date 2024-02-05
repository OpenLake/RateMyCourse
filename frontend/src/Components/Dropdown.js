import React from "react";

const Dropdown = () => {
  return (
    <select
      className="rounded-lg bg-gray-200 p-2 text-gray-800 font-sans"
      // Add additional classes or event handlers as needed
    >
      <option value="" disabled selected>
        Filter by branch
      </option>
      <option value="CSE">CSE</option>
      <option value="DS&AI">DS & AI</option>
      <option value="EE">EE</option>
      <option value="Mechanical">Mechanical</option>
      <option value="Mechatronics">Mechatronics</option>
    </select>
  );
};

export { Dropdown };

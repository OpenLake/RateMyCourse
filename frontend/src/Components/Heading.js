import React from "react";

const Heading = (props) => {
  return (
    <div className="text-5xl text-center font-Dosis m-5 font-semibold text-gray-800">
      {props.val}
    </div>
  );
};

export { Heading };

import React from "react";
import Navbar from "../Components/Navbar";

const Home = () => {
  return (
    <div>
      <Navbar />
      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold">Rate My Course</h1>
        <p className="mt-10">
          Rate My Course is a web application that allows students to rate and
          review their courses and instructors.
        </p>
      </div>
    </div>
  );
};

export { Home };

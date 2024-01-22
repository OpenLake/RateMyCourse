import React from "react";
import { Heading } from "../Components/Heading";
import { Card } from "../Components/Card";
import { Searchbar } from "../Components/Searchbar";
import { Dropdown } from "../Components/Dropdown";

const Home = () => {
  return (
    <div className="mt-10">
      {/* <h1 className="text-3xl font-extrabold">Rate My Course</h1>
        <p className="mt-10">
          Rate My Course is a web application that allows students to rate and
          review their courses and instructors.
        </p> */}
      <Heading val="All Courses" />
      <div className="mx-14 flex flex-row justify-between">
        <Searchbar />
        <Dropdown />
      </div>
      <div className="flex flex-wrap justify-center m-4">
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
      </div>
    </div>
  );
};

export { Home };

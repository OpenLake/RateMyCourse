import React from "react";
import { Heading } from "../Components/Heading";
import { InstructorCard } from "../Components/InstructorCard";
import { Searchbar } from "../Components/Searchbar";
import { Dropdown } from "../Components/Dropdown";

const Instructors = () => {
  return (
    <div className="mt-10">
      <Heading val="All Courses" />
      <div className="mx-14 flex flex-row justify-between">
        <Searchbar />
        <Dropdown />
      </div>
      <div className="flex flex-wrap justify-center m-4">
        <InstructorCard />
        <InstructorCard />
        <InstructorCard />
        <InstructorCard />
        <InstructorCard />
        <InstructorCard />
        <InstructorCard />
        <InstructorCard />
      </div>
    </div>
  );
};

export { Instructors };

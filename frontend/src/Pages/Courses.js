import React from "react";
import { Heading } from "../Components/Heading";
import { CourseCard } from "../Components/CourseCard";
import { Searchbar } from "../Components/Searchbar";
import { Dropdown } from "../Components/Dropdown";

const Courses = () => {
  return (
    <div className="mt-10">
      <Heading val="All Courses" />
      <div className="mx-14 flex flex-row justify-between">
        <Searchbar />
        <Dropdown />
      </div>
      <div className="flex flex-wrap justify-center m-4">
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
      </div>
    </div>
  );
};

export { Courses };

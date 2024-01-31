import React from "react";
import { Heading } from "../Components/Heading";
import { TeacherCard } from "../Components/TeacherCard";
import { Searchbar } from "../Components/Searchbar";
import { Dropdown } from "../Components/Dropdown";

const Teachers = () => {
  return (
    <div className="mt-10">
      <Heading val="All Courses" />
      <div className="mx-14 flex flex-row justify-between">
        <Searchbar />
        <Dropdown />
      </div>
      <div className="flex flex-wrap justify-center m-4">
        <TeacherCard />
        <TeacherCard />
        <TeacherCard />
        <TeacherCard />
        <TeacherCard />
        <TeacherCard />
        <TeacherCard />
        <TeacherCard />
      </div>
    </div>
  );
};

export { Teachers };

import React from "react";
import { Heading } from "../Components/Heading";
import { Reviews } from "../Components/Reviews";
import { ThemeButton } from "../Components/Buttons";
import { Description } from "../Components/Description";
import Image from "../Assets/Student.svg";

const CourseDetails = () => {
  return (
    <div className="mt-10">
      <Heading val="Course Details" />

      {/* Top section */}
      <div className="flex flex-row mx-14">
        <div className="flex flex-col w-5/6">
          <p className="font-Dosis my-3 text-4xl">
            Mathematical Foundation for ML, AI and Data Science
          </p>
          <div className="flex flex-row text-xl font-medium my-1">
            <span className="mr-10">
              Ratings : <span className="font-normal">3.5/5</span>
            </span>
            <span>
              Code : <span className="font-normal">CS-365</span>
            </span>
          </div>
          <p className="text-xl font-medium my-1">
            Instructor : <span className="font-normal">Pawan Kumar Tiwari</span>
          </p>
          <div className="w-auto">
            <ThemeButton val="Rate Course" navigation="/rateCourse" />
          </div>
        </div>
        <div className="w-1/6">
          <img src={Image} alt="failed brutally" />
        </div>
      </div>

      {/* Despription */}
      <Description />

      {/* Reviews */}
      <Reviews />
    </div>
  );
};

export { CourseDetails };

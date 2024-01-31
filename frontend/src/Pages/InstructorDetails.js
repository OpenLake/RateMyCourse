import React from "react";
import { Heading } from "../Components/Heading";
import { Reviews } from "../Components/Reviews";
import { ThemeButton } from "../Components/Buttons";
import { Description } from "../Components/Description";
import Image from "../Assets/Student.svg";

const InstructorDetails = () => {
  return (
    <div className="mt-10">
      <Heading val="Instructor Details" />

      {/* Top section */}
      <div className="flex flex-row mx-14">
        <div className="flex flex-col w-5/6">
          <p className="font-Dosis my-3 text-4xl">Pawan Kumar Tiwari</p>
          <div className="flex flex-row text-xl font-medium my-1">
            <span className="mr-10">
              Ratings : <span className="font-normal">1/5</span>
            </span>
            <span>
              Dept : <span className="font-normal">CS</span>
            </span>
          </div>
          <p className="text-xl font-medium my-1">
            Instructor ID : <span className="font-normal">IGSUB102</span>
          </p>
          <div className="w-auto">
            <ThemeButton val="Rate Instructor" navigation="/rateInstructor" />
          </div>
        </div>
        <div className="w-1/6">
          <img src={Image} alt="failed brutally" />
        </div>
      </div>

      {/* Despription */}
      <Description />

      {/* Reviews */}
      {/* <Reviews /> */}
    </div>
  );
};

export { InstructorDetails };

import React from "react";
import { BlueButton } from "../Components/Buttons";
import { Heading } from "../Components/Heading";

const Home = () => {
  return (
    <div className="container text-center md:text-left mx-auto px-4 py-8">
      <Heading val="Rate My Course" />
      <p className="text-lg mb-6">
        Rate My Course is a platform designed to assist college students in
        making informed decisions about their course selections. Students can
        browse and read reviews about various courses and instructors, helping
        them choose the best options for their academic journey.
      </p>
      <p className="text-lg mb-6">
        Whether you're looking for insights into a specific course or seeking
        feedback on an instructor, Rate My Course provides a comprehensive
        database of ratings and reviews contributed by fellow students.
      </p>
      <div className="flex flex-col md:flex-row justify-center md:justify-start">
        <div className="mb-4 md:mb-0 md:mr-4">
          <BlueButton val="Discover Courses" navigation="/courses" />
        </div>
        <div>
          <BlueButton val="Discover Instructors" navigation="/teachers" />
        </div>
      </div>
    </div>
  );
};

export { Home };

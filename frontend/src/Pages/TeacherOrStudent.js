import React from "react";
import Student from "../Assets/Student.svg";
import Teacher from "../Assets/Teacher.svg";

const TeacherOrStudent = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1>Are you a teacher or a student?</h1>
      <div className="flex flex-row">
        <div className="flex flex-col">
          <img src={Student} alt="Student" />
          <button>Student</button>
        </div>
        <div className="flex flex-col">
          <img src={Teacher} alt="Teacher" />
          <button>Teacher</button>
        </div>
      </div>
    </div>
  );
};

export { TeacherOrStudent };

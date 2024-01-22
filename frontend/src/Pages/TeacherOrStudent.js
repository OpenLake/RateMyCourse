import React from "react";
import { useNavigate } from "react-router-dom";
import Student from "../Assets/Student.svg";
import Teacher from "../Assets/Teacher.svg";

const TeacherOrStudent = () => {
  const navigate = useNavigate();

  const studentSignup = () => {
    navigate("/studentSignup");
  };
  const teacherSignup = () => {
    navigate("/teacherSignup");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className=" text-3xl">Are you a student or a teacher?</h1>
      <div className="flex flex-row ">
        <div className="flex flex-col items-center">
          <img
            src={Student}
            alt="Student"
            className="h-52 mt-5 mx-10 cursor-pointer"
            onClick={studentSignup}
          />
          <p className="text-xl cursor-pointer" onClick={studentSignup}>
            Student
          </p>
        </div>
        <div className="flex flex-col items-center">
          <img
            src={Teacher}
            alt="Teacher"
            className="h-52 mt-5 mx-10 cursor-pointer"
            onClick={teacherSignup}
          />
          <p className="text-xl cursor-pointer" onClick={teacherSignup}>
            Teacher
          </p>
        </div>
      </div>
    </div>
  );
};

export { TeacherOrStudent };

import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Input } from "../../Components/Input";
import { BlueButton } from "../../Components/Buttons";

const AddIteration = () => {
  const [instructor, setInstructor] = useState("");
  const [sem, setSem] = useState("");
  const [description, setDescription] = useState("");
  const [prerequisite, setPrerequisite] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to handle signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/", {
        instructor: instructor,
        sem: sem,
        description: description,
        prerequisite: prerequisite,
      });
      console.log(res);
      setLoading(false);
      alert("Course Iteration Added Successfully");
    } catch (error) {
      console.error("Error during post request:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Add Course Iteration
        </h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Instructor"
            type="text"
            placeholder="Enter Instructor Name"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
          />
          <Input
            label="Semester"
            type="text"
            placeholder="Enter Semester(eg. 2024-25-M)"
            value={sem}
            onChange={(e) => setSem(e.target.value)}
          />
          <textarea
            cols="30"
            rows="10"
            value={description}
            placeholder="Enter Description"
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Prerequisite"
            type="text"
            placeholder="Enter Prerequisite"
            value={prerequisite}
            onChange={(e) => setPrerequisite(e.target.value)}
          />
          <div className="text-center">
            <BlueButton val="Submit" loading={loading} />
          </div>
        </form>
      </div>
    </div>
  );
};

export { AddIteration };

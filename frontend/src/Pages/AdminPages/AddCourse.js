import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Input } from "../../Components/Input";
import { BlueButton } from "../../Components/Buttons";

const AddCourse = () => {
  const [cname, setCname] = useState("");
  const [ccode, setCcode] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to handle signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/studentSignup", {
        cname: cname,
        ccode: ccode,
      });
      console.log(res);
      setLoading(false);
      alert("Course Added Successfully");
    } catch (error) {
      console.error("Error during post request:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">Add Course</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Course Name"
            type="text"
            placeholder="Enter Course Name"
            value={cname}
            onChange={(e) => setCname(e.target.value)}
          />
          <Input
            label="Course Code"
            type="text"
            placeholder="Enter Course Code"
            value={ccode}
            onChange={(e) => setCcode(e.target.value)}
          />
          <div className="text-center">
            <BlueButton val="Submit" loading={loading} />
          </div>
        </form>
      </div>
    </div>
  );
};

export { AddCourse };

import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Input } from "../Components/Input";
import { BlueButton } from "../Components/Buttons";

const TeacherSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [dept, setDept] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/teacherSignup", {
        name: name,
        email: email,
        teacherId: teacherId,
        dept: dept,
        password: password,
      });
      console.log(res);
      setLoading(false);
      alert("Email verification link sent. Click to verify.");
    } catch (error) {
      console.error("Error during post request:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Teacher Sign Up
        </h2>
        <form onSubmit={handleSignup}>
          <Input
            label="Name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="TeacherId"
            type="text"
            placeholder="Enter teacher ID"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          />

          <Input
            label="Dept"
            type="text"
            placeholder="Enter department name"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-center">
            <BlueButton val="Sign Up" loading={loading} />
          </div>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export { TeacherSignup };

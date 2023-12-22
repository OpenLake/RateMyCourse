import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "../Components/Input";
import { BlueButton } from "../Components/Buttons";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to handle signup
  const handleSignup = (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(name, email, branch, year, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Branch
            </label>
            <div className="mt-1">
              <select
                id="branch"
                name="branch"
                className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none "
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="" disabled >
                  Select Branch
                </option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EE">EE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="CHEM">CHEM</option>
                <option value="BIOTECH">BIOTECH</option>
              </select>
            </div>
          </div>

          <Input
            label="Year"
            type="text"
            placeholder="Enter your year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
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

export { Signup };

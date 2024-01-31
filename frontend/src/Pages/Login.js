import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Input } from "../Components/Input";
import { BlueButton } from "../Components/Buttons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  const studentLogin = async () => {
    try {
      const res = await axios.post("/auth/user/login", {
        email: email,
        password: password,
      });
      console.log(res);
      setLoading(false);
      alert("Login Successful");
    } catch (error) {
      setLoading(false);
      alert("Login Failed");
      console.error("Error logging in : ", error);
    }
  };

  const adminLogin = async () => {
    try {
      const res = await axios.post("/auth/admin/login", {
        email: email,
        password: password,
      });
      console.log(res);
      setLoading(false);
      alert("Login Successful");
    } catch (error) {
      setLoading(false);
      alert("Login Failed");
      console.error("Error logging in : ", error);
    }
  };

  // Function to handle login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    if (type === "student") {
      studentLogin();
    } else {
      adminLogin();
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select user type :
            </label>
            <div className="mt-1">
              <select
                id="type"
                name="type"
                className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none "
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="" disabled selected>
                  Select type
                </option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-center">
            <BlueButton val="Login" loading={loading} />
          </div>
        </form>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/adminOrStudent" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export { Login };

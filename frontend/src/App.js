import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import axios from "axios";

import { Home } from "./Pages/Home";
import { Courses } from "./Pages/Courses";
import { Iterations } from "./Pages/Iterations";
import { Instructors } from "./Pages/Instructors";
import { Login } from "./Pages/Login";
import { StudentSignup } from "./Pages/StudentSignup";
import { AdminSignup } from "./Pages/AdminSignup";
import { AdminOrStudent } from "./Pages/AdminOrStudent";
import { CourseDetails } from "./Pages/CourseDetails";
import { AddCourse } from "./Pages/AdminPages/AddCourse";
import { AddIteration } from "./Pages/AdminPages/AddIterations";
import { InstructorDetails } from "./Pages/InstructorDetails";

axios.defaults.baseURL = "https://rmc-backend.cyclic.app/";

function App() {
  return (
    <div>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/iterations" element={<Iterations />} />
            <Route path="/courseDetails" element={<CourseDetails />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/instructorDetails" element={<InstructorDetails />} />
            <Route path="/adminOrStudent" element={<AdminOrStudent />} />
            <Route path="/studentSignup" element={<StudentSignup />} />
            <Route path="/adminSignup" element={<AdminSignup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/addCourse" element={<AddCourse />} />
            <Route path="/addIteration" element={<AddIteration />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;

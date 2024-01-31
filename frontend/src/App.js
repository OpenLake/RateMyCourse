import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";

import { Home } from "./Pages/Home";
import { Courses } from "./Pages/Courses";
import { Iterations } from "./Pages/Iterations";
import { Teachers } from "./Pages/Teachers";
import { Login } from "./Pages/Login";
import { StudentSignup } from "./Pages/StudentSignup";
import { TeacherSignup } from "./Pages/TeacherSignup";
import { TeacherOrStudent } from "./Pages/TeacherOrStudent";
import { CourseDetails } from "./Pages/CourseDetails";
import { AddCourse } from "./Pages/AdminPages/AddCourse";
import { AddIteration } from "./Pages/AdminPages/AddIterations";
import { TeacherDetails } from "./Pages/TeacherDetails";

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
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teacherDetails" element={<TeacherDetails />} />
            <Route
              path="/teacherOrStudent"
              element={<TeacherOrStudent />}
            />{" "}
            <Route path="/studentSignup" element={<StudentSignup />} />
            <Route path="/teacherSignup" element={<TeacherSignup />} />
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

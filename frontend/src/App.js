import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { Home } from "./Pages/Home";
import { Login } from "./Pages/Login";
import { StudentSignup } from "./Pages/StudentSignup";
import { TeacherSignup } from "./Pages/TeacherSignup";
import { TeacherOrStudent } from "./Pages/TeacherOrStudent";

function App() {
  return (
    <div>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teacherorstudent" element={<TeacherOrStudent />} />
            <Route path="/studentSignup" element={<StudentSignup />} />
            <Route path="/teacherSignup" element={<TeacherSignup />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { Home } from "./Pages/Home";
import { Login } from "./Pages/Login";
import { Signup } from "./Pages/Signup";
import { TeacherOrStudent } from "./Pages/TeacherOrStudent";

function App() {
  return (
    <div >
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teacherorstudent" element={<TeacherOrStudent />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;

import React from "react";
import Navbar from "./Components/Navbar";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="main-content">{children}</div>
    </div>
  );
};

export { Layout };

import React from "react";
import Navbar from "./Components/Navbar";

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className="main-content">{children}</div>
    </div>
  );
};

export { Layout };

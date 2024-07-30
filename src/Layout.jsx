// Layout.js
import React from "react";
import { NavBar } from "./components/navbar/NavBar";
import Login from "./Login";

const Layout = ({ children }) => {
  return (
    <div>
      <NavBar />
      <div className="p-1">{children}</div>
    </div>
  );
};

export default Layout;

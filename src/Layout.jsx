// Layout.js
import React from "react";
import NavBar from "./NavBar";
import { NavBarTest } from "./components/navbar/NavBar";
import Login from "./Login";

const Layout = ({ children }) => {
  return (
    <div>
      {/* <NavBar /> */}
      <NavBarTest />
      <div className="p-1">{children}</div>
    </div>
  );
};

export default Layout;

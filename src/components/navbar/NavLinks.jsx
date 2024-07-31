import React from "react";
import { NavLink } from "./NavLink";

export const NavLinks = () => {
  return (
    <ul className="flex gap-3 text-zinc-400 md:gap-9">
      <li>
        <NavLink href="/">Home</NavLink>
      </li>
      <li>
        <NavLink href="/problems">Problems</NavLink>
      </li>
      <li>
        <NavLink href="/submission">Submit</NavLink>
      </li>
      <li>
        <NavLink href="/contact">Contact</NavLink>
      </li>
      <li>
        <NavLink href="/visuals">Visualisations</NavLink>
      </li>
    </ul>
  );
};

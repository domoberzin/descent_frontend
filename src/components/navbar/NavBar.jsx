import React, { useState } from "react";
import { MaxWidthWrapper } from "../utils/MaxWidthWrapper";
import { NavLogo } from "./NavLogo";
import { NavLinks } from "./NavLinks";
import { NavCTAs } from "./NavCTAs";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 150) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  const isHomePage = location.pathname === "/";

  return (
    <motion.nav
      initial={{
        opacity: 0,
        y: "-100%",
      }}
      animate={{
        opacity: 1,
        y: "0%",
      }}
      transition={{
        duration: 1.25,
        ease: "easeInOut",
      }}
      className={`${
        isHomePage ? "fixed" : ""
      } left-0 right-0 top-0 z-50 bg-zinc-950/10 py-3 transition-colors ${
        scrolled && "backdrop-blur"
      }`}
    >
      <MaxWidthWrapper>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex gap-5 items-center justify-center">
              <NavLogo />
              <h1 className="text-lg">DescentAI</h1>
            </div>
            <div className="hidden md:block">
              <NavLinks />
            </div>
          </div>
          <NavCTAs />
        </div>
        <div className="block pt-1.5 md:hidden">
          <NavLinks />
        </div>
      </MaxWidthWrapper>
    </motion.nav>
  );
};

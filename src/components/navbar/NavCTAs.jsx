import React from "react";
import { SplashButton } from "../buttons/SplashButton";
import { GhostButton } from "../buttons/GhostButton";

export const NavCTAs = () => {
  return (
    <div className="flex items-center gap-2">
      <a href="/signup">
        <GhostButton className="rounded-md px-4 py-1 text-base">
          Sign up
        </GhostButton>
      </a>
      <a href="/signin">
        <SplashButton className="px-4 py-1 text-base text-zinc-100">
          Sign in
        </SplashButton>
      </a>
    </div>
  );
};

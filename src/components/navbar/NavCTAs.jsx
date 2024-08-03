import React, { useState } from "react";
import { SplashButton } from "../buttons/SplashButton";
import { GhostButton } from "../buttons/GhostButton";
import Login from "../../Login";
import { useAuth } from '../AuthContext';

export const NavCTAs = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, loading } = useAuth();

  const toggleLoginModal = () => {
    setIsLoginModalOpen(!isLoginModalOpen);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <SplashButton
          className="px-4 py-1 text-base text-zinc-100"
          onClick={toggleLoginModal}
        >
          Profile
        </SplashButton>
      ) : (
        <>
          <a href="/signup">
            <GhostButton className="rounded-md px-4 py-1 text-base">
              Sign up
            </GhostButton>
          </a>
          <SplashButton
            className="px-4 py-1 text-base text-zinc-100"
            onClick={toggleLoginModal}
          >
            Sign in
          </SplashButton>
        </>
      )}
      <Login
        isModalOpen={isLoginModalOpen}
        toggleModal={toggleLoginModal}
      />
    </div>
  );
};
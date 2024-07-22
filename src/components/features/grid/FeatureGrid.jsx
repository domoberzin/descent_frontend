import React from "react";
import { Content } from "./Content";
import { CornerBlur } from "../../utils/CornerBlur";
import { CornerGrid } from "../../utils/CornerGrid";

export const FeatureGrid = () => {
  return (
    <div id="features" className="relative overflow-hidden">
      <Content />
      <CornerBlur />
      <CornerGrid />
    </div>
  );
};

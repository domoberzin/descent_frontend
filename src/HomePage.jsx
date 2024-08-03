import React from "react";
import { Hero } from "./components/hero/Hero";
import Carousel from "./components/features/carousel/Carousel";
import { FeatureGrid } from "./components/features/grid/FeatureGrid";

export default function Home() {
  return (
    <div>
      <Hero />
      <FeatureGrid />
      <Carousel />
    </div>
  );
}

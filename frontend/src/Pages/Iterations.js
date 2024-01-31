import React from "react";
import { Heading } from "../Components/Heading";
import { IterationCard } from "../Components/IterationCard";

const Iterations = () => {
  return (
    <div className="mt-10">
      <Heading val="Iterations" />
      <div className="flex flex-wrap justify-center m-4">
        <IterationCard />
        <IterationCard />
        <IterationCard />
        <IterationCard />
        <IterationCard />
        <IterationCard />
        <IterationCard />
        <IterationCard />
      </div>
    </div>
  );
};

export { Iterations };

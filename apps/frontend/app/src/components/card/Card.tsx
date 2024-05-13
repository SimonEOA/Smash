"use client";

import { useEffect, useState } from "react";

const Card = ({
  children,
  isFlipped,
  setIsFlipped,
  guessedWrong,
}: {
  children: React.ReactNode;
  isFlipped: boolean;
  setIsFlipped: (isFlipped: boolean) => void;
  guessedWrong?: boolean;
}) => {
  return (
    <div
      className="flip cursor-pointer"
      onClick={() => {
        setIsFlipped(!isFlipped);
        console.log("flipped");
      }}
    >
      <div
        className={`flip-content ${isFlipped ? "flip-card" : ""}  ${
          guessedWrong ? "animate-wiggle" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};
export default Card;

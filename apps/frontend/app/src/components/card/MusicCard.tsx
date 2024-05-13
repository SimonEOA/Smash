"use client";

import { useEffect, useState } from "react";
import Card from "./Card";

const MusicCard = ({
  id,
  title,
  description,
  thing,
  category,
  keyValue,
  currentSongId,
}: {
  id: number;
  title: string;
  description: string;
  thing: string;
  category: string;
  keyValue: string;
  currentSongId: number | undefined | null;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [keyDown, setKeyDown] = useState(false);
  const [guessedWrong, setGuessedWrong] = useState(false);

  useEffect(() => {
    // add keydown event listener for keyValue to flip card if currentSong is the same as keyValue
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === keyValue) {
        setKeyDown(true);
        if (currentSongId === id) {
          setIsFlipped(!isFlipped);
        } else {
          setGuessedWrong(true);
          setTimeout(() => {
            setGuessedWrong(false);
          }, 1000);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // add keyup event listener to reset keyDown state
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === keyValue) {
        setKeyDown(false);
      }
    };
    window.addEventListener("keyup", handleKeyUp);
    // remove event listener when component is unmounted
    // remove event listener when component is unmounted
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isFlipped, keyValue, currentSongId, id]);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Card
        isFlipped={isFlipped}
        setIsFlipped={setIsFlipped}
        guessedWrong={guessedWrong}
      >
        <div className="flip-front">
          <p className="text-lg font-medium">{thing}</p>
          <p>{category}</p>
        </div>
        <div className="flip-back">
          <p className="text-lg font-semibold">{title}</p>
          <p>{description}</p>
        </div>
      </Card>
      <div
        className={` flex h-12 w-12 items-center justify-center rounded border-white/10  transition-all  ${
          keyDown ? " bg-white/10" : " bg-white/15"
        }`}
      >
        {keyValue}
      </div>
    </div>
  );
};
export default MusicCard;

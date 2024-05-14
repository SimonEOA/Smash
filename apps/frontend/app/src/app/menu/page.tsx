"use client";

import MenuCard from "@/components/card/MenuCard";
import Link from "next/link";

const Menu = () => {
  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-10">
      <div className=" flex flex-col gap-4 justify-center items-center">
        <h2 className="text-4xl">Select game type</h2>
        <div className=" flex flex-row gap-4">
          <MenuCard
            title={"Local"}
            description={
              "All your friends, one keyboard, one winner, be the first one to find the right key"
            }
            linkTitle="Play"
            link={"/local"}
          />
          <MenuCard
            title={"Online"}
            description={
              "Play with your friends online, be the first one to find the right key"
            }
            linkTitle="Play"
            link={"/online"}
          />
          <MenuCard
            title={"Print"}
            description={
              "Print out cards to play the game physically with your friends"
            }
            linkTitle="Play"
            link={"/print"}
          />
        </div>
      </div>
    </main>
  );
};

export default Menu;

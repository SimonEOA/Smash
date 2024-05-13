"use client";

import MenuCard from "@/components/card/MenuCard";
import Link from "next/link";

const Menu = () => {
  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-10">
      <div className=" flex flex-col gap-4 justify-center items-center">
        <h2 className="text-4xl">Select deck type</h2>
        <div className=" flex flex-row gap-4">
          <MenuCard
            title={"Names"}
            description={
              "Be the first to remember the name referenced in a playing song"
            }
            linkTitle="Play"
            link={"/local"}
          />
          <MenuCard
            title={"Places"}
            description={
              "Be the first to remeber what place, city or location is referenced in a playing song"
            }
            linkTitle="Play"
            link={"/online"}
          />
          <MenuCard
            title={"Create new"}
            description={
              "Create your own deck either using our AI tools or manually"
            }
            linkTitle="Play"
            link={"/print"}
          />
        </div>
      </div>
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
            description={"Coming soon!"}
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
      <Link className="btn" href={"/upload"}>
        Go!
      </Link>
    </main>
  );
};

export default Menu;

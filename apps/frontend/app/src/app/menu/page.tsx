"use client";

import MenuCard from "@/components/card/MenuCard";
import Link from "next/link";



const Menu = () => {

  return (
    <main className="flex h-screen w-screen flex-row items-center justify-center gap-10">
        <MenuCard>
            <div className="flip-front">
                <p className="text-lg font-medium">Names</p>
            </div>
            <div className="flip-back gap-1">
                <Link className="btn w-24" href={"/local"}>
                    Local
                </Link>
            </div>        
        </MenuCard>
        <MenuCard>
            <div className="flip-front">
                <p className="text-lg font-medium">Places</p>
            </div>
            <div className="flip-back gap-1">
                <button className="btn w-24">
                    Local
                </button>
            </div>        
        </MenuCard>
        <MenuCard>
            <div className="flip-front">
                <p className="text-lg font-medium">Mix</p>
            </div>
            <div className="flip-back gap-1">
                <button className="btn w-24">
                    Local
                </button>
            </div>        
        </MenuCard>
        <MenuCard>
            <div className="flip-front">
                <p className="text-lg font-medium">Add</p>
            </div>
            <div className="flip-back gap-1">
                <Link className="btn w-24" href={"/add"}>
                    Local
                </Link>
            </div>        
        </MenuCard>
    </main>
  );
};

export default Menu;

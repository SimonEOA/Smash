"use client";

import { useEffect, useState } from "react";
import Card from "./Card";
import Link from "next/link";

const MenuCard = ({
  title,
  description,
  linkTitle,
  link,
}: {
  title: string;
  description: string;
  linkTitle: string;
  link: string;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Card isFlipped={isFlipped} setIsFlipped={setIsFlipped}>
        <div className="flip-front">
          <p className="text-lg font-medium">{title}</p>
        </div>
        <div className="flip-back p-1">
          <p>{description}</p>
        </div>
      </Card>
      <Link className="btn" href={link}>
        {linkTitle}
      </Link>
    </div>
  );
};
export default MenuCard;

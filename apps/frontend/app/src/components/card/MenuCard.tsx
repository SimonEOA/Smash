"use client";

import { useEffect, useState } from "react";
import Card from "./Card";

const MenuCard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  
  return (
    <Card isFlipped={isFlipped} setIsFlipped={setIsFlipped}>
       {children}
    </Card>
  );
};
export default MenuCard;

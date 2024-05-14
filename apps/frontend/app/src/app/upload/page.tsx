"use client";

import Link from "next/link";
import React, { useState } from "react";

const Upload = () => {
  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-10">
      <h2 className="text-5xl">Upload</h2>
      <p className="text-xl">Upload songs to play the game with your friends</p>
      <Link href={"/upload/individual"} className="btn">
        Upload
      </Link>
    </main>
  );
};

export default Upload;

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex h-screen w-screen items-center justify-center">
      <Link href={"/menu"} className="cursor-pointer gap-2">
        <h1 className="text-center text-7xl font-extralight">SMASH</h1>
      </Link>
    </main>
  );
}


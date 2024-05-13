import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-6xl font-bold">Welcome to my blog!</h1>
      <Image
        src="/images/hero.jpg"
        alt="Hero"
        width={1920}
        height={1080}
        className="rounded-lg"
      />
    </main>
  );
}

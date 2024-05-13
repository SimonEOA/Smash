"use client";

import { useAuth } from "@/hooks/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await login(email, password);

      router.push("/menu");
    } catch (error) {
      console.error("Failed to log in:", error);
      // Show error message
    }
  };

  return (
    <main className="flex h-screen w-screen flex-row items-center justify-center gap-10">
      <div className="flex flex-col gap-4">
        <h2 className="text-4xl font-bold">Login</h2>
        <p className="text-lg font-medium">
          Login to upload individual lyrics for a song directly or csv with
          columns "title", "artist", "album" for processing and creating your
          own deck
        </p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            name="email"
            type="text"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            name="password"
            type="text"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="submit"
            className="btn bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;

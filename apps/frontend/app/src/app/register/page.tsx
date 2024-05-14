"use client";

import { useAuth } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Register = () => {
  const { register } = useAuth();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await register(userName, email, password);
      // Navigate to a protected route or display success message
      router.push("/login");
    } catch (error) {
      console.error("Failed to log in:", error);
      // Show error message
    }
  };

  return (
    <main className="flex h-screen w-screen flex-row items-center justify-center gap-10">
      <div className="flex flex-col gap-4">
        <h2 className="text-4xl font-bold">Register</h2>
        <p className=" font-medium">
          Register to upload individual lyrics for a song directly or csv with
          columns "title", "artist", "album" for processing and creating your
          own deck
        </p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            name="userName"
            type="text"
            placeholder="Username"
            className="input"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
          />
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

export default Register;

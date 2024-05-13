"use client";

import { useAuth } from "@/hooks/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Header = () => {
  const { token, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="w-screen h-16 bg-white/10 flex items-center justify-between px-16">
      <div>
        <h2 className="text-3xl text-white font-bold">Smash</h2>
      </div>
      {!token ? (
        <div className="flex flex-row gap-5">
          <Link href="/login" className="text-white">
            Login
          </Link>
          <Link href="/register" className="text-white">
            Join
          </Link>
        </div>
      ) : (
        <div className="flex flex-row gap-5">
          <button className="text-white" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;

"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleJoin = (e) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/quiz/${code}`);
    }
  };

  return (
    <div className="min-h-screen bg-card flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Sahoot!</h1>
          <h2 className="text-xl font-semibold text-white">WELCOME TO QUIZ ONLINE</h2>
        </div>

        <form onSubmit={handleJoin} className="bg-card p-6 rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Masukkan Kode Kuis"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg font-medium text-gray-900"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-full transition-colors"
          >
            Gabung Kuis
          </button>
        </form>

        <div className="pt-8">
          <p className="text-white mb-4">Ingin membuat kuis sendiri?</p>
          <Link href="/admin/login">
            <button className="bg-input hover:bg-primary/50 text-white font-semibold py-2 px-6 rounded-full transition-colors">
              Bikin Kuis Baru
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

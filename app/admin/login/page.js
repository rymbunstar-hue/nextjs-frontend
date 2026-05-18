"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function AdminLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      if (isLogin) {
        const res = await axios.post("/api/auth/login", { username: name, password });
        localStorage.setItem("admin_token", res.data.token);
        router.push("/admin/dashboard");
      } else {
        const res = await axios.post("/api/auth/register", { username: name, password });
        localStorage.setItem("admin_token", res.data.token);
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan");
    }
  };

  return (
    <div className="min-h-screen bg-card flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Kuis</h1>
          <p className="text-muted">{isLogin ? "Masuk untuk kelola kuis" : "Daftar akun admin baru"}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20 space-y-4">
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">Nama / Username</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-full transition-colors mt-4"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#3B82F6] hover:underline font-medium"
          >
            {isLogin ? "Belum punya akun? Register" : "Sudah punya akun? Login"}
          </button>
        </div>
        
        <div className="text-center mt-4">
          <Link href="/" className="text-muted hover:text-white text-sm">
            &larr; Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  );
}

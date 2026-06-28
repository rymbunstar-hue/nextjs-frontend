"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Share2, Plus, LogOut, BarChart2, Pencil } from "lucide-react";

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchQuizzes = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get("/api/quiz/admin/list", { headers });
        setQuizzes(res.data || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("admin_token");
          router.push("/admin/login");
        }
      }
    };

    fetchQuizzes();
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.post("/api/admin/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch(e) {}
    localStorage.removeItem("admin_token");
    router.push("/");
  };

  const handleShare = (slug) => {
    const url = `${window.location.origin}/quiz/${slug}`;
    navigator.clipboard.writeText(url);
    alert("Link kuis disalin: " + url);
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <nav className="bg-card shadow-sm border-b px-4 sm:px-6 py-4 flex flex-row justify-between items-center gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src="/logo.png" alt="Sahoot! Logo" className="h-8 sm:h-10 object-contain" />
          <h1 className="text-lg sm:text-2xl font-bold text-primary">Sahoot! Admin</h1>
        </div>
        <button onClick={handleLogout} className="text-white hover:text-red-500 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
          <LogOut size={18} className="sm:w-[20px] sm:h-[20px]" /> Logout
        </button>
      </nav>

      <div className="max-w-5xl mx-auto mt-8 px-4">
        <div className="flex flex-row justify-between items-center mb-6 gap-2 sm:gap-0">
          <h2 className="text-sm sm:text-xl font-bold text-white">Kelola Kuis Anda</h2>
          <Link href="/admin/quiz/create">
            <button className="bg-primary hover:bg-primary-hover text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-6 text-xs sm:text-base rounded-full transition-colors flex items-center gap-1 sm:gap-2 w-auto justify-center">
              <Plus size={14} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Buat Kuis Baru</span><span className="sm:hidden">Buat Kuis</span>
            </button>
          </Link>
        </div>

        <div className="bg-card rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background text-white text-sm border-b">
                <th className="py-4 px-6 font-medium">Judul Kuis</th>
                <th className="py-4 px-6 font-medium">Kode</th>
                <th className="py-4 px-6 font-medium">Peserta</th>
                <th className="py-4 px-6 font-medium">Rata-rata</th>
                <th className="py-4 px-6 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted">Belum ada kuis.</td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-b hover:bg-background">
                    <td className="py-4 px-6 font-medium text-white">
                      <Link href={`/admin/quiz/stats/${quiz.id}`} className="hover:underline text-white font-medium">
                        {quiz.title}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-muted">{quiz.join_code || quiz.slug}</td>
                    <td className="py-4 px-6 text-white">{quiz.participant_count || quiz.participants_count || 0}</td>
                    <td className="py-4 px-6 text-[#10B981] font-medium">{quiz.average_score || 0}%</td>
                    <td className="py-4 px-6 flex gap-2">
                      <button
                        onClick={() => handleShare(quiz.join_code || quiz.slug)}
                        className="p-2 text-[#3B82F6] bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                        title="Share"
                      >
                        <Share2 size={18} />
                      </button>
                      <Link href={`/admin/quiz/stats/${quiz.id}`}>
                        <button
                          className="p-2 text-[#10B981] bg-green-50 rounded-full hover:bg-green-100 transition-colors"
                          title="Statistik"
                        >
                          <BarChart2 size={18} />
                        </button>
                      </Link>
                      <Link href={`/admin/quiz/edit/${quiz.id}`}>
                        <button
                          className="p-2 text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

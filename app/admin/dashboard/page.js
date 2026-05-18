"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Share2, Plus, Users, Award, TrendingUp, TrendingDown, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("kelola");
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [quizRes] = await Promise.all([
          axios.get("/api/quiz/admin/list", { headers }),
          // axios.get("/api/admin/statistics", { headers }) // Endpoint missing, skip for now
        ]);
        setQuizzes(quizRes.data || []);
        // setStats(statRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("admin_token");
          router.push("/admin/login");
        }
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      // await axios.post("/api/admin/logout", {}, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
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
      <nav className="bg-card shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Sahoot! Admin</h1>
        <button onClick={handleLogout} className="text-white hover:text-red-500 flex items-center gap-2">
          <LogOut size={20} /> Logout
        </button>
      </nav>

      <div className="max-w-5xl mx-auto mt-8 px-4">
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === "kelola"
                ? "border-b-2 border-[#2D6A4F] text-primary"
                : "text-muted hover:text-white"
            }`}
            onClick={() => setActiveTab("kelola")}
          >
            Kelola Kuis
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === "statistik"
                ? "border-b-2 border-[#2D6A4F] text-primary"
                : "text-muted hover:text-white"
            }`}
            onClick={() => setActiveTab("statistik")}
          >
            Statistik Peserta
          </button>
        </div>

        {activeTab === "kelola" ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <div className="bg-card p-4 rounded-xl shadow-2xl shadow-primary/10 border border-primary/20 min-w-[150px]">
                  <p className="text-sm text-muted">Total Peserta</p>
                  <p className="text-2xl font-bold text-white">{stats?.total_participants || 0}</p>
                </div>
                <div className="bg-card p-4 rounded-xl shadow-2xl shadow-primary/10 border border-primary/20 min-w-[150px]">
                  <p className="text-sm text-muted">Rata-rata Skor</p>
                  <p className="text-2xl font-bold text-[#10B981]">{stats?.global_average || 0}%</p>
                </div>
              </div>
              <Link href="/admin/quiz/create">
                <button className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-full transition-colors flex items-center gap-2">
                  <Plus size={18} /> Buat Kuis Baru
                </button>
              </Link>
            </div>

            <div className="bg-card rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20 overflow-hidden">
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
                        <td className="py-4 px-6 font-medium text-white">{quiz.title}</td>
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
                          <Link href={`/admin/quiz/edit/${quiz.id}`}>
                            <button className="p-2 text-white bg-input rounded-full hover:bg-input transition-colors" title="Edit">
                              Edit
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
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card p-6 rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-[#3B82F6] rounded-full"><Users size={24} /></div>
                <div>
                  <p className="text-sm text-muted">Total Peserta</p>
                  <p className="text-xl font-bold text-white">{stats?.total_participants || 0}</p>
                </div>
              </div>
              <div className="bg-card p-6 rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-[#10B981] rounded-full"><Award size={24} /></div>
                <div>
                  <p className="text-sm text-muted">Rata-rata Skor</p>
                  <p className="text-xl font-bold text-white">{stats?.global_average || 0}%</p>
                </div>
              </div>
              <div className="bg-card p-6 rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full"><TrendingUp size={24} /></div>
                <div>
                  <p className="text-sm text-muted">Tertinggi</p>
                  <p className="text-xl font-bold text-white">{stats?.highest_score || 0}%</p>
                </div>
              </div>
              <div className="bg-card p-6 rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20 flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-500 rounded-full"><TrendingDown size={24} /></div>
                <div>
                  <p className="text-sm text-muted">Terendah</p>
                  <p className="text-xl font-bold text-white">{stats?.lowest_score || 0}%</p>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20">
              <h3 className="text-lg font-bold text-white mb-6">Distribusi Skor Peserta</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.distribution || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                    <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="count" fill="#2D6A4F" radius={[4, 4, 0, 0]} name="Jumlah Peserta" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

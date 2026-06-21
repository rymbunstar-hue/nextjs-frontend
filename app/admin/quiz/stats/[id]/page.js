"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Award, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";

export default function QuizStats({ params }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [quizRes, statsRes] = await Promise.all([
          axios.get(`/api/quiz/${params.id}`, { headers }),
          axios.get(`/api/admin/statistics?quizId=${params.id}`, { headers })
        ]);
        setQuiz(quizRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError("Gagal memuat statistik kuis.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-background flex items-center justify-center text-red-500">{error}</div>;
  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/dashboard" className="inline-flex items-center text-[#3B82F6] hover:underline mb-6 font-medium">
          <ArrowLeft size={18} className="mr-1" /> Kembali ke Dashboard
        </Link>

        <div className="bg-card p-6 md:p-8 rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{quiz.title}</h1>
            {quiz.description && <p className="text-muted mb-4">{quiz.description}</p>}
            <div className="text-sm text-muted">
              Kode Join: <span className="font-semibold text-white uppercase">{quiz.slug}</span>
            </div>
          </div>
          <img src="/logo.png" alt="Sahoot! Logo" className="h-16 object-contain self-start sm:self-center" />
        </div>

        {/* Stats Cards */}
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

        {/* Chart */}
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
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Trophy, Home } from "lucide-react";

export default function QuizResult({ params }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`/api/attempts/${params.id}`);
        setResult(res.data);
      } catch (err) {
        setError("Hasil tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-background text-red-500">{error}</div>;
  if (!result) return null;

  const percentage = result.percentage;
  let motivation = "";
  let colorClass = "";
  
  if (percentage >= 80) {
    motivation = "Luar biasa! Pertahankan prestasimu!";
    colorClass = "text-[#10B981]";
  } else if (percentage >= 60) {
    motivation = "Tidak buruk! Terus belajar ya!";
    colorClass = "text-[#F59E0B]";
  } else {
    motivation = "Jangan menyerah, coba lagi lain waktu!";
    colorClass = "text-red-500";
  }

  return (
    <div className="min-h-screen bg-card flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        
        <div className="bg-card p-10 rounded-3xl shadow-2xl shadow-primary/20 border border-primary/20 flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-opacity-10 ${percentage >= 60 ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'}`}>
            <Trophy size={48} />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Skor Akhir</h1>
          
          <div className={`text-6xl font-extrabold mb-4 ${colorClass}`}>
            {result.score}/{result.total_questions}
          </div>
          
          <div className="text-xl font-semibold text-white mb-6">
            ({percentage}%)
          </div>
          
          <p className="text-lg font-medium text-white italic mb-8">
            "{motivation}"
          </p>
          
          <Link href="/">
            <button className="w-full bg-input hover:bg-primary/50 text-white font-bold py-4 px-8 rounded-full transition-colors flex items-center justify-center gap-2 text-lg">
              <Home size={20} /> Kembali ke Home
            </button>
          </Link>
        </div>
        
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";

export default function EditQuiz({ params }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await axios.get(
          `/api/quiz/${params.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTitle(res.data.title);
        setDescription(res.data.description || "");
        setQuestions(res.data.questions);
      } catch (err) {
        setError("Gagal memuat data kuis.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [params.id]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "a" }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");
      await axios.put(
        `/api/quiz/${params.id}`,
        { title, description, questions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat menyimpan kuis.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin/dashboard" className="inline-flex items-center text-[#3B82F6] hover:underline mb-6 font-medium">
          <ArrowLeft size={18} className="mr-1" /> Kembali ke Dashboard
        </Link>
        
        <div className="bg-card p-8 rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Edit Kuis</h1>
            <img src="/logo.png" alt="Sahoot! Logo" className="h-10 object-contain" />
          </div>
          
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-1">Judul Kuis</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1">Deskripsi (Opsional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none text-black"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white border-b pb-2">Daftar Pertanyaan</h2>
              
              {questions.map((q, index) => (
                <div key={index} className="bg-background p-6 rounded-xl border border-primary/20 relative">
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-1 bg-card rounded-full shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <h3 className="font-semibold text-white mb-4">Pertanyaan {index + 1}</h3>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Tulis pertanyaan di sini..."
                      value={q.question_text}
                      onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-black"
                      required
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['a', 'b', 'c', 'd'].map((opt) => (
                        <div key={opt} className="flex items-center gap-3 bg-card p-3 rounded-lg border border-primary/20 shadow-sm focus-within:ring-1 focus-within:ring-primary">
                          <input
                            type="radio"
                            name={`correct_option_${index}`}
                            checked={q.correct_option === opt}
                            onChange={() => handleQuestionChange(index, 'correct_option', opt)}
                            className="w-4 h-4 text-primary focus:ring-primary"
                          />
                          <span className="font-semibold text-muted uppercase">{opt}.</span>
                          <input
                            type="text"
                            placeholder={`Pilihan ${opt.toUpperCase()}`}
                            value={q[`option_${opt}`]}
                            onChange={(e) => handleQuestionChange(index, `option_${opt}`, e.target.value)}
                            className="flex-1 bg-transparent focus:outline-none text-sm"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full sm:w-auto text-primary bg-green-50 hover:bg-green-100 font-semibold py-2 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Tambah Soal
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

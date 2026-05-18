"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

export default function QuizTake({ params }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 means welcome screen
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/api/quiz/join/${params.slug}`);
        setQuiz(res.data);
      } catch (err) {
        setError("Kuis tidak ditemukan atau terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [params.slug]);

  const handleStart = () => {
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (questionId, optionKey) => {
    setAnswers({ ...answers, [questionId]: optionKey });
  };

  const handleNext = async () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit quiz
      setSubmitting(true);
      try {
        let sessionId = Cookies.get("participant_session_id");
        if (!sessionId) {
          sessionId = "session_" + Math.random().toString(36).substring(2, 15);
          Cookies.set("participant_session_id", sessionId, { expires: 365 });
        }

        // Map answers from { questionId: optionKey } to [{ questionId, answer: optionKey }]
        const mappedAnswers = Object.keys(answers).map(qId => ({
          questionId: parseInt(qId),
          answer: answers[qId]
        }));

        const res = await axios.post(`/api/quiz/submit`, {
          quizId: quiz.id,
          nickname: sessionId,
          answers: mappedAnswers
        });
        
        router.push(`/result/${res.data.attempt_id}`);
      } catch (err) {
        setError("Gagal mengirim jawaban. Coba lagi.");
        setSubmitting(false);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-background text-red-500">{error}</div>;
  if (!quiz) return null;

  if (currentQuestionIndex === -1) {
    // Welcome Screen
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20 text-center space-y-6">
          <h1 className="text-3xl font-bold text-white">{quiz.title}</h1>
          {quiz.description && <p className="text-white">{quiz.description}</p>}
          <div className="pt-4 border-t border-primary/20">
            <p className="text-sm text-muted mb-6">Total Pertanyaan: {quiz.questions.length}</p>
            <button
              onClick={handleStart}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-full transition-colors text-lg"
            >
              Mulai Kuis
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[800px]">
        <div className="mb-6 flex justify-between items-center px-4">
          <span className="text-sm font-semibold text-muted">Pertanyaan {currentQuestionIndex + 1} dari {quiz.questions.length}</span>
          <div className="w-1/2 bg-input rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-card p-8 md:p-10 rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
            {currentQuestion.question_text}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['a', 'b', 'c', 'd'].map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(currentQuestion.id, opt)}
                className={`text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                  currentAnswer === opt 
                    ? 'border-[#2D6A4F] bg-green-50 shadow-sm' 
                    : 'border-primary/20 hover:border-gray-300 hover:bg-background'
                }`}
              >
                <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-bold text-sm ${
                  currentAnswer === opt ? 'bg-primary text-white' : 'bg-input text-white'
                }`}>
                  {opt.toUpperCase()}
                </div>
                <span className="text-white font-medium pt-1">
                  {currentQuestion[`option_${opt}`]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end px-4">
          <button
            onClick={handleNext}
            disabled={!currentAnswer || submitting}
            className="bg-primary hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-full transition-colors flex items-center gap-2 text-lg"
          >
            {submitting ? "Memproses..." : (isLastQuestion ? "Selesai" : "Selanjutnya →")}
          </button>
        </div>
      </div>
    </div>
  );
}

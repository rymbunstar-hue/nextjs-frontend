import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getAdminFromSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const quizId = params.id;
    const quizzes = await executeQuery<any[]>('SELECT id, title, description, slug FROM quizzes WHERE id = ? AND admin_id = ?', [quizId, admin.id]);
    
    if (quizzes.length === 0) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const questions = await executeQuery<any[]>('SELECT id, question_text, option_a, option_b, option_c, option_d, correct_option FROM questions WHERE quiz_id = ?', [quizId]);

    const mappedQuestions = questions.map(q => ({
      id: q.id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option
    }));

    return NextResponse.json({ ...quizzes[0], questions: mappedQuestions });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const quizId = params.id;
    const { title, description, questions } = await req.json();

    // Verify ownership
    const quizzes = await executeQuery<any[]>('SELECT id FROM quizzes WHERE id = ? AND admin_id = ?', [quizId, admin.id]);
    if (quizzes.length === 0) return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });

    // Update title and description
    await executeQuery('UPDATE quizzes SET title = ?, description = ? WHERE id = ?', [title, description || null, quizId]);

    // Update questions (simplified: delete old and insert new)
    await executeQuery('DELETE FROM questions WHERE quiz_id = ?', [quizId]);

    if (questions && questions.length > 0) {
      const values: any[] = [];
      const placeholders = questions.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

      questions.forEach((q: any) => {
        values.push(quizId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option);
      });

      await executeQuery(`INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES ${placeholders}`, values);
    }

    return NextResponse.json({ message: 'Quiz updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

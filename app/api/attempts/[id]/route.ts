import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const attemptId = params.id;

    const participants = await executeQuery<any[]>(
      'SELECT quiz_id, participant_session_id, score, total_questions, percentage, created_at FROM quiz_attempts WHERE id = ?',
      [attemptId]
    );

    if (participants.length === 0) {
      return NextResponse.json({ message: 'Result not found' }, { status: 404 });
    }

    const participant = participants[0];
    
    return NextResponse.json({
      id: attemptId,
      score: participant.score,
      total_questions: participant.total_questions,
      percentage: participant.percentage,
      nickname: participant.participant_session_id,
      created_at: participant.created_at
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

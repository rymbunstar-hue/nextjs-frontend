import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getAdminFromSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // 1. Get quizzes owned by this admin
    const quizzes = await executeQuery<any[]>('SELECT id FROM quizzes WHERE admin_id = ?', [admin.id]);
    
    const { searchParams } = new URL(req.url);
    const quizIdParam = searchParams.get('quizId');

    let quizIds: number[] = [];

    if (quizIdParam && quizIdParam !== 'all') {
      const selectedId = parseInt(quizIdParam);
      // Verify ownership
      const owned = quizzes.some(q => q.id === selectedId);
      if (!owned) {
        return NextResponse.json({ message: 'Quiz not found or unauthorized' }, { status: 404 });
      }
      quizIds = [selectedId];
    } else {
      if (quizzes.length === 0) {
        return NextResponse.json({
          total_participants: 0,
          global_average: 0,
          highest_score: 0,
          lowest_score: 0,
          distribution: [
            { range: '0-20', count: 0 },
            { range: '21-40', count: 0 },
            { range: '41-60', count: 0 },
            { range: '61-80', count: 0 },
            { range: '81-100', count: 0 },
          ]
        });
      }
      quizIds = quizzes.map(q => q.id);
    }

    const placeholders = quizIds.map(() => '?').join(',');

    // 2. Get attempts for these quizzes
    const attempts = await executeQuery<any[]>(
      `SELECT percentage FROM quiz_attempts WHERE quiz_id IN (${placeholders})`,
      quizIds
    );

    if (attempts.length === 0) {
      return NextResponse.json({
        total_participants: 0,
        global_average: 0,
        highest_score: 0,
        lowest_score: 0,
        distribution: [
          { range: '0-20', count: 0 },
          { range: '21-40', count: 0 },
          { range: '41-60', count: 0 },
          { range: '61-80', count: 0 },
          { range: '81-100', count: 0 },
        ]
      });
    }

    const totalParticipants = attempts.length;
    let sum = 0;
    let highest = 0;
    let lowest = 100;
    let ranges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    attempts.forEach(att => {
      const p = att.percentage;
      sum += p;
      if (p > highest) highest = p;
      if (p < lowest) lowest = p;

      if (p <= 20) ranges['0-20']++;
      else if (p <= 40) ranges['21-40']++;
      else if (p <= 60) ranges['41-60']++;
      else if (p <= 80) ranges['61-80']++;
      else ranges['81-100']++;
    });

    const average = Math.round(sum / totalParticipants);

    const distribution = [
      { range: '0-20', count: ranges['0-20'] },
      { range: '21-40', count: ranges['21-40'] },
      { range: '41-60', count: ranges['41-60'] },
      { range: '61-80', count: ranges['61-80'] },
      { range: '81-100', count: ranges['81-100'] },
    ];

    return NextResponse.json({
      total_participants: totalParticipants,
      global_average: average,
      highest_score: highest,
      lowest_score: lowest,
      distribution
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

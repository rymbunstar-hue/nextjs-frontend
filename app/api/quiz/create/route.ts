import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getAdminFromSession } from '@/lib/auth';

function generateSlug(length: number = 8): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromSession();

    if (!admin) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, description } = await req.json();

    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    let slug = generateSlug();
    let isCodeUnique = false;

    // Ensure slug is unique
    while (!isCodeUnique) {
      const existing = await executeQuery<any[]>(
        'SELECT id FROM quizzes WHERE slug = ?',
        [slug]
      );
      if (existing.length === 0) {
        isCodeUnique = true;
      } else {
        slug = generateSlug();
      }
    }

    const result = await executeQuery<any>(
      'INSERT INTO quizzes (admin_id, title, description, slug) VALUES (?, ?, ?, ?)',
      [admin.id, title, description || null, slug]
    );

    return NextResponse.json(
      { 
        message: 'Quiz created successfully', 
        quizId: result.insertId,
        slug 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create quiz error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

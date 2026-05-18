import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await executeQuery<any[]>(
      'SELECT id FROM admins WHERE name = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'Username already taken' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const email = `${username.replace(/\s+/g, '').toLowerCase()}@admin.com`;
    const result: any = await executeQuery(
      'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const token = signToken({ id: result.insertId, username });

    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json(
      { message: 'Admin registered successfully', token },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

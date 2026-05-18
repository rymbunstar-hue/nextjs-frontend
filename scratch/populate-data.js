const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function populate() {
  console.log('🚀 Memulai populasi data kuis...');

  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'sahoot'
  });

  try {
    // 1. Bersihkan data lama
    await connection.query('DELETE FROM quiz_attempts');
    await connection.query('DELETE FROM questions');
    await connection.query('DELETE FROM quizzes');
    await connection.query('DELETE FROM admins');

    // 2. Buat admin
    const passwordHash = await bcrypt.hash('password123', 10);
    const [adminResult] = await connection.query(
      'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
      ['admin', 'admin@admin.com', passwordHash]
    );
    const adminId = adminResult.insertId;
    console.log('✅ Admin berhasil dibuat:', 'admin@admin.com / password123');

    // 3. Buat kuis
    const [quizResult] = await connection.query(
      'INSERT INTO quizzes (admin_id, title, description, slug) VALUES (?, ?, ?, ?)',
      [adminId, 'Kuis Pengetahuan Umum', 'Uji wawasan umum kamu di sini!', 'KU-1234']
    );
    const quizId = quizResult.insertId;
    console.log('✅ Kuis berhasil dibuat dengan Join Code/Slug:', 'KU-1234');

    // 4. Tambah pertanyaan
    const questions = [
      {
        question_text: 'Apa ibukota Indonesia?',
        option_a: 'Surabaya',
        option_b: 'Bandung',
        option_c: 'Jakarta',
        option_d: 'Medan',
        correct_option: 'C'
      },
      {
        question_text: 'Planet manakah yang paling dekat dengan Matahari?',
        option_a: 'Venus',
        option_b: 'Merkurius',
        option_c: 'Mars',
        option_d: 'Yupiter',
        correct_option: 'B'
      },
      {
        question_text: 'Berapakah hasil dari 5 x 6?',
        option_a: '25',
        option_b: '30',
        option_c: '35',
        option_d: '40',
        correct_option: 'B'
      }
    ];

    for (const q of questions) {
      await connection.query(
        'INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [quizId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option]
      );
    }
    console.log('✅ 3 Pertanyaan berhasil dimasukkan!');
    console.log('\n🎉 Populasi data sukses! Siap digunakan.');
  } catch (error) {
    console.error('❌ Gagal populasi data:', error.message);
  } finally {
    await connection.end();
  }
}

populate();

<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=sahoot', 'root', '');
foreach (['quizzes', 'questions', 'quiz_attempts'] as $table) {
    echo "--- $table ---\n";
    $stmt = $pdo->query("DESCRIBE $table");
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        echo $row['Field'] . "\n";
    }
}

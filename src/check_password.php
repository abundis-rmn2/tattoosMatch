<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow all origins
header('Access-Control-Allow-Methods: POST, OPTIONS'); // Allow POST and OPTIONS methods
header('Access-Control-Allow-Headers: Content-Type'); // Allow Content-Type header

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = json_decode(file_get_contents('php://input'), true);
$password = $input['password'] ?? '';

// List of valid keys
$validKeys = [
    'password' => 'key',
];

// Check if the password is valid
$isValid = array_key_exists($password, $validKeys);
$key = $isValid ? $validKeys[$password] : null;

// Log the user information
$logData = [
    'key' => $key,
    'success' => $isValid,
    'date' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'],
    'user_agent' => $_SERVER['HTTP_USER_AGENT'],
    'referer' => $_SERVER['HTTP_REFERER'] ?? 'N/A',
];

$logFile = 'user_log.php';
if (!file_exists($logFile)) {
    file_put_contents($logFile, '<?php // silence is gold' . PHP_EOL);
}
file_put_contents($logFile, json_encode($logData) . PHP_EOL, FILE_APPEND);

if ($isValid) {
    echo json_encode(['success' => true, 'key' => $key]);
} else {
    echo json_encode(['success' => false]);
}

// Ensure no text is written after the PHP closing tag
exit;
?>

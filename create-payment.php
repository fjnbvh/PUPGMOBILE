<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$config = require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid JSON']);
    exit;
}

$coins = (int)($input['coins'] ?? 0);
$amount = (float)($input['amount'] ?? 0);
$currency = strtoupper((string)($input['currency'] ?? 'EGP'));
$playerId = preg_replace('/[^0-9]/', '', (string)($input['playerId'] ?? ''));

if ($coins <= 0 || $amount <= 0 || $currency !== 'EGP' || !preg_match('/^[1-9][0-9]{7,14}$/', $playerId)) {
    http_response_code(400);
    echo json_encode(['message' => 'بيانات الطلب غير صحيحة']);
    exit;
}

/*
 * الأسعار يجب أن تكون مُتحققة على السيرفر في الإنتاج.
 * هذه الخريطة تطابق باقات index.html الحالية:
 */
$prices = [
    500 => 280,
    1000 => 560,
    2000 => 1120,
    4000 => 2240,
    8000 => 4480,
    16000 => 8960,
];

if (!isset($prices[$coins])) {
    http_response_code(400);
    echo json_encode(['message' => 'الباقة غير متاحة']);
    exit;
}

$serverAmount = (float)$prices[$coins];

if (abs($serverAmount - $amount) > 0.01) {
    // لا نثق بالسعر القادم من المتصفح.
    $amount = $serverAmount;
} else {
    $amount = $serverAmount;
}

/*
 * يجب أن يكون order فريدًا لكل عملية.
 */
$order = 'PUBG-' . date('YmdHis') . '-' . bin2hex(random_bytes(5));

$payload = [
    'expireAt' => gmdate('Y-m-d\TH:i:s.000\Z', time() + 30 * 60),
    'maxFailureAttempts' => 3,
    'paymentType' => 'credit',
    'amount' => number_format($amount, 2, '.', ''),
    'currency' => 'EGP',
    'order' => $order,
    'merchantRedirect' => $config['merchant_redirect'],
    'display' => 'ar',
    'type' => 'one-time',
    'allowedMethods' => 'card,wallet',
    'merchantId' => $config['merchant_id'],
    'failureRedirect' => false,
    'description' => "PUBG Mobile {$coins} UC - Player {$playerId}",
    'customer' => [
        'reference' => $playerId
    ],
    'interactionSource' => 'ECOMMERCE',
    'enable3DS' => true
];

$ch = curl_init($config['sessions_url']);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: ' . $config['secret_key'],
        'api-key: ' . $config['api_key'],
        'Content-Type: application/json',
        'Accept: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['message' => 'Kashier connection failed']);
    exit;
}

$data = json_decode($response, true);

if ($status < 200 || $status >= 300 || !is_array($data)) {
    http_response_code(502);
    echo json_encode([
        'message' => 'Kashier rejected the session request',
        'status' => $status
    ]);
    exit;
}

$sessionUrl = $data['sessionUrl'] ?? null;

if (!$sessionUrl) {
    http_response_code(502);
    echo json_encode(['message' => 'Kashier response did not contain sessionUrl']);
    exit;
}

echo json_encode([
    'sessionUrl' => $sessionUrl,
    'order' => $order
], JSON_UNESCAPED_SLASHES);

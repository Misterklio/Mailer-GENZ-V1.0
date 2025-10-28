<?php
/* ===================================
   Mass Mailer Pro - Email Sender
   © 2025 Mister kilo
   =================================== */

// Set headers for JSON response
header('Content-Type: application/json');

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Function to send response
function sendResponse($success, $message, $data = []) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Get POST data
$recipient = isset($_POST['recipient']) ? trim($_POST['recipient']) : '';
$fromName = isset($_POST['fromName']) ? trim($_POST['fromName']) : '';
$fromEmail = isset($_POST['fromEmail']) ? trim($_POST['fromEmail']) : '';
$replyTo = isset($_POST['replyTo']) ? trim($_POST['replyTo']) : '';
$subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
$mailType = isset($_POST['mailType']) ? trim($_POST['mailType']) : 'html';
$base64Encode = isset($_POST['base64Encode']) && $_POST['base64Encode'] === '1';
$emailBody = isset($_POST['emailBody']) ? $_POST['emailBody'] : '';

// Validate required fields
if (empty($recipient)) {
    sendResponse(false, 'Recipient email is required');
}

if (empty($fromName)) {
    sendResponse(false, 'From name is required');
}

if (empty($fromEmail)) {
    sendResponse(false, 'From email is required');
}

if (empty($replyTo)) {
    sendResponse(false, 'Reply-to email is required');
}

if (empty($subject)) {
    sendResponse(false, 'Subject is required');
}

if (empty($emailBody)) {
    sendResponse(false, 'Email body is required');
}

// Validate email formats
if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid recipient email format');
}

if (!filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid from email format');
}

if (!filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid reply-to email format');
}

// Process email body
$processedBody = $emailBody;

// If base64 encoding is enabled and mail type is HTML
if ($base64Encode && $mailType === 'html') {
    $processedBody = base64_encode($emailBody);
    // For display purposes, we'll decode it when sending
    $processedBody = base64_decode($processedBody);
}

// Prepare email headers
$headers = [];
$headers[] = "MIME-Version: 1.0";

if ($mailType === 'html') {
    $headers[] = "Content-Type: text/html; charset=UTF-8";
} else {
    $headers[] = "Content-Type: text/plain; charset=UTF-8";
}

$headers[] = "From: {$fromName} <{$fromEmail}>";
$headers[] = "Reply-To: {$replyTo}";
$headers[] = "X-Mailer: Mass Mailer Pro";
$headers[] = "X-Priority: 3";

// Convert headers array to string
$headersString = implode("\r\n", $headers);

// Attempt to send email

try {
    $mailSent = mail($recipient, $subject, $processedBody, $headersString);
    
    if ($mailSent) {
        sendResponse(true, 'Email sent successfully', [
            'recipient' => $recipient,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        // Get last error
        $error = error_get_last();
        $errorMessage = $error ? $error['message'] : 'Unknown error occurred';
        sendResponse(false, 'Failed to send email: ' . $errorMessage);
    }
} catch (Exception $e) {
    sendResponse(false, 'Exception occurred: ' . $e->getMessage());
}
?>

/* ===================================
   Mass Mailer Pro - JavaScript
   © 2025 Mister kilo
   =================================== */

// Global Variables
let isPaused = false;
let isCancelled = false;
let currentEmailIndex = 0;
let totalEmails = 0;
let emailQueue = [];

// DOM Elements
const emailForm = document.getElementById('emailForm');
const sendBtn = document.getElementById('sendBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const cancelBtn = document.getElementById('cancelBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const progressInfo = document.getElementById('progressInfo');
const statusMessages = document.getElementById('statusMessages');

// Form Fields
const recipientsField = document.getElementById('recipients');
const fromNameField = document.getElementById('fromName');
const fromEmailField = document.getElementById('fromEmail');
const replyToField = document.getElementById('replyTo');
const subjectField = document.getElementById('subject');
const mailTypeField = document.getElementById('mailType');
const base64EncodeField = document.getElementById('base64Encode');
const emailBodyField = document.getElementById('emailBody');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadFormData();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Form submission
    emailForm.addEventListener('submit', handleFormSubmit);
    
    // Control buttons
    pauseBtn.addEventListener('click', handlePause);
    resumeBtn.addEventListener('click', handleResume);
    cancelBtn.addEventListener('click', handleCancel);
    
    // Save form data to localStorage on input
    const formInputs = emailForm.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('input', saveFormData);
    });
    
    // Form validation
    recipientsField.addEventListener('blur', validateEmails);
    fromEmailField.addEventListener('blur', validateEmail);
    replyToField.addEventListener('blur', validateEmail);
}

// Load Form Data from localStorage
function loadFormData() {
    const savedData = localStorage.getItem('massMailerFormData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            fromNameField.value = data.fromName || '';
            fromEmailField.value = data.fromEmail || '';
            replyToField.value = data.replyTo || '';
            subjectField.value = data.subject || '';
            mailTypeField.value = data.mailType || 'html';
            base64EncodeField.checked = data.base64Encode || false;
            recipientsField.value = data.recipients || '';
            emailBodyField.value = data.emailBody || '';
        } catch (e) {
            console.error('Error loading saved form data:', e);
        }
    }
}

// Save Form Data to localStorage
function saveFormData() {
    const formData = {
        fromName: fromNameField.value,
        fromEmail: fromEmailField.value,
        replyTo: replyToField.value,
        subject: subjectField.value,
        mailType: mailTypeField.value,
        base64Encode: base64EncodeField.checked,
        recipients: recipientsField.value,
        emailBody: emailBodyField.value
    };
    localStorage.setItem('massMailerFormData', JSON.stringify(formData));
}

// Validate Single Email
function validateEmail(event) {
    const email = event.target.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        event.target.style.borderColor = 'var(--danger-color)';
        showStatus('Invalid email format', 'error');
        return false;
    } else {
        event.target.style.borderColor = 'var(--border-color)';
        return true;
    }
}

// Validate Multiple Emails
function validateEmails(event) {
    const emails = event.target.value.split('\n').filter(e => e.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let invalidCount = 0;
    
    emails.forEach(email => {
        if (!emailRegex.test(email.trim())) {
            invalidCount++;
        }
    });
    
    if (invalidCount > 0) {
        event.target.style.borderColor = 'var(--danger-color)';
        showStatus(`Found ${invalidCount} invalid email(s)`, 'error');
        return false;
    } else {
        event.target.style.borderColor = 'var(--border-color)';
        return true;
    }
}

// Handle Form Submit
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Reset state
    isPaused = false;
    isCancelled = false;
    currentEmailIndex = 0;
    
    // Clear previous status messages
    statusMessages.innerHTML = '';
    
    // Get and validate recipients
    const recipients = recipientsField.value.split('\n')
        .map(email => email.trim())
        .filter(email => email);
    
    if (recipients.length === 0) {
        showStatus('Please enter at least one recipient email', 'error');
        return;
    }
    
    // Validate all emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
        showStatus(`Invalid email addresses found: ${invalidEmails.join(', ')}`, 'error');
        return;
    }
    
    // Prepare email queue
    emailQueue = recipients;
    totalEmails = emailQueue.length;
    
    // Update progress
    updateProgress(0, totalEmails);
    
    // Update button visibility
    sendBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';
    cancelBtn.style.display = 'flex';
    
    // Start sending emails
    showStatus(`Starting to send ${totalEmails} email(s)...`, 'info');
    sendNextEmail();
}

// Send Next Email
async function sendNextEmail() {
    // Check if paused or cancelled
    if (isPaused) {
        showStatus('Email sending paused', 'info');
        return;
    }
    
    if (isCancelled) {
        showStatus('Email sending cancelled', 'error');
        resetForm();
        return;
    }
    
    // Check if all emails sent
    if (currentEmailIndex >= totalEmails) {
        showStatus(`All ${totalEmails} email(s) sent successfully! 🎉`, 'success');
        resetForm();
        return;
    }
    
    // Get current recipient
    const recipient = emailQueue[currentEmailIndex];
    
    // Prepare form data
    const formData = new FormData();
    formData.append('recipient', recipient);
    formData.append('fromName', fromNameField.value);
    formData.append('fromEmail', fromEmailField.value);
    formData.append('replyTo', replyToField.value);
    formData.append('subject', subjectField.value);
    formData.append('mailType', mailTypeField.value);
    formData.append('base64Encode', base64EncodeField.checked ? '1' : '0');
    formData.append('emailBody', emailBodyField.value);
    
    try {
        // Send email via AJAX
        const response = await fetch('php/send_email.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus(`✓ Email sent to ${recipient}`, 'success');
            currentEmailIndex++;
            updateProgress(currentEmailIndex, totalEmails);
            
            // Continue with next email after a short delay
            setTimeout(() => sendNextEmail(), 500);
        } else {
            showStatus(`✗ Failed to send to ${recipient}: ${result.message}`, 'error');
            currentEmailIndex++;
            updateProgress(currentEmailIndex, totalEmails);
            
            // Continue with next email
            setTimeout(() => sendNextEmail(), 500);
        }
    } catch (error) {
        showStatus(`✗ Error sending to ${recipient}: ${error.message}`, 'error');
        currentEmailIndex++;
        updateProgress(currentEmailIndex, totalEmails);
        
        // Continue with next email
        setTimeout(() => sendNextEmail(), 500);
    }
}

// Handle Pause
function handlePause() {
    isPaused = true;
    pauseBtn.style.display = 'none';
    resumeBtn.style.display = 'flex';
    showStatus('Email sending paused', 'info');
}

// Handle Resume
function handleResume() {
    isPaused = false;
    resumeBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';
    showStatus('Email sending resumed', 'info');
    sendNextEmail();
}

// Handle Cancel
function handleCancel() {
    if (confirm('Are you sure you want to cancel sending emails?')) {
        isCancelled = true;
        showStatus('Email sending cancelled', 'error');
        resetForm();
    }
}

// Update Progress
function updateProgress(current, total) {
    const percentage = Math.round((current / total) * 100);
    progressFill.style.width = percentage + '%';
    progressPercent.textContent = percentage + '%';
    progressInfo.textContent = `${current} of ${total} emails sent`;
}

// Show Status Message
function showStatus(message, type = 'info') {
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message ${type}`;
    
    let icon = '📧';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'info') icon = 'ℹ️';
    
    statusDiv.innerHTML = `
        <span class="status-icon">${icon}</span>
        <span>${message}</span>
    `;
    
    // Add to top of status messages (newest first)
    statusMessages.insertBefore(statusDiv, statusMessages.firstChild);
    
    // Keep only last 50 messages to prevent memory issues
    while (statusMessages.children.length > 50) {
        statusMessages.removeChild(statusMessages.lastChild);
    }
    
    // Scroll to top to show latest status
    statusMessages.scrollTop = 0;
}

// Reset Form
function resetForm() {
    // Reset state
    isPaused = false;
    isCancelled = false;
    currentEmailIndex = 0;
    totalEmails = 0;
    emailQueue = [];
    
    // Reset progress
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
    progressInfo.textContent = '0 of 0 emails sent';
    
    // Update button visibility
    sendBtn.style.display = 'inline-flex';
    pauseBtn.style.display = 'none';
    resumeBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
}

// Utility: Encode to Base64
function encodeBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

// Utility: Decode from Base64
function decodeBase64(str) {
    return decodeURIComponent(escape(atob(str)));
}

// Window Controls Animation (Optional)
document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.classList.contains('close')) {
            if (confirm('Are you sure you want to close?')) {
                window.close();
            }
        } else if (this.classList.contains('minimize')) {
            // Minimize animation
            document.querySelector('.container').style.transform = 'scale(0.8)';
            setTimeout(() => {
                document.querySelector('.container').style.transform = 'scale(1)';
            }, 300);
        } else if (this.classList.contains('maximize')) {
            // Maximize animation
            document.querySelector('.container').style.transform = 'scale(1.05)';
            setTimeout(() => {
                document.querySelector('.container').style.transform = 'scale(1)';
            }, 300);
        }
    });
});
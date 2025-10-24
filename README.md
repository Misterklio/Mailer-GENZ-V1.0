# Mailer-GENZ v1.0

A sleek, macOS-inspired bulk email sender with a translucent black UI, live progress, and convenient pause/resume/cancel controls. Built with HTML, CSS, JavaScript, and PHP (mail function).

## Features
- Modern glass UI with animated background and Mac-style window controls
- Bulk sending with live progress, status feed, and success/error badges
- Pause, Resume, and Cancel controls
- HTML or Plain-Text mode, optional Base64 encode for HTML bodies
- Form autosave (localStorage) and basic email validation

## Tech Stack
- Frontend: HTML5, CSS3, JavaScript (ES6)
- Backend: PHP 7+ (uses built-in mail function)

## Requirements
- A web server capable of running PHP 7+ (Apache, Nginx, etc.)
- PHP mail() configured on the server (sendmail/SMTP relay)

## Project Structure
- index.html — main UI
- css/style.css — styles (glass theme, layout, components)
- js/script.js — behavior (queue, progress, controls)
- php/send_email.php — email sender endpoint (uses PHP mail)

## Quick Start
1) Deploy the project to your web server’s document root.
2) Ensure PHP mail() is configured (sendmail/SMTP relay) on your server.
3) Open index.html in a browser via your server (http://your-host/.../index.html).
4) Fill in From, Reply-To, Subject, Recipients (one per line), and Body.
5) Click “Send Emails” to begin; use Pause/Resume/Cancel as needed.

## Customization
- Branding and version: index.html (title tag and .window-title)
- Colors and sizing: css/style.css (variables at top, component classes)
- Behavior and timing: js/script.js (queue handling, status rendering)
- Headers and content-type: php/send_email.php (adjust mail headers)

## Notes
- Use responsibly and comply with all email laws (CAN-SPAM/GDPR/etc.).
- Large campaigns may require proper SMTP infrastructure and rate limiting.

## Contact
- Telegram: https://t.me/Misterklio (@Misterklio)

## Copyright
© 2025 Mister Klio. All rights reserved.

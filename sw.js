// File: sw.js
// Ini adalah "mesin" di belakang layar agar browser mengenali web ini sebagai Aplikasi (PWA)

self.addEventListener('install', (e) => {
    console.log('[Service Worker] Terinstal');
});

self.addEventListener('fetch', (e) => {
    // Membiarkan browser menangani pengambilan data seperti biasa
});
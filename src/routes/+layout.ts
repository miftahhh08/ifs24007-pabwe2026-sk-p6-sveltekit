// Aplikasi berjalan sebagai SPA: token disimpan di localStorage sehingga
// halaman hanya dirender di browser.
export const ssr = false;
export const prerender = false;

// Layani URL dengan maupun tanpa garis miring di akhir tanpa redirect 308
// (mis. /auth/login dan /auth/login/).
export const trailingSlash = 'ignore';

/* ==========================================================================
   FAIZ AKBARSYAH® — SITE CONFIG (Single Source of Truth)
   Identitas owner, kontak, URL situs, kategori, dan testimoni.
   Dipakai oleh semua halaman lewat js/app.js.
   ========================================================================== */

const SITE_CONFIG = {
  siteUrl: "https://faizcreativework.netlify.app",

  owner: {
    name: "FAIZ AKBARSYAH®",
    title: "Graphic Designer, Motion Designer & Creative Director",
    location: "Medan, Indonesia",
    cvPath: "/assets/faiz-akbarsyah-cv.pdf"
  },

  contact: {
    email: "faiz.akbarsyah@gmail.com",
    whatsappNumber: "628116362406",          // format internasional untuk link wa.me (tanpa +, tanpa 0 di depan)
    whatsappDisplay: "+62 811-6362-406",     // format tampilan untuk CV & teks yang dibaca manusia
    whatsappDefaultMessage: "Halo Faiz, saya ingin berdiskusi mengenai proyek kreatif.",
    instagramHandle: "@faizakbarsyah",
    instagramUrl: "https://instagram.com/faizakbarsyah",
    linkedinUrl: "https://linkedin.com/in/faizakbarsyah"
  },

  categories: [
    "All",
    "Brand Identity",
    "Graphic Design",
    "Motion Design",
    "Event Visual",
    "Social Media Design",
    "Presentation Design"
  ],

  /* Testimoni / Endorsements (index.html section 06).
     Section otomatis DISEMBUNYIKAN selama array ini kosong — jadi tidak ada
     placeholder yang tampil ke pengunjung. Isi dengan testimoni asli, format:
     { quote: "Teks testimoni...", name: "Nama Klien", role: "Jabatan, Organisasi" } */
  testimonials: []
};

if (typeof module !== 'undefined') {
  module.exports = SITE_CONFIG;
}

/* ==========================================================================
   FAIZ AKBARSYAH® — ABOUT DATA (Single Source of Truth)
   Digunakan oleh: about.html, print.html (Portfolio PDF), cv-print.html (CV ATS)
   Cukup update file ini untuk menyinkronkan konten About di ketiga halaman.
   ========================================================================== */

const ABOUT_DATA = {
  photo: {
    src: "/assets/images/profile-photo.jpg",
    alt: "Foto Profil Faiz Akbarsyah",
    caption: "Faiz Akbarsyah — Creative Director, Medan 2026"
  },

  background: {
    title: "Background & Philosophy",
    paragraphs: [
      "Saya adalah seorang Multidisciplinary Designer dan Creative Director yang berdomisili di Medan, Indonesia. Bidang keahlian saya mencakup identitas brand, grafis gerak (motion graphics), arsitektur visual panggung event, hingga pengarahan seni editorial komersial.",
      "Alih-alih memperlakukan desain sekadar sebagai dekorasi visual, saya berfokus pada bagaimana bahasa visual berfungsi dalam konteks dunia nyata — baik saat mengarahkan tampilan layar LED panggung untuk acara gathering korporat, menyusun kerangka narasi kampanye, maupun merancang sistem gerak berpresisi tinggi."
    ]
  },

  disciplines: {
    title: "Core Disciplines",
    items: [
      {
        title: "Visual Systems & Brand Identity",
        desc: "Perancangan sistem identitas visual menyeluruh, pedoman tipografi, tata letak editorial, dan dokumen komunikasi brand."
      },
      {
        title: "Motion Design & Broadcast",
        desc: "Animasi 2D, grafis siaran, sekuens video pembuka, dan konten perulangan (looping) layar LED panggung."
      },
      {
        title: "Spatial & Event Visuals",
        desc: "Render panggung 3D, konsep photobooth, key visual acara, dan sistem petunjuk arah fisik/digital."
      }
    ]
  },

  /* Ringkasan pendek khusus untuk Portfolio PDF (print.html) — dijaga tetap
     singkat agar sesuai target ±50% tinggi halaman pertama A4 saat dicetak. */
  printSummary: "Multidisciplinary Designer dan Creative Director berbasis di Medan. Berpengalaman dalam pengarahan identitas brand, desain sistem visual, grafis gerak (motion graphics), serta arsitektur visual panggung dan event korporat. Berfokus pada kejelasan komunikasi visual, disiplin naratif, dan eksekusi strategis.",

  /* Data khusus untuk CV ATS-Friendly (cv-print.html).
     Tidak menyertakan foto secara sengaja — praktik terbaik ATS menghindari
     elemen non-teks yang berisiko gagal ter-parse atau memicu bias screening. */
  cv: {
    fullName: "Faiz Akbarsyah",
    professionalSummary: "Multidisciplinary Designer dan Creative Director berbasis di Medan. Berpengalaman dalam pengarahan identitas brand, desain sistem visual, grafis gerak (motion graphics), serta arsitektur visual panggung dan event korporat. Berfokus pada kejelasan komunikasi visual, disiplin naratif, dan eksekusi strategis.",
    skills: [
      {
        category: "Creative Direction & Branding",
        items: ["Brand Identity Systems", "Graphic Design", "Editorial Design", "Pitch Decks"]
      },
      {
        category: "Motion & Spatial Design",
        items: ["2D Animation", "Broadcast Motion Loops", "Stage Visual Systems", "3D Renders"]
      },
      {
        category: "Software & Tools",
        items: ["Adobe Illustrator", "Adobe Photoshop", "Adobe Premiere", "Adobe After Effects", "SketchUp", "V-Ray", "Enscape"]
      }
    ],
    education: [
      {
        institution: "Universitas Islam Sumatera Utara",
        degree: "Sarjana Teknik (S.T.) — Teknik Mesin",
        period: "Lulus 2026"
      }
    ]
  }
};

if (typeof module !== 'undefined') {
  module.exports = ABOUT_DATA;
}

/* ==========================================================================
   FAIZ AKBARSYAH® — ABOUT DATA (Single Source of Truth)
   Digunakan oleh: about.html, print.html (Portfolio PDF), cv-print.html (CV ATS)
   Cukup update file ini untuk menyinkronkan konten About di ketiga halaman.
   Sumber konten: Resume - Faiz Akbarsyah - Graphic Design (Google Docs, Sep 2026)
   ========================================================================== */

const ABOUT_DATA = {
  photo: {
    src: "/assets/images/profile-photo.jpg",
    alt: "Potret Faiz Akbarsyah",
    caption: "Faiz Akbarsyah — Creative Director, Medan"
  },

  /* Deretan angka di about.html (di bawah headline) */
  stats: [
    { value: "3+", label: "Tahun di industri kreatif" },
    { value: "30+", label: "Konser, festival & aktivasi brand" },
    { value: "30.000+", label: "Pengunjung event yang merasakan visualnya" },
    { value: "50+", label: "Aset visual diproduksi setiap bulan" }
  ],

  background: {
    title: "Dari Teknik Mesin ke Panggung Festival",
    paragraphs: [
      "Saya Faiz Akbarsyah — Creative Director dan Graphic Designer yang berbasis di Medan. Selama lebih dari tiga tahun, saya merancang wajah visual festival musik, event gaya hidup, dan brand yang ingin tampil lebih berani — dari key visual pertama hingga layar LED di hari acara.",
      "Saya tidak berangkat dari sekolah desain, melainkan Teknik Mesin. Dari sana saya membawa cara kerja yang masih saya pegang: pahami sistemnya dulu, baru bangun bentuknya. Setiap visual yang saya buat punya struktur, alasan, dan tujuan yang jelas.",
      "Bagi saya, desain yang baik tidak berhenti di layar monitor. Ia harus tetap bekerja saat dicetak di billboard 6×12 meter, diputar di LED panggung, atau dilewati sekilas di feed media sosial — dan tetap terasa sebagai satu identitas di semua titik itu."
    ]
  },

  disciplines: {
    title: "Core Disciplines",
    items: [
      {
        title: "Creative Direction",
        desc: "Merumuskan arah visual dan strategi komunikasi kampanye, lalu menyatukan tim, KOL, media partner, dan sponsor dalam satu bahasa visual."
      },
      {
        title: "Event Visual Production",
        desc: "Key visual, desain panggung, konten LED, merchandise, hingga ambient media venue — dirancang untuk dieksekusi akurat di lapangan bersama vendor dan tim produksi."
      },
      {
        title: "Brand Identity & Graphic Design",
        desc: "Identitas visual yang kohesif dan sistem desain yang konsisten di media cetak maupun digital."
      },
      {
        title: "Social Media & Visual Storytelling",
        desc: "Konten berbasis insight platform — dari teaser hingga pengumuman line-up — untuk membangun antisipasi dan engagement."
      },
      {
        title: "Motion & Video",
        desc: "Aftermovie, opening video, dan konten motion untuk event dan kanal digital."
      }
    ]
  },

  /* Judul blok timeline di about.html. Isi timeline diambil dari cv.experience
     (field "summary"), jadi riwayat kerja cukup ditulis satu kali di bawah. */
  experienceSection: {
    title: "Perjalanan Karier"
  },

  /* Ringkasan pendek khusus untuk Portfolio PDF (print.html) — dijaga tetap
     singkat agar sesuai target ±50% tinggi halaman pertama A4 saat dicetak. */
  printSummary: "Creative Director dan Graphic Designer berbasis di Medan dengan lebih dari 3 tahun pengalaman di Creative Direction, Event Visual Production, dan Graphic Design. Berlatar belakang Teknik Mesin, memadukan cara berpikir analitis dan terstruktur dengan eksekusi visual yang berani — telah menangani 30+ konser, festival, dan aktivasi brand, dari key visual hingga layar panggung.",

  /* Data khusus untuk CV ATS-Friendly (cv-print.html).
     Tidak menyertakan foto secara sengaja — praktik terbaik ATS menghindari
     elemen non-teks yang berisiko gagal ter-parse atau memicu bias screening. */
  cv: {
    fullName: "Faiz Akbarsyah M Harahap",
    headline: "Creative Director | Graphic Designer | Event Visual Specialist",
    professionalSummary: "Profesional kreatif dengan lebih dari 3 tahun pengalaman di bidang Creative Direction, Event Visual Production, dan Graphic Design. Lulusan Teknik Mesin yang memadukan pola pikir analitis dan terstruktur dengan inovasi visual untuk menghasilkan desain yang kuat dan efektif. Berpengalaman memimpin strategi kreatif dan produksi visual untuk festival musik dan gaya hidup berskala besar, serta menerjemahkan visi brand menjadi konten visual yang menarik audiens dan meningkatkan engagement.",

    skills: [
      {
        category: "Keahlian Inti",
        items: ["Graphic Design", "Creative Direction", "Event Visual Production", "Brand Identity", "Visual Storytelling", "Content Creation", "Creative Management", "Motion & Video"]
      },
      {
        category: "Perangkat Lunak",
        items: ["Adobe Photoshop", "Adobe Illustrator", "Adobe Premiere Pro", "Adobe After Effects", "Figma", "CorelDRAW", "SketchUp", "V-Ray", "Enscape"]
      },
      {
        category: "Keterampilan Profesional",
        items: ["Project Management", "Detail-Oriented", "Problem Solving", "Analytical Thinking", "Creative Thinking"]
      }
    ],

    /* Riwayat kerja — dipakai di CV (role, organization, location, period, highlights)
       DAN timeline about.html (role, organization, location, period, summary). */
    experience: [
      {
        role: "Lead Graphic Designer",
        organization: "Zin Studio",
        location: "Medan, Indonesia",
        period: "2024 — Sekarang",
        summary: "Memimpin produksi 50+ aset visual per bulan untuk branding, kampanye digital, dan kebutuhan cetak klien — sekaligus menjaga quality control hingga tingkat revisi di bawah 15%.",
        highlights: [
          "Merancang dan memproduksi 50+ aset visual setiap bulan untuk berbagai klien, meliputi branding, kampanye media sosial, dan kebutuhan cetak.",
          "Bertanggung jawab atas quality control visual akhir; menekan tingkat revisi hingga di bawah 15% dan memastikan setiap desain sesuai standar estetika serta brief klien sebelum dipublikasikan.",
          "Menerjemahkan konsep abstrak menjadi brand identity yang kohesif menggunakan Adobe Illustrator dan Photoshop untuk memperkuat representasi brand klien di pasar.",
          "Berkolaborasi mengembangkan key visual yang berkontribusi pada peningkatan engagement target audiens di platform digital sebesar 20–30%.",
          "Merancang aset visual media sosial dan memberikan konsultasi strategi konten visual yang meningkatkan engagement rate organik hingga 25%.",
          "Menganalisis insight platform digital klien untuk menyesuaikan gaya desain dan format konten (Carousel, Reels) dengan algoritma dan tren pasar.",
          "Melakukan social media monitoring dan community management untuk menjaga interaksi positif antara brand klien dan audiens digitalnya."
        ]
      },
      {
        role: "Event Visual Production",
        organization: "PT Traza Tama Mandiri",
        location: "Medan, Indonesia",
        period: "2022 — 2024",
        summary: "Merancang visual untuk 30+ konser, festival, dan aktivasi brand skala lokal hingga nasional — dari key visual sampai elemen panggung — bersama 10+ vendor dan tim produksi lapangan.",
        highlights: [
          "Bertanggung jawab penuh atas perancangan dan produksi aset visual untuk 30+ event skala lokal dan nasional, termasuk konser, festival, dan aktivasi brand.",
          "Mendesain key visual, materi promosi media sosial, merchandise, dan elemen stage design yang meningkatkan pengalaman visual bagi 30.000+ total pengunjung acara.",
          "Berkoordinasi dengan 10+ vendor pihak ketiga, teknisi lighting, dan tim produksi lapangan untuk memastikan desain visual diimplementasikan akurat saat on-site execution."
        ]
      }
    ],

    education: [
      {
        institution: "Universitas Islam Sumatera Utara",
        degree: "Sarjana Teknik (S.T.) — Teknik Mesin",
        period: "2021 — 2025"
      }
    ]
  }
};

if (typeof module !== 'undefined') {
  module.exports = ABOUT_DATA;
}

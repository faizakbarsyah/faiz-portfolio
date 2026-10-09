/* ==========================================================================
   FAIZ AKBARSYAH® — SITE CONFIG (Single Source of Truth)
   Identitas owner, kontak, URL situs, kategori, portfolio profile,
   dan testimoni.
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
      whatsappNumber: "628116362406",
      whatsappDisplay: "+62 811-6362-406",
      whatsappDefaultMessage:
        "Halo Faiz, saya ingin berdiskusi mengenai proyek kreatif.",
      instagramHandle: "@faizakbarsyah",
      instagramUrl: "https://instagram.com/faizakbarsyah",
      linkedinUrl: "https://linkedin.com/in/faizakbarsyah",
      behanceUrl: "https://behance.net/faizakbarsyah"
    },
  
    /*
     * MASTER PROJECT CATEGORIES
     *
     * Kategori ini menjadi taxonomy utama untuk:
     * - Work filtering
     * - Client project filtering
     * - Portfolio PDF filtering
     *
     * Jangan membuat variasi nama kategori di projects.json.
     */
  
    categories: [
      "All",
      "Brand Identity",
      "Graphic Design",
      "Motion Design",
      "Event Visual",
      "Social Media Content",
      "Creative Campaign",
      "Digital Marketing",
      "Presentation Design"
    ],
  
    /*
     * PORTFOLIO PROFILES
     *
     * Satu project dapat masuk ke beberapa profile berdasarkan kategori.
     * Ini menjadi dasar untuk membuat versi portfolio PDF yang berbeda
     * sesuai pekerjaan yang sedang dilamar.
     */
  
    portfolioProfiles: [
      {
        slug: "graphic-design",
        title: "Graphic Design Portfolio",
        description:
          "Selected works focused on graphic design, visual systems, motion, branding, and event communication.",
        categories: [
          "Graphic Design",
          "Motion Design",
          "Brand Identity",
          "Event Visual"
        ]
      },
  
      {
        slug: "social-media",
        title: "Social Media & Digital Marketing Portfolio",
        description:
          "Selected works focused on social media content, creative campaigns, digital marketing, and visual communication.",
        categories: [
          "Social Media Content",
          "Creative Campaign",
          "Digital Marketing",
          "Graphic Design"
        ]
      },
  
      {
        slug: "branding",
        title: "Branding Portfolio",
        description:
          "Selected works focused on brand identity and supporting visual communication.",
        categories: [
          "Brand Identity",
          "Graphic Design"
        ]
      },
  
      {
        slug: "motion-design",
        title: "Motion Design Portfolio",
        description:
          "Selected works focused on motion design, event visuals, and moving-image communication.",
        categories: [
          "Motion Design",
          "Event Visual",
          "Social Media Content"
        ]
      },
  
      {
        slug: "full",
        title: "Selected Portfolio",
        description:
          "A broader selection of selected creative works across disciplines.",
        categories: [
          "Brand Identity",
          "Graphic Design",
          "Motion Design",
          "Event Visual",
          "Social Media Content",
          "Creative Campaign",
          "Digital Marketing",
          "Presentation Design"
        ]
      }
    ],
  
    /*
     * TESTIMONIALS / ENDORSEMENTS
     *
     * Section otomatis DISEMBUNYIKAN selama array ini kosong.
     */
  
    testimonials: []
  };
  
  if (typeof module !== "undefined") {
    module.exports = SITE_CONFIG;
  }
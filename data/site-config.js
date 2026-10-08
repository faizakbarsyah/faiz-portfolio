/* ==========================================================================
   FAIZ AKBARSYAH® — SITE CONFIG
   Single Source of Truth
   Identitas owner, kontak, URL situs, kategori, dan testimoni.
   Dipakai oleh semua halaman lewat js/app.js.
   ========================================================================== */

   const SITE_CONFIG = {

    siteUrl:
      "https://faizcreativework.netlify.app",
  
  
    owner: {
  
      name:
        "FAIZ AKBARSYAH®",
  
      title:
        "Graphic Designer, Motion Designer & Creative Director",
  
      location:
        "Medan, Indonesia",
  
      cvPath:
        "/assets/faiz-akbarsyah-cv.pdf"
  
    },
  
  
    contact: {
  
      email:
        "faiz.akbarsyah@gmail.com",
  
      whatsappNumber:
        "628116362406",
  
      whatsappDisplay:
        "+62 811-6362-406",
  
      whatsappDefaultMessage:
        "Halo Faiz, saya ingin berdiskusi mengenai proyek kreatif.",
  
      instagramHandle:
        "@faizakbarsyah",
  
      instagramUrl:
        "https://instagram.com/faizakbarsyah",
  
      linkedinUrl:
        "https://linkedin.com/in/faizakbarsyah",
  
      behanceUrl:
        "https://behance.net/faizakbarsyah"
  
    },
  
  
    categories: [
  
      "All",
  
      "Brand Identity",
  
      "Graphic Design",
  
      "Motion Design",
  
      "Event Visual",
  
      "Social Media Content",
  
      "Presentation Design"
  
    ],
  
  
    /* Testimoni / Endorsements
       Section otomatis disembunyikan selama array ini kosong. */
  
    testimonials: []
  
  };
  
  
  if (typeof module !== "undefined") {
  
    module.exports =
      SITE_CONFIG;
  
  }
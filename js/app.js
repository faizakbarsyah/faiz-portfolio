document.addEventListener("DOMContentLoaded", () => {
  // 1. Inisialisasi Link Kontak dari Config
  if (typeof SITE_CONFIG !== 'undefined') {
    const emailLinks = document.querySelectorAll("#emailLink");
    const waLinks = document.querySelectorAll("#whatsappLink");

    emailLinks.forEach(link => { link.href = `mailto:${SITE_CONFIG.contact.email}`; });
    waLinks.forEach(link => { link.href = `https://wa.me/${SITE_CONFIG.contact.whatsappNumber}?text=${encodeURIComponent(SITE_CONFIG.contact.whatsappDefaultMessage)}`; });
  }

  // 2. Inisialisasi Halaman Berbasis ABOUT_DATA (about.html & cv-print.html)
  //    Tidak bergantung pada projects.json, sehingga dijalankan terpisah dari fetch di bawah.
  initAboutPageView();
  initCvPrintView();

  // 2b. Inisialisasi Hamburger Menu Mobile (index.html, about.html, services.html)
  initMobileNavToggle();

  // 3. Load Data Proyek & Fitur Utama
  fetch("/data/projects.json")
    .then(res => res.json())
    .then(projects => {
      initFilterAndGallery(projects);
      initHeroKineticScroll();
      initHeroDynamicBackground();
      initProjectDetailView(projects);
      initPrintView(projects);
      initServicesPageView(projects);
    })
    .catch(err => console.error("Gagal memuat data proyek:", err));
});

/* ==========================================================================
   01. HERO KINETIC TYPOGRAPHY SCROLL
   ========================================================================== */
function initHeroKineticScroll() {
  const heroLines = document.querySelectorAll(".hero-title-line");
  if (heroLines.length === 0) return;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroLines[0].style.transform = `translateX(${scrollY * 0.15}px)`;
      if (heroLines[1]) {
        heroLines[1].style.transform = `translateX(-${scrollY * 0.15}px)`;
      }
    }
  }, { passive: true });
}

/* ==========================================================================
   01c. HERO DYNAMIC BACKGROUND — Cursor Parallax & Scroll-Reactive Cover Image
   Menggerakkan .hero-cover-img (lihat css/style.css) berdasarkan posisi
   cursor (desktop/pointer halus saja) dan progres scroll (semua device,
   termasuk touch). Sepenuhnya terpisah dari initHeroKineticScroll di atas,
   sehingga posisi/transform teks hero-title & hero-subtitle tidak tersentuh.

   Catatan performa: versi ini TIDAK memakai requestAnimationFrame loop yang
   berjalan selamanya (beda dari versi blob sebelumnya). JS hanya menaruh
   target transform sekali per event (mousemove/scroll, dibatch lewat satu
   rAF per event), lalu CSS `transition` di .hero-cover-img yang menghaluskan
   animasinya di compositor thread browser — jauh lebih ringan untuk CPU/baterai.
   ========================================================================== */
function initHeroDynamicBackground() {
  const heroSection = document.querySelector(".hero-section");
  const coverImg = document.querySelector(".hero-cover-img");
  if (!heroSection || !coverImg) return;

  // Hormati preferensi user: jika reduced-motion aktif, gambar tetap diam total.
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const supportsCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const MAX_PAN = 2.2;          // % translate maksimum dari parallax cursor — subtle, tidak pernah menyingkap tepi (buffer overscan 4% di CSS)
  const MAX_SCROLL_SCALE = 0.05; // zoom-in halus (maks +5%) saat user scroll melewati hero

  let panX = 0, panY = 0;
  let scrollProgress = 0;
  let rafPending = false;

  const applyTransform = () => {
    rafPending = false;
    const scale = 1 + scrollProgress * MAX_SCROLL_SCALE;
    coverImg.style.transform = `translate3d(${panX.toFixed(2)}%, ${panY.toFixed(2)}%, 0) scale(${scale.toFixed(3)})`;
  };

  // Batch penulisan style: kalau ada beberapa event menumpuk dalam 1 frame,
  // cukup 1x pembaruan DOM — bukan 1x update per event mentah.
  const requestApply = () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(applyTransform);
    }
  };

  if (supportsCursor) {
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 .. 0.5
      const normY = (e.clientY - rect.top) / rect.height - 0.5;   // -0.5 .. 0.5
      panX = normX * -2 * MAX_PAN;
      panY = normY * -2 * MAX_PAN;
      requestApply();
    });

    heroSection.addEventListener("mouseleave", () => {
      panX = 0;
      panY = 0;
      requestApply();
    });
  }

  const updateScrollProgress = () => {
    const heroHeight = heroSection.offsetHeight || 1;
    scrollProgress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
    requestApply();
  };

  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
}

/* ==========================================================================
   01b. MOBILE NAVIGATION — HAMBURGER TOGGLE (Responsive Fix)
   Mengontrol buka/tutup overlay nav fullscreen di mobile (<=768px).
   Dipasang di halaman yang punya #navToggleBtn + #mainNav: index.html,
   about.html, services.html.
   ========================================================================== */
function initMobileNavToggle() {
  const toggleBtn = document.getElementById("navToggleBtn");
  const nav = document.getElementById("mainNav");
  if (!toggleBtn || !nav) return;

  const closeNav = () => {
    document.body.classList.remove("nav-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  };

  const openNav = () => {
    document.body.classList.add("nav-open");
    toggleBtn.setAttribute("aria-expanded", "true");
  };

  toggleBtn.addEventListener("click", () => {
    const isOpen = document.body.classList.contains("nav-open");
    isOpen ? closeNav() : openNav();
  });

  // Tutup otomatis saat salah satu link nav diklik
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeNav);
  });

  // Tutup otomatis kalau layar di-resize balik ke desktop (mis. rotasi tablet)
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeNav();
  });

  // Tutup dengan tombol Escape untuk aksesibilitas keyboard
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
}

/* ==========================================================================
   02. GALLERY & HOVER VIDEO PREVIEW SYSTEM (Task D Controls)
   ========================================================================== */
function initFilterAndGallery(projects) {
  const filterContainer = document.getElementById("filterContainer");
  const gallery = document.getElementById("workGallery");
  if (!filterContainer || !gallery) return;

  const categories = SITE_CONFIG.categories || ["All"];
  filterContainer.innerHTML = categories.map((cat, idx) => `
    <button class="filter-btn ${idx === 0 ? 'active' : ''}" data-category="${cat}">${cat}</button>
  `).join('');

  const renderProjects = (category) => {
    const filtered = category === "All" 
      ? projects 
      : projects.filter(p => p.categories.includes(category));

    gallery.innerHTML = filtered.map(p => {
      const hasVideo = p.previewVideo && p.previewVideo.trim() !== "";
      return `
        <a href="/projects/${p.slug}" class="project-card size-${p.size || 'medium'}" data-video="${p.previewVideo || ''}">
          <div class="card-media-wrapper">
            <img src="${p.coverImage}" alt="${p.title}" loading="lazy" />
            ${hasVideo ? `
              <video loop muted playsinline preload="none" poster="${p.coverImage}">
                <source src="${p.previewVideo}" type="video/mp4">
              </video>
              <span class="play-badge">Preview</span>
            ` : ''}
          </div>
          <div class="card-info">
            <span class="card-title">${p.title}</span>
            <span class="card-meta">${p.categories[0]} / ${p.year}</span>
          </div>
        </a>
      `;
    }).join('');

    attachHoverVideoHandlers();
  };

  renderProjects("All");

  filterContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      renderProjects(e.target.dataset.category);
    }
  });

  // Task D: Setup Circular Desktop Navigation
  const prevBtn = document.getElementById("galleryPrev");
  const nextBtn = document.getElementById("galleryNext");

  if (prevBtn && nextBtn) {
    const scrollAmount = 470;

    nextBtn.addEventListener("click", () => {
      if (gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 10) {
        gallery.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    });

    prevBtn.addEventListener("click", () => {
      if (gallery.scrollLeft <= 10) {
        gallery.scrollTo({ left: gallery.scrollWidth, behavior: 'smooth' });
      } else {
        gallery.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    });
  }
}

/* ==========================================================================
   03. SERVICES PAGE VIEW (Dynamic Category Pitch Page)
   ========================================================================== */
function initServicesPageView(projects) {
  const titleEl = document.getElementById("serviceCategoryTitle");
  const galleryEl = document.getElementById("serviceGallery");
  if (!titleEl || !galleryEl) return;

  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category") || "Brand Identity";

  titleEl.textContent = category;

  const filtered = projects.filter(p => p.categories.includes(category));

  galleryEl.innerHTML = filtered.map(p => `
    <a href="/projects/${p.slug}" style="text-decoration:none; color:inherit; display:block;">
      <div style="aspect-ratio: 4/3; background: var(--color-surface); overflow:hidden; margin-bottom: 0.75rem;">
        <img src="${p.coverImage}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;" loading="lazy" />
      </div>
      <span style="font-weight:600; font-size: var(--text-body);">${p.title}</span>
    </a>
  `).join('');
}

/* ==========================================================================
   04. HOVER VIDEO PREVIEW HANDLERS
   ========================================================================== */
function attachHoverVideoHandlers() {
  const cards = document.querySelectorAll(".project-card[data-video]");

  cards.forEach(card => {
    const videoSrc = card.dataset.video;
    if (!videoSrc) return;

    const video = card.querySelector("video");
    if (!video) return;

    card.addEventListener("mouseenter", () => {
      video.play().then(() => {
        video.classList.add("is-playing");
      }).catch(() => {});
    });

    card.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
      video.classList.remove("is-playing");
    });
  });
}

/* ==========================================================================
   05. PROJECT DETAIL / CASE STUDY VIEW
   ========================================================================== */
function initProjectDetailView(projects) {
  const container = document.getElementById("projectContainer");
  if (!container) return;

  let slug = new URLSearchParams(window.location.search).get("slug");

  // Fallback: parsing dari pathname jika query string tidak terbawa saat rewrite Netlify
  if (!slug) {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "projects" && pathParts[1]) {
      slug = pathParts[1];
    }
  }

  const project = projects.find(p => p.slug === slug);

  if (!project) {
    container.innerHTML = `<p style="padding: 4rem 2.5rem;">Proyek tidak ditemukan.</p>`;
    return;
  }

  const currentIndex = projects.findIndex(p => p.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  const galleryHTML = project.gallery && project.gallery.length > 0 ? `
    <div class="case-study-gallery">
      ${project.gallery.map(item => `
        <div class="gallery-item">
          ${item.type === "video"
            ? `<video src="${item.src}" controls></video>`
            : `<img src="${item.src}" alt="${item.caption || project.title}" loading="lazy" />`
          }
          ${item.caption ? `<p class="gallery-caption">${item.caption}</p>` : ''}
        </div>
      `).join('')}
    </div>
  ` : '';

  document.title = `${project.title} — FAIZ AKBARSYAH®`;

  container.innerHTML = `
    <article>
      <section class="case-study-hero">
        <p class="hero-subtitle">${project.categories.join(" / ")}</p>
        <h1 class="font-serif" style="font-size: var(--text-h1); line-height: 1.05; max-width: 1000px;">${project.title}</h1>
      </section>

      <div class="case-study-meta-grid">
        <div>
          <p class="meta-item-label">Year</p>
          <p class="meta-item-value">${project.year}</p>
        </div>
        ${project.client ? `
          <div>
            <p class="meta-item-label">Client</p>
            <p class="meta-item-value">${project.client}</p>
          </div>
        ` : ''}
        <div>
          <p class="meta-item-label">Role</p>
          <p class="meta-item-value">${project.role}</p>
        </div>
      </div>

      <div class="case-study-media-hero">
        <img src="${project.coverImage}" alt="${project.title}" />
      </div>

      <section>
        ${project.context ? `
          <div class="case-study-narrative">
            <h3 class="narrative-title">01. Konteks</h3>
            <div class="narrative-content">${project.context}</div>
          </div>
        ` : ''}

        ${project.approach ? `
          <div class="case-study-narrative">
            <h3 class="narrative-title">02. Pendekatan</h3>
            <div class="narrative-content">${project.approach}</div>
          </div>
        ` : ''}

        ${project.execution ? `
          <div class="case-study-narrative">
            <h3 class="narrative-title">03. Eksekusi</h3>
            <div class="narrative-content">${project.execution}</div>
          </div>
        ` : ''}

        ${galleryHTML}

        ${project.impact ? `
          <div class="case-study-narrative">
            <h3 class="narrative-title">04. Dampak</h3>
            <div class="narrative-content">${project.impact}</div>
          </div>
        ` : ''}

        ${project.reflection ? `
          <div class="case-study-narrative">
            <h3 class="narrative-title">05. Refleksi</h3>
            <div class="narrative-content">${project.reflection}</div>
          </div>
        ` : ''}
      </section>

      <a href="/projects/${nextProject.slug}" class="next-project-bar">
        <div>
          <span style="font-size: var(--text-meta); text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.8;">Proyek Selanjutnya →</span>
          <div class="next-project-title">${nextProject.title}</div>
        </div>
        <span style="font-size: 1.5rem;">→</span>
      </a>
    </article>
  `;
}

/* ==========================================================================
   06. PRINT PORTFOLIO VIEW GENERATOR
   ========================================================================== */
function initPrintView(projects) {
  const printGallery = document.getElementById("printGallery");
  const categorySelect = document.getElementById("categorySelect");
  const printCategoryLabel = document.getElementById("printCategoryLabel");

  if (!printGallery || !categorySelect) return;

  const categories = SITE_CONFIG.categories || ["All"];

  categorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get("category") || "All";

  if (categories.includes(initialCategory)) {
    categorySelect.value = initialCategory;
  }

  // Render Foto Profil + Ringkasan About (data dari ABOUT_DATA, sinkron dengan about.html)
  const printAboutContent = document.getElementById("printAboutContent");
  if (printAboutContent && typeof ABOUT_DATA !== 'undefined') {
    printAboutContent.innerHTML = `
      <div class="print-about-photo-wrap">
        <div class="print-about-photo-frame">
          <img src="${ABOUT_DATA.photo.src}" alt="${ABOUT_DATA.photo.alt}" />
        </div>
        <span class="print-about-photo-caption">${ABOUT_DATA.photo.caption}</span>
      </div>
      <div class="print-about-text-wrap">
        <p class="print-about-text">${ABOUT_DATA.printSummary}</p>
      </div>
    `;
  }

  const renderPrintItems = (selectedCategory) => {
    printCategoryLabel.textContent = selectedCategory === "All" 
      ? "ALL CATEGORIES PORTFOLIO" 
      : `${selectedCategory.toUpperCase()} PORTFOLIO`;

    const filtered = selectedCategory === "All"
      ? projects
      : projects.filter(p => p.categories.includes(selectedCategory));

    if (filtered.length === 0) {
      printGallery.innerHTML = `<p style="padding: 2cm 0;">Tidak ada proyek dalam kategori "${selectedCategory}".</p>`;
      return;
    }

    printGallery.innerHTML = filtered.map((p, idx) => `
      <div class="print-item-page">
        <div class="print-item-header">
          <span class="print-item-num font-serif">0${idx + 1}</span>
          <div>
            <h2 class="print-item-title">${p.title}</h2>
            <p class="print-item-sub">${p.categories.join(" / ")} — ${p.year}</p>
          </div>
        </div>

        <div class="print-item-image">
          <img src="${p.coverImage}" alt="${p.title}" />
        </div>

        <div class="print-item-details">
          ${p.summary ? `<p class="print-item-summary"><strong>Ringkasan:</strong> ${p.summary}</p>` : ''}
          ${p.context ? `<p class="print-item-context"><strong>Konteks:</strong> ${p.context}</p>` : ''}
          ${p.execution ? `<p class="print-item-execution"><strong>Eksekusi:</strong> ${p.execution}</p>` : ''}
        </div>
      </div>
    `).join('');
  };

  renderPrintItems(categorySelect.value);

  categorySelect.addEventListener("change", (e) => {
    renderPrintItems(e.target.value);
  });
}

/* ==========================================================================
   07. ABOUT PAGE DYNAMIC RENDERER
   Merender about.html dari ABOUT_DATA (data/about-data.js): foto profil,
   Background & Philosophy, dan Core Disciplines.
   ========================================================================== */
function initAboutPageView() {
  const photoContainer = document.getElementById("aboutPhotoCard");
  const backgroundContainer = document.getElementById("aboutBackgroundBlock");
  const disciplinesContainer = document.getElementById("aboutDisciplinesBlock");

  if (!photoContainer || !backgroundContainer || !disciplinesContainer) return;
  if (typeof ABOUT_DATA === 'undefined') return;

  const data = ABOUT_DATA;

  photoContainer.innerHTML = `
    <div class="about-photo-card">
      <div class="about-photo-frame">
        <img src="${data.photo.src}" alt="${data.photo.alt}" />
      </div>
      <span class="about-photo-caption">${data.photo.caption}</span>
    </div>
  `;

  backgroundContainer.innerHTML = `
    <h2 class="font-serif" style="font-size: var(--text-h2); color: var(--color-purple); margin-bottom: 1.5rem;">${data.background.title}</h2>
    ${data.background.paragraphs.map(p => `<p class="about-text">${p}</p>`).join('')}
  `;

  disciplinesContainer.innerHTML = `
    <h2 class="font-serif" style="font-size: var(--text-h2); color: var(--color-purple); margin-bottom: 1.5rem;">${data.disciplines.title}</h2>
    <div class="about-capabilities-matrix" style="margin-top: 0; border-top: none; padding-top: 0;">
      ${data.disciplines.items.map((item, idx) => `
        <div class="matrix-item"${idx > 0 ? ' style="margin-top: 1.5rem;"' : ''}>
          <span class="matrix-title">${item.title}</span>
          <span class="matrix-desc">${item.desc}</span>
        </div>
      `).join('')}
    </div>
  `;
}

/* ==========================================================================
   08. CV ATS-FRIENDLY DYNAMIC RENDERER
   Merender cv-print.html dari ABOUT_DATA.cv + SITE_CONFIG. Sengaja tidak
   menyertakan foto — format tetap plain-text/1 kolom agar aman untuk parser ATS.
   ========================================================================== */
function initCvPrintView() {
  const nameEl = document.getElementById("cvName");
  const titleEl = document.getElementById("cvTitle");
  const contactEl = document.getElementById("cvContact");
  const summaryEl = document.getElementById("cvSummary");
  const skillsEl = document.getElementById("cvSkills");
  const educationEl = document.getElementById("cvEducation");

  if (!nameEl || !titleEl || !contactEl || !summaryEl || !skillsEl || !educationEl) return;
  if (typeof ABOUT_DATA === 'undefined' || typeof SITE_CONFIG === 'undefined') return;

  const cv = ABOUT_DATA.cv;
  const owner = SITE_CONFIG.owner;
  const contact = SITE_CONFIG.contact;

  nameEl.textContent = cv.fullName;
  titleEl.textContent = owner.title;

  contactEl.innerHTML = `
    <span>${owner.location}</span>
    <span>${contact.email}</span>
    <span>faizakbarsyah.com</span>
    <span>${contact.linkedinUrl.replace(/^https?:\/\//, '')}</span>
  `;

  summaryEl.textContent = cv.professionalSummary;

  skillsEl.innerHTML = cv.skills.map(group => `
    <li><strong>${group.category}:</strong> ${group.items.join(', ')}.</li>
  `).join('');

  educationEl.innerHTML = cv.education.map(edu => `
    <div class="cv-item">
      <div class="cv-item-header">
        <span>${edu.institution}</span>
        <span>${edu.period}</span>
      </div>
      <div class="cv-item-sub">${edu.degree}</div>
    </div>
  `).join('');
}
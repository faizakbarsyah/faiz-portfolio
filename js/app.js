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

  // 2a. Testimoni dari SITE_CONFIG (index.html) — section disembunyikan bila kosong
  initTestimonialsView();

  // 2b. Inisialisasi Hamburger Menu Mobile (index.html, about.html, services.html)
  initMobileNavToggle();

  // 2c. Inisialisasi Animasi Hero (index.html)
  //     Sengaja dijalankan DI LUAR fetch projects.json: animasi hero tidak butuh
  //     data proyek, jadi harus langsung aktif walaupun fetch lambat atau gagal.
  initHeroKineticScroll();
  initHeroDynamicBackground();

  // 3. Load Data Proyek & Fitur Utama
  fetch("/data/projects.json")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(allProjects => {
      // Hanya proyek dengan published !== false yang tampil di seluruh situs
      // (galeri, services, case study, PDF, CV). Proyek tanpa aset/video yang
      // belum siap diberi "published": false di projects.json.
      const projects = allProjects.filter(p => p.published !== false);

      initFilterAndGallery(projects);
      initProjectDetailView(projects);
      initPrintView(projects);
      initServicesPageView(projects);
      initCvProjectsView(projects);
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
   termasuk touch). Scroll down = zoom-in hingga +22% (MAX_SCROLL_SCALE),
   berpusat di transform-origin yang diatur di CSS. Sepenuhnya terpisah dari initHeroKineticScroll di atas,
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

  const MAX_PAN = 2.2;           // % translate maksimum dari parallax cursor — subtle, tidak pernah menyingkap tepi (buffer overscan 4% di CSS)
  const MAX_SCROLL_SCALE = 0.22; // zoom-in saat scroll: dari scale(1) di atas hero → scale(1.22) saat hero habis di-scroll

  let panX = 0, panY = 0;
  let scrollProgress = 0;
  let lastAppliedProgress = -1;
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
    const linear = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
    // Easing ease-out (1 - (1-t)^2): zoom langsung terasa di awal scroll,
    // lalu melambat mendekati akhir hero — terasa lebih "sinematik" daripada linear.
    scrollProgress = 1 - Math.pow(1 - linear, 2);

    // Hemat kerja: setelah hero lewat dari viewport, tidak perlu update DOM lagi.
    if (scrollProgress === lastAppliedProgress) return;
    lastAppliedProgress = scrollProgress;
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
            <span class="card-meta">${[p.categories[0], p.year].filter(Boolean).join(" / ")}</span>
          </div>
        </a>
      `;
    }).join('');

    attachHoverVideoHandlers();
    attachYouTubeThumbFallback(gallery);
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

  attachYouTubeThumbFallback(galleryEl);
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
          ${item.type === "youtube"
            ? renderYouTubeFacade(item, project.title)
            : item.type === "video"
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
        ${project.year ? `
          <div>
            <p class="meta-item-label">Year</p>
            <p class="meta-item-value">${project.year}</p>
          </div>
        ` : ''}
        ${project.client ? `
          <div>
            <p class="meta-item-label">Client</p>
            <p class="meta-item-value">${project.client}</p>
          </div>
        ` : ''}
        ${project.role ? `
          <div>
            <p class="meta-item-label">Role</p>
            <p class="meta-item-value">${project.role}</p>
          </div>
        ` : ''}
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

  initYouTubeFacades(container);
  attachYouTubeThumbFallback(container);
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

  // Footer kontak dokumen PDF — dari SITE_CONFIG agar selalu sama dengan website & CV
  const printFooterContact = document.getElementById("printFooterContact");
  if (printFooterContact) {
    const { email, whatsappDisplay } = SITE_CONFIG.contact;
    printFooterContact.textContent = `${email} — WA ${whatsappDisplay} — ${SITE_CONFIG.owner.location}`.toUpperCase();
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
            <p class="print-item-sub">${[p.categories.join(" / "), p.year].filter(Boolean).join(" — ")}</p>
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
  attachYouTubeThumbFallback(printGallery);

  categorySelect.addEventListener("change", (e) => {
    renderPrintItems(e.target.value);
    attachYouTubeThumbFallback(printGallery);
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

  // Blok opsional: stats & timeline pengalaman — masing-masing punya guard sendiri
  const statsContainer = document.getElementById("aboutStatsBlock");
  if (statsContainer && Array.isArray(data.stats) && data.stats.length > 0) {
    statsContainer.innerHTML = `
      <dl class="about-stats">
        ${data.stats.map(stat => `
          <div class="about-stat">
            <dt class="about-stat-label">${stat.label}</dt>
            <dd class="about-stat-value font-serif">${stat.value}</dd>
          </div>
        `).join('')}
      </dl>
    `;
  }

  const experienceContainer = document.getElementById("aboutExperienceBlock");
  const experience = data.cv && Array.isArray(data.cv.experience) ? data.cv.experience : [];
  if (experienceContainer && experience.length > 0) {
    const title = (data.experienceSection && data.experienceSection.title) || "Experience";
    experienceContainer.innerHTML = `
      <div class="about-timeline">
        <h2 class="font-serif about-timeline-heading">${title}</h2>
        <ol class="timeline-list">
          ${experience.map(exp => `
            <li class="timeline-item">
              <span class="timeline-period">${exp.period}</span>
              <div class="timeline-body">
                <h3 class="timeline-role">${exp.role}</h3>
                <p class="timeline-org">${[exp.organization, exp.location].filter(Boolean).join(' · ')}</p>
                ${exp.summary ? `<p class="timeline-summary">${exp.summary}</p>` : ''}
              </div>
            </li>
          `).join('')}
        </ol>
      </div>
    `;
  }

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
  titleEl.textContent = cv.headline || owner.title;

  const stripProtocol = (url) => url.replace(/^https?:\/\//, '');

  contactEl.innerHTML = `
    <span>${owner.location}</span>
    <span>${contact.email}</span>
    <span>${contact.whatsappDisplay}</span>
    <span>${stripProtocol(SITE_CONFIG.siteUrl)}</span>
    <span>${stripProtocol(contact.linkedinUrl)}</span>
    ${contact.behanceUrl ? `<span>${stripProtocol(contact.behanceUrl)}</span>` : ''}
    <span>Instagram ${contact.instagramHandle}</span>
  `;

  summaryEl.textContent = cv.professionalSummary;

  // Pengalaman — hanya tampil bila ABOUT_DATA.cv.experience berisi data
  const experienceSection = document.getElementById("cvExperienceSection");
  const experienceEl = document.getElementById("cvExperience");
  if (experienceSection && experienceEl && Array.isArray(cv.experience) && cv.experience.length > 0) {
    experienceEl.innerHTML = cv.experience.map(exp => `
      <div class="cv-item">
        <div class="cv-item-header">
          <span>${exp.role}</span>
          <span>${exp.period}</span>
        </div>
        <div class="cv-item-sub">${[exp.organization, exp.location].filter(Boolean).join(' — ')}</div>
        ${exp.highlights && exp.highlights.length > 0 ? `
          <ul class="cv-list">
            ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('');
    experienceSection.hidden = false;
  }

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

/* ==========================================================================
   09. CV — PROYEK TERPILIH (dari projects.json)
   Dipanggil dari fetch callback karena butuh data proyek. Satu sumber data
   dengan galeri website: tambah proyek di projects.json → otomatis masuk CV.
   Format plain-text (tanpa gambar) agar tetap aman untuk parser ATS.
   ========================================================================== */
function initCvProjectsView(projects) {
  const section = document.getElementById("cvProjectsSection");
  const container = document.getElementById("cvProjects");
  if (!section || !container) return;
  if (!Array.isArray(projects) || projects.length === 0) return;

  container.innerHTML = projects.map(p => `
    <div class="cv-item">
      <div class="cv-item-header">
        <span>${p.title}</span>
        <span>${p.year}</span>
      </div>
      <div class="cv-item-sub">${[[p.role, p.client].filter(Boolean).join(' — '), p.categories.join(', ')].filter(Boolean).join(' · ')}</div>
      ${p.summary ? `<p class="cv-item-desc">${p.summary}</p>` : ''}
    </div>
  `).join('');

  section.hidden = false;
}

/* ==========================================================================
   10. TESTIMONIALS VIEW (index.html section 06)
   Merender SITE_CONFIG.testimonials. Section punya atribut `hidden` di HTML,
   dan baru dimunculkan bila ada minimal 1 testimoni — tidak ada placeholder
   yang pernah tampil ke pengunjung.
   ========================================================================== */
function initTestimonialsView() {
  const section = document.getElementById("testimonials");
  const grid = document.getElementById("testimonialsGrid");
  if (!section || !grid) return;
  if (typeof SITE_CONFIG === 'undefined') return;

  const items = Array.isArray(SITE_CONFIG.testimonials) ? SITE_CONFIG.testimonials : [];
  if (items.length === 0) return;

  grid.innerHTML = items.map(t => `
    <blockquote class="testimonial-card">
      <p class="testimonial-quote font-serif">"${t.quote}"</p>
      <cite class="testimonial-author">
        <span class="author-name">${t.name}</span>
        ${t.role ? `<span class="author-role">${t.role}</span>` : ''}
      </cite>
    </blockquote>
  `).join('');

  section.hidden = false;
}


/* ==========================================================================
   11. YOUTUBE FACADE PLAYER (case study)
   Tujuan: video dari channel YouTube agency tetap bisa diputar, tetapi
   identitas channel seminimal mungkin terlihat.
   • Sebelum diklik: hanya thumbnail + tombol play milik situs — player
     YouTube (beserta nama/logo channel) BELUM dimuat sama sekali.
   • Saat diklik: player dimuat via domain youtube-nocookie.com, autoplay.
   • Saat video selesai: player dihancurkan & facade dikembalikan, sehingga
     layar rekomendasi "video lain dari channel ini" tidak sempat tampil.
   • Hanya 1 video diputar dalam satu waktu.
   Catatan jujur: selama video diputar, YouTube masih bisa menampilkan judul/
   channel sesaat saat hover/pause — ini dikunci oleh YouTube, tidak bisa
   dimatikan lewat parameter apa pun.

   Format item di projects.json → gallery:
   { "type": "youtube", "id": "nDZxX-zBR6c", "caption": "Aftermovie", "poster": "" }
   • "id" boleh diganti "src" berisi URL YouTube lengkap (youtu.be/..., watch?v=...).
   • "poster" opsional: gambar thumbnail kustom (mis. /projects/<slug>/cover.webp).
   ========================================================================== */
function getYouTubeId(item) {
  if (item.id) return String(item.id).trim();
  const src = String(item.src || "");
  const match = src.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : "";
}

function getYouTubeThumb(id) {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

function renderYouTubeFacade(item, projectTitle) {
  const id = getYouTubeId(item);
  if (!id) return "";
  const label = item.caption || projectTitle;
  const poster = item.poster || getYouTubeThumb(id);

  return `
    <div class="yt-facade" data-yt-id="${id}">
      <img class="yt-facade-thumb" src="${poster}" alt="${label}" loading="lazy" />
      <button class="yt-facade-play" type="button" aria-label="Putar video: ${label}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z"></path></svg>
      </button>
    </div>
  `;
}

/* Thumbnail maxresdefault tidak selalu tersedia (video non-HD). YouTube lalu
   mengirim gambar abu-abu 120×90 atau error 404 → turunkan ke hqdefault. */
function attachYouTubeThumbFallback(root) {
  if (!root) return;
  root.querySelectorAll('img[src*="i.ytimg.com"][src*="maxresdefault"]').forEach(img => {
    const downgrade = () => {
      img.src = img.src.replace("maxresdefault", "hqdefault");
    };
    img.addEventListener("error", downgrade, { once: true });
    img.addEventListener("load", () => {
      if (img.naturalWidth > 0 && img.naturalWidth <= 120) downgrade();
    }, { once: true });
    if (img.complete && img.naturalWidth > 0 && img.naturalWidth <= 120) downgrade();
  });
}

let youTubeApiPromise = null;

function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (youTubeApiPromise) return youTubeApiPromise;

  youTubeApiPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("YouTube API timeout")), 6000);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout);
      if (typeof previous === "function") previous();
      resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("YouTube API gagal dimuat"));
    };
    document.head.appendChild(script);
  }).catch(err => {
    youTubeApiPromise = null;
    throw err;
  });

  return youTubeApiPromise;
}

function initYouTubeFacades(root) {
  if (!root) return;
  const facades = root.querySelectorAll(".yt-facade");
  if (facades.length === 0) return;

  let activeReset = null;

  facades.forEach(facade => {
    const id = facade.dataset.ytId;
    if (!id) return;
    const facadeHTML = facade.innerHTML;
    let player = null;

    const reset = () => {
      if (player && typeof player.destroy === "function") {
        try { player.destroy(); } catch (e) { /* abaikan */ }
      }
      player = null;
      facade.classList.remove("is-playing");
      facade.innerHTML = facadeHTML;
      attachYouTubeThumbFallback(facade);
      if (activeReset === reset) activeReset = null;
    };

    const play = () => {
      if (facade.classList.contains("is-playing")) return;
      if (activeReset) activeReset();
      activeReset = reset;

      facade.classList.add("is-playing");
      facade.innerHTML = `<div class="yt-facade-player"></div>`;
      const mount = facade.querySelector(".yt-facade-player");

      loadYouTubeApi()
        .then(YT => {
          if (!facade.classList.contains("is-playing")) return;
          player = new YT.Player(mount, {
            host: "https://www.youtube-nocookie.com",
            videoId: id,
            playerVars: { autoplay: 1, rel: 0, playsinline: 1 },
            events: {
              onReady: (e) => e.target.playVideo(),
              onStateChange: (e) => {
                if (e.data === YT.PlayerState.ENDED) reset();
              }
            }
          });
        })
        .catch(() => {
          // Fallback (mis. API diblokir ad-blocker): iframe biasa tanpa auto-reset di akhir video
          if (!facade.classList.contains("is-playing")) return;
          mount.outerHTML = `
            <iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1"
              title="Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowfullscreen></iframe>
          `;
        });
    };

    facade.addEventListener("click", (e) => {
      if (e.target.closest(".yt-facade-play") || e.target.classList.contains("yt-facade-thumb")) play();
    });
  });
}

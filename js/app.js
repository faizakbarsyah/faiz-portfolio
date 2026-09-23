document.addEventListener("DOMContentLoaded", () => {
  // 1. Inisialisasi Link Kontak dari Config
  if (typeof SITE_CONFIG !== 'undefined') {
    const emailLinks = document.querySelectorAll("#emailLink");
    const waLinks = document.querySelectorAll("#whatsappLink");

    emailLinks.forEach(link => { link.href = `mailto:${SITE_CONFIG.contact.email}`; });
    waLinks.forEach(link => { link.href = `https://wa.me/${SITE_CONFIG.contact.whatsappNumber}?text=${encodeURIComponent(SITE_CONFIG.contact.whatsappDefaultMessage)}`; });
  }

  // 2. Load Data Proyek & Fitur Utama
  fetch("/data/projects.json")
    .then(res => res.json())
    .then(projects => {
      initFilterAndGallery(projects);
      initHeroKineticScroll();
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
  const btnPrev = document.getElementById('galleryPrev');
  const btnNext = document.getElementById('galleryNext');
  
  if (btnPrev && btnNext) {
    const scrollAmount = 450 + 32; // Card width + gap estimation
    btnPrev.addEventListener('click', () => {
      gallery.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    btnNext.addEventListener('click', () => {
      gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   03. SERVICES PITCH PAGE DYNAMIC RENDERER
   ========================================================================== */
function initServicesPageView(projects) {
  const categoryTitle = document.getElementById("serviceCategoryTitle");
  const categoryGallery = document.getElementById("serviceGallery");

  if (!categoryTitle || !categoryGallery) return;

  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category") || "Brand Identity";

  categoryTitle.textContent = category;

  const filtered = projects.filter(p => p.categories.includes(category));

  if (filtered.length === 0) {
    categoryGallery.innerHTML = `<p style="grid-column: 1/-1;">Belum ada eksekusi proyek dalam arsip untuk kategori "${category}".</p>`;
    return;
  }

  categoryGallery.innerHTML = filtered.map(p => `
    <a href="/projects/${p.slug}" class="project-card size-small" style="flex: auto;">
      <div class="card-media-wrapper">
        <img src="${p.coverImage}" alt="${p.title}" loading="lazy" />
      </div>
      <div class="card-info">
        <span class="card-title" style="font-size: 1.1rem;">${p.title}</span>
        <span class="card-meta">${p.year}</span>
      </div>
    </a>
  `).join('');
}

/* ==========================================================================
   04. HOVER VIDEO PLAYBACK ENGINE
   ========================================================================== */
function attachHoverVideoHandlers() {
  const cards = document.querySelectorAll(".project-card");

  cards.forEach(card => {
    const video = card.querySelector("video");
    if (!video) return;

    card.addEventListener("mouseenter", () => {
      if (video.readyState >= 2) {
        video.play();
        video.classList.add("is-playing");
      } else {
        video.load();
        video.addEventListener("loadeddata", () => {
          video.play();
          video.classList.add("is-playing");
        }, { once: true });
      }
    });

    card.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
      video.classList.remove("is-playing");
    });
  });
}

/* ==========================================================================
   05. ADAPTIVE CASE STUDY ROUTER & RENDERER
   ========================================================================== */
function initProjectDetailView(projects) {
  const container = document.getElementById("projectContainer");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  let slug = urlParams.get("slug");
  
  if (!slug) {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "projects" && pathParts[1]) {
      slug = pathParts[1];
    }
  }

  const projectIndex = projects.findIndex(p => p.slug === slug);
  const project = projects[projectIndex];

  if (!project) {
    container.innerHTML = `
      <section class="case-study-hero">
        <h1 class="font-serif" style="font-size: var(--text-h1); margin-bottom: 2rem;">404 — Proyek Tidak Ditemukan</h1>
        <p style="margin-bottom: 2rem;">Halaman proyek yang Anda cari tidak ada atau telah dipindahkan.</p>
        <a href="/" class="cta-pill cta-secondary">Kembali ke Selected Work</a>
      </section>
    `;
    return;
  }

  const nextProject = projects[(projectIndex + 1) % projects.length];

  const galleryHTML = (project.gallery && project.gallery.length > 0) ? `
    <div class="case-study-gallery">
      ${project.gallery.map(item => `
        <div class="gallery-item">
          ${item.type === 'video' ? `
            <video autoplay loop muted playsinline poster="${project.coverImage}">
              <source src="${item.src}" type="video/mp4">
            </video>
          ` : `
            <img src="${item.src}" alt="${item.caption || project.title}" loading="lazy" />
          `}
          ${item.caption ? `<p class="gallery-caption">${item.caption}</p>` : ''}
        </div>
      `).join('')}
    </div>
  ` : '';

  container.innerHTML = `
    <article class="case-study-hero">
      <section style="border-bottom: none; padding-top: 0;">
        <p class="hero-subtitle">${project.categories.join(" / ")} — ${project.year}</p>
        <h1 class="font-serif" style="font-size: var(--text-h1); margin-bottom: 2rem;">${project.title}</h1>
        
        <div class="case-study-meta-grid">
          <div>
            <div class="meta-item-label">Kategori</div>
            <div class="meta-item-value">${project.categories.join(", ")}</div>
          </div>
          <div>
            <div class="meta-item-label">Tahun</div>
            <div class="meta-item-value">${project.year}</div>
          </div>
          ${project.client ? `
            <div>
              <div class="meta-item-label">Klien</div>
              <div class="meta-item-value">${project.client}</div>
            </div>
          ` : ''}
          ${project.role ? `
            <div>
              <div class="meta-item-label">Peran</div>
              <div class="meta-item-value">${project.role}</div>
            </div>
          ` : ''}
        </div>

        <div class="case-study-media-hero">
          <img src="${project.coverImage}" alt="${project.title}" />
        </div>

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
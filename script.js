/* ============================================================
   Michael Kutsche — portfolio homepage
   Slideshow + nav behaviour
   ============================================================ */

// ---- 1. List the images to play, in order. --------------------
// Just drop files into /assets and add their filenames here.
// Any number of images is supported.
const ASSET_LIST = [
  "assets/slide-1.webp",
  "assets/slide-2.webp",
  "assets/slide-3.webp",
  "assets/slide-4.webp",
  "assets/slide-5.webp",
  "assets/slide-6.webp",
];

const SLIDE_DURATION = 3500; // ms — keep in sync with --slide-duration in style.css

(function initSlideshow() {
  const root = document.getElementById("slideshow");
  const progressRoot = document.getElementById("slideProgress");
  if (!root || ASSET_LIST.length === 0) return;

  // Build slide + progress-bar markup
  ASSET_LIST.forEach((src, i) => {
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.dataset.index = i;

    const img = document.createElement("img");
    img.className = "slide__img";
    img.src = src;
    img.alt = "";
    img.loading = i === 0 ? "eager" : "lazy";

    slide.appendChild(img);
    root.insertBefore(slide, progressRoot);

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.innerHTML = "<span></span>";
    progressRoot.appendChild(bar);
  });

  const slides = Array.from(root.querySelectorAll(".slide"));
  const bars = Array.from(progressRoot.querySelectorAll(".bar"));
  let current = 0;
  let timer = null;

  function show(index) {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
    bars.forEach((b, i) => {
      b.classList.toggle("is-done", i < index);
      b.classList.toggle("is-active", i === index);
      if (i > index) b.classList.remove("is-done", "is-active");
    });
    current = index;
  }

  function advance() {
    show((current + 1) % slides.length);
  }

  function play() {
    clearInterval(timer);
    timer = setInterval(advance, SLIDE_DURATION);
  }

  // Pause the loop when the tab isn't visible, resume on return
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(timer);
    } else {
      play();
    }
  });

  function start() {
    show(0);
    play();
  }

  // Don't activate the first slide (and its progress bar) until its
  // image has actually finished downloading — otherwise it flashes
  // blank while every other slide has had a full cycle to preload.
  const firstImg = slides[0].querySelector("img");
  if (firstImg.complete) {
    start();
  } else {
    firstImg.addEventListener("load", start, { once: true });
    firstImg.addEventListener("error", start, { once: true }); // don't hang forever on a bad path
  }
})();

// ---- 2. Mobile nav toggle --------------------------------------
(function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

// ---- 3. Project slideshows ---------------------------------------
// Works for any number of project sections on the page — each one
// with a [data-project-slideshow] wrapper is wired up independently,
// so duplicating a whole .project block for a new project just works.
(function initProjectSlideshows() {
  const containers = document.querySelectorAll("[data-project-slideshow]");

  containers.forEach((container) => {
    const slides = Array.from(container.querySelectorAll(".project-slide"));
    const thumbs = Array.from(container.querySelectorAll(".project-thumb"));
    const stage = container.querySelector(".project-slideshow__stage");
    const thumbStrip = container.querySelector(".project-slideshow__thumbs");
    if (!slides.length) return;

    function show(index) {
      slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
      thumbs.forEach((t, i) => {
        t.classList.toggle("is-active", i === index);
        t.setAttribute("aria-current", i === index ? "true" : "false");
      });
      // Keep the active thumbnail in view — matters once a project has
      // enough images that the strip scrolls (e.g. 20-30+ shots).
      const activeThumb = thumbs[index];
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener("click", () => show(i));
    });

    // Clicking the main image steps to the next slide too.
    if (stage) {
      stage.addEventListener("click", () => {
        const current = slides.findIndex((s) => s.classList.contains("is-active"));
        show((current + 1) % slides.length);
      });
    }

    // Let a plain vertical mouse-wheel scroll the thumbnail strip
    // horizontally, so people don't need to hold Shift on a long row.
    if (thumbStrip) {
      thumbStrip.addEventListener(
        "wheel",
        (e) => {
          if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // already horizontal, let it be
          if (thumbStrip.scrollWidth <= thumbStrip.clientWidth) return; // nothing to scroll
          e.preventDefault();
          thumbStrip.scrollLeft += e.deltaY;
        },
        { passive: false }
      );
    }
  });
})();

// ---- 4. Justified gallery + lightbox -----------------------------
// Row height comes from the FIRST image in that row, at 1/3 of that
// image's native size. Every other image in the row is drawn at that
// same height, keeping its own natural aspect ratio — except the row's
// last image, which is cropped (object-fit: cover) so the row lands
// exactly on the container's right edge. Add/remove entries below;
// everything else (row packing, hover captions, lightbox) is automatic.
const GALLERY_ITEMS = [
  { src: "assets/gallery/g1.webp", title: "Untitled Study I", subtitle: "Oil on canvas, 2024" },
  { src: "assets/gallery/g2.webp", title: "Untitled Study II", subtitle: "Gouache, 2024" },
  { src: "assets/gallery/g3.webp", title: "Untitled Study III", subtitle: "Charcoal, 2023" },
  { src: "assets/gallery/g4.webp", title: "Untitled Study IV", subtitle: "Oil on canvas, 2023" },
  { src: "assets/gallery/g5.webp", title: "Untitled Study V", subtitle: "Ink wash, 2023" },
  { src: "assets/gallery/g6.webp", title: "Untitled Study VI", subtitle: "Gouache, 2022" },
  { src: "assets/gallery/g7.webp", title: "Untitled Study VII", subtitle: "Oil on canvas, 2022" },
  { src: "assets/gallery/g8.webp", title: "Untitled Study VIII", subtitle: "Charcoal, 2022" },
  { src: "assets/gallery/g9.webp", title: "Untitled Study IX", subtitle: "Ink wash, 2021" },
];

const GALLERY_GAP = 4;
const GALLERY_ROW_DIVISOR = 3; // row height = first image's natural height / 3
const GALLERY_MAX_CROP_FRACTION = 0.25; // beyond this, bump the image to the next row instead

function loadImageMeta(item) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ ...item, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
    img.onerror = () => resolve(null); // skip images that fail to load rather than break the whole layout
    img.src = item.src;
  });
}

// Builds one row starting at items[startIndex]. Returns the row and the
// index the next row should start from.
function packRow(items, startIndex, containerWidth) {
  const rowHeight = items[startIndex].naturalHeight / GALLERY_ROW_DIVISOR;
  const row = [];
  let runningWidth = 0;
  let j = startIndex;

  while (j < items.length) {
    const it = items[j];
    const aspect = it.naturalWidth / it.naturalHeight;
    const naturalDisplayWidth = rowHeight * aspect;
    const gapWidth = row.length > 0 ? GALLERY_GAP : 0;

    if (runningWidth + gapWidth + naturalDisplayWidth <= containerWidth) {
      row.push({ ...it, displayWidth: naturalDisplayWidth, displayHeight: rowHeight, aspect });
      runningWidth += gapWidth + naturalDisplayWidth;
      j++;
      continue;
    }

    // Doesn't fit at this row's height — figure out how much of it
    // would need to be cropped to close out the row exactly.
    const remaining = containerWidth - runningWidth - gapWidth;
    const cropFraction = 1 - remaining / naturalDisplayWidth;

    if (cropFraction > GALLERY_MAX_CROP_FRACTION) {
      if (row.length > 0) {
        // Too aggressive a crop — leave this image for the next row, and
        // scale the current row's images up so they fill the container
        // width exactly (no crop needed, since it's an exact solve).
        const sumAspect = row.reduce((sum, rowIt) => sum + rowIt.aspect, 0);
        const availableWidth = containerWidth - GALLERY_GAP * (row.length - 1);
        const scaledHeight = availableWidth / sumAspect;
        const scaledRow = row.map((rowIt) => ({
          ...rowIt,
          displayHeight: scaledHeight,
          displayWidth: scaledHeight * rowIt.aspect,
        }));
        return { row: scaledRow, nextIndex: j };
      }

      // This image is alone in the row (typical on narrow/mobile
      // containers, where the mandated row height is simply too tall
      // for the viewport width) — there's nothing to push it away
      // from, so instead shrink the row height until the image fits
      // at full width with zero crop. Same rule as desktop, just
      // resolving to a one-image row since there's no width to spare.
      const soloHeight = containerWidth / aspect;
      const soloRow = [{ ...it, displayWidth: containerWidth, displayHeight: soloHeight, aspect }];
      return { row: soloRow, nextIndex: j + 1 };
    }

    // Crop is within the allowed 25% — accept it. Width is set to
    // *exactly* the remaining space (no floor/clamping here), so the
    // row always lands precisely on the container's right edge.
    row.push({ ...it, displayWidth: remaining, displayHeight: rowHeight, aspect });
    j++;
    return { row, nextIndex: j };
  }

  // Ran out of images before the row filled up — last row of the
  // gallery, left at natural size.
  return { row, nextIndex: j };
}

function packIntoRows(items, containerWidth) {
  const rows = [];
  let i = 0;

  while (i < items.length) {
    const { row, nextIndex } = packRow(items, i, containerWidth);
    rows.push(row);
    i = nextIndex;
  }

  return rows;
}

function renderGallery(container, items, openLightbox) {
  container.innerHTML = "";
  // container is the padding-free .gallery-inner wrapper, so its
  // clientWidth is exactly the available width — no padding math needed.
  const rows = packIntoRows(items, container.clientWidth);

  rows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "gallery-row";

    row.forEach((it) => {
      const itemEl = document.createElement("button");
      itemEl.type = "button";
      itemEl.className = "gallery-item";
      itemEl.style.width = `${it.displayWidth}px`;
      itemEl.style.height = `${it.displayHeight}px`;
      itemEl.setAttribute("aria-label", `${it.title} — ${it.subtitle}`);

      const img = document.createElement("img");
      img.src = it.src;
      img.alt = it.title;
      img.loading = "lazy";
      itemEl.appendChild(img);

      const overlay = document.createElement("span");
      overlay.className = "gallery-item__overlay";
      overlay.innerHTML = `<span class="gallery-item__title">${it.title}</span><span class="gallery-item__subtitle">${it.subtitle}</span>`;
      itemEl.appendChild(overlay);

      itemEl.addEventListener("click", () => openLightbox(it.__index));

      rowEl.appendChild(itemEl);
    });

    container.appendChild(rowEl);
  });
}

function initLightbox(items) {
  const lb = document.getElementById("lightbox");
  if (!lb) return () => {};

  const imgEl = lb.querySelector(".lightbox__img");
  const titleEl = lb.querySelector(".lightbox__title");
  const subtitleEl = lb.querySelector(".lightbox__subtitle");
  const closeBtn = lb.querySelector(".lightbox__close");
  const prevBtn = lb.querySelector(".lightbox__nav--prev");
  const nextBtn = lb.querySelector(".lightbox__nav--next");

  let currentIndex = 0;

  function show(index) {
    currentIndex = (index + items.length) % items.length;
    const it = items[currentIndex];
    imgEl.src = it.src;
    imgEl.alt = it.title;
    titleEl.textContent = it.title;
    subtitleEl.textContent = it.subtitle;
  }

  function open(index) {
    show(index);
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(currentIndex - 1));
  nextBtn.addEventListener("click", () => show(currentIndex + 1));

  // Click on the dark backdrop (not the image/caption) closes it.
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(currentIndex - 1);
    if (e.key === "ArrowRight") show(currentIndex + 1);
  });

  return open;
}

(async function initGallery() {
  const container = document.getElementById("galleryInner");
  if (!container) return;

  const loaded = (await Promise.all(GALLERY_ITEMS.map(loadImageMeta))).filter(Boolean);
  loaded.forEach((it, i) => (it.__index = i));
  if (!loaded.length) return;

  const openLightbox = initLightbox(loaded);
  renderGallery(container, loaded, openLightbox);

  // Inserting all these rows can add enough page height to introduce
  // (or remove) the vertical scrollbar — which changes the viewport's
  // true available width *after* the first measurement was already
  // taken. Re-measuring and re-packing once more, right after that
  // layout settles, corrects for it (this is what was causing the
  // right-hand padding to come out narrower than the left).
  requestAnimationFrame(() => {
    renderGallery(container, loaded, openLightbox);
  });

  // Re-pack rows on resize — row heights/widths depend on container width.
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderGallery(container, loaded, openLightbox), 150);
  });
})();

// ---- 5. Contact form ---------------------------------------------
// Sends the message by email to the address in ENDPOINT through
// FormSubmit (a form-to-email service, so no server code is needed).
// The first message ever sent triggers an activation email to that
// inbox; click its confirm link once and every later message arrives.
(function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const ENDPOINT = "https://formsubmit.co/ajax/ionpeia.art@gmail.com";
  const statusEl = document.getElementById("contactStatus");
  const submitBtn = form.querySelector(".contact-form__submit");
  const submitLabel = submitBtn.textContent;

  function setStatus(message, kind) {
    statusEl.textContent = message;
    statusEl.className = "contact-form__status" + (kind ? " is-" + kind : "");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);

    // Spam trap: a person never sees this field, so a filled one means a bot.
    if (data.get("_honey")) {
      setStatus("Thank you. Your message is on its way.", "success");
      form.reset();
      return;
    }

    const name = String(data.get("name")).trim();
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    setStatus("", "");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name,
          email: String(data.get("email")).trim(),
          message: String(data.get("message")).trim(),
          _subject: "New message from " + name + " via ionpeia.com",
          _template: "table",
          _captcha: "false",
        }),
      });
      const result = await response.json().catch(() => ({}));
      const ok = result.success === true || result.success === "true";
      if (!response.ok || !ok) throw new Error(result.message || "Request failed");

      setStatus("Thank you. Your message is on its way.", "success");
      form.reset();
    } catch (err) {
      setStatus("The message could not be sent. Please try again, or write to ionpeia.art@gmail.com directly.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });
})();

// ---- 6. Footer year ---------------------------------------------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

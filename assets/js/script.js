(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let toastTimer;

  /* ---------- Toast ---------- */
  const toast = $("#toast");
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  /* ---------- Theme + accent ---------- */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");
  const accentToggle = $("#accentToggle");
  const accents = ["crimson", "violet", "emerald"];

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("ag-theme", next); } catch (_) {}
      showToast(next === "dark" ? "Dark mode on" : "Light mode on");
    });
  }
  if (accentToggle) {
    accentToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-accent") || "crimson";
      const next = accents[(accents.indexOf(current) + 1) % accents.length];
      root.setAttribute("data-accent", next);
      try { localStorage.setItem("ag-accent", next); } catch (_) {}
      showToast("Accent: " + next);
    });
  }

  /* ---------- Mobile menu ---------- */
  const menuToggle = $("#menuToggle");
  const nav = $("#nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("a", nav).forEach((link) => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }));
  }

  /* ---------- Active nav ---------- */
  const navLinks = $$(".nav a");
  const sections = $$("main section[id]");
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Counters ---------- */
  const statList = $(".hero-stats");
  if (statList) {
    const runCounters = () => $$("[data-count]", statList).forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = Number(el.dataset.decimals || 0);
      const suffix = el.dataset.suffix || "";
      if (reducedMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
      const start = performance.now();
      const dur = 1300;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    if ("IntersectionObserver" in window) {
      const cObs = new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { runCounters(); obs.disconnect(); }
      }, { threshold: 0.4 });
      cObs.observe(statList);
    } else runCounters();
  }

  /* ---------- Result bars ---------- */
  const bars = $("#resultBars");
  if (bars) {
    const fillBars = () => $$(".bar-fill", bars).forEach((bar, i) => {
      setTimeout(() => { bar.style.width = bar.dataset.width + "%"; }, reducedMotion ? 0 : i * 160);
    });
    if ("IntersectionObserver" in window) {
      const bObs = new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { fillBars(); obs.disconnect(); }
      }, { threshold: 0.35 });
      bObs.observe(bars);
    } else fillBars();
  }

  /* ---------- Generic modal helper ---------- */
  let lastFocused = null;
  function bindModal(modal, openBtn, frameSelector, pdfPath) {
    if (!modal) return null;
    const closeBtn = $(".modal-close", modal);
    const frame = frameSelector ? $(frameSelector, modal) : null;

    const open = () => {
      if (!modal.hidden) return;
      lastFocused = document.activeElement;
      if (frame && frame.getAttribute("src") !== pdfPath) frame.setAttribute("src", pdfPath);
      modal.hidden = false;
      void modal.offsetWidth;
      document.body.classList.add("modal-open");
      modal.classList.add("open");
      setTimeout(() => closeBtn && closeBtn.focus(), 120);
    };
    const close = () => {
      if (modal.hidden) return;
      modal.classList.remove("open");
      document.body.classList.remove("modal-open");
      setTimeout(() => {
        modal.hidden = true;
        if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
      }, 350);
    };

    if (openBtn) openBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    $$("[data-close-paper]", modal).forEach((el) => el.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    return { open, close };
  }

  bindModal($("#paperModal"), $("#openPaper"), "#paperFrame", "assets/SemanticGuard-Research-IEEE.pdf");

  /* ---------- Copy email ---------- */
  const copyBtn = $("#copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = "abhinavgireesh013@gmail.com";
      try { await navigator.clipboard.writeText(email); showToast("Email copied ✓"); }
      catch (_) { showToast("Copy failed — select the email manually"); }
    });
  }

  /* ---------- Contact form → mailto ---------- */
  const form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent(String(data.get("subject") || "Portfolio enquiry"));
      const body = encodeURIComponent(
        "Name: " + data.get("name") + "\nEmail: " + data.get("email") + "\n\n" + data.get("message")
      );
      window.location.href = "mailto:abhinavgireesh013@gmail.com?subject=" + subject + "&body=" + body;
      showToast("Opening your email app...");
    });
  }

  /* ---------- Back to top ---------- */
  const backToTop = $("#backToTop");
  if (backToTop) {
    window.addEventListener("scroll", () => backToTop.classList.toggle("show", window.scrollY > 700), { passive: true });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
  }

  /* ---------- Footer year ---------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

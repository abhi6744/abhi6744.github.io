/* =========================================================
   Abhinav G — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let toastTimer;

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");
  const savedTheme = localStorage.getItem("ag-theme");
  if (savedTheme === "dark") root.setAttribute("data-theme", "dark");

  themeToggle.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    root.setAttribute("data-theme", isDark ? "light" : "dark");
    localStorage.setItem("ag-theme", isDark ? "light" : "dark");
    showToast(isDark ? "Light theme enabled" : "Dark theme enabled");
  });

  /* ---------- Mobile menu ---------- */
  const menuToggle = $("#menuToggle");
  const nav = $("#nav");

  function closeMenu() {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  $$(".nav a").forEach((link) => link.addEventListener("click", closeMenu));

  /* ---------- Dropdown ---------- */
  const dropdown = $(".nav-dropdown");
  const dropdownTrigger = $(".dropdown-trigger");
  dropdownTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle("open");
    dropdownTrigger.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
      dropdownTrigger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Header shadow, scroll progress, back to top, scroll spy ---------- */
  const header = $("#header");
  const progress = $("#scrollProgress");
  const backToTop = $("#backToTop");
  const sections = $$("main section[id]");
  const navLinks = $$(".nav a[href^='#']");

  function onScroll() {
    const y = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 10);
    progress.style.width = (docHeight > 0 ? (y / docHeight) * 100 : 0) + "%";
    backToTop.classList.toggle("visible", y > 500);

    let current = "";
    sections.forEach((section) => {
      const top = section.getBoundingClientRect().top;
      if (top <= 130) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
    onScroll();
  });
  onScroll();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  /* ---------- Scroll-driven story (CRED-style disclosure) ---------- */
  const storyTrack = $("#storyTrack");
  if (storyTrack) {
    const steps = $$(".story-step", storyTrack);
    const dots = $$(".story-dot", storyTrack);
    const storyBar = $("#storyProgress");
    let activeStep = -1;

    function updateStory() {
      const rect = storyTrack.getBoundingClientRect();
      const total = Math.max(storyTrack.offsetHeight - window.innerHeight, 1);
      const progress = Math.max(0, Math.min(1, -rect.top / total));
      if (storyBar) storyBar.style.width = (progress * 100) + "%";

      const index = Math.min(steps.length - 1, Math.floor(progress * steps.length));
      if (index !== activeStep) {
        activeStep = index;
        steps.forEach((step, i) => step.classList.toggle("active", i === index));
        dots.forEach((dot, i) => {
          dot.classList.toggle("active", i === index);
          dot.setAttribute("aria-current", String(i === index));
        });
      }
    }

    window.addEventListener("scroll", updateStory, { passive: true });
    window.addEventListener("resize", updateStory);
    updateStory();

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const i = Number(dot.dataset.goto);
        const total = Math.max(storyTrack.offsetHeight - window.innerHeight, 1);
        window.scrollTo({
          top: storyTrack.offsetTop + (total * (i + 0.5)) / steps.length,
          behavior: reducedMotion ? "auto" : "smooth"
        });
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Animated stat counters ---------- */
  const stats = $$("#statsRow .stat strong");
  function animateCounters() {
    stats.forEach((el) => {
      const target = parseFloat(el.dataset.count || "0");
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const suffix = el.dataset.suffix || "";
      if (reducedMotion) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }
      const start = performance.now();
      const duration = 1400;
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  if ("IntersectionObserver" in window) {
    const statObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounters();
        statObs.disconnect();
      }
    }, { threshold: 0.4 });
    statObs.observe($("#statsRow"));
  } else {
    animateCounters();
  }

  /* ---------- Typing effect ---------- */
  const typed = $("#typed");
  const phrases = [
    "intelligent AI systems.",
    "grounded RAG pipelines.",
    "explainable vision models.",
    "real-time anomaly detectors."
  ];
  if (typed) {
    if (reducedMotion) {
      typed.textContent = phrases[0];
    } else {
      let phraseIndex = 0, charIndex = 0, deleting = false;
      function typeLoop() {
        const phrase = phrases[phraseIndex];
        if (!deleting) {
          charIndex++;
          typed.textContent = phrase.slice(0, charIndex);
          if (charIndex === phrase.length) {
            deleting = true;
            return setTimeout(typeLoop, 1900);
          }
        } else {
          charIndex--;
          typed.textContent = phrase.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
          }
        }
        setTimeout(typeLoop, deleting ? 40 : 75);
      }
      setTimeout(typeLoop, 500);
    }
  }

  /* ---------- Taped parcel + résumé popup ---------- */
  const resumeModal = $("#resumeModal");
  const modalClose = $("#modalClose");
  let lastFocused = null;

  function openResumeModal() {
    if (!resumeModal || !resumeModal.hidden) return;
    lastFocused = document.activeElement;
    resumeModal.hidden = false;
    void resumeModal.offsetWidth;
    document.body.classList.add("modal-open");
    resumeModal.classList.add("open");
    setTimeout(() => modalClose && modalClose.focus(), 120);
  }
  function closeResumeModal() {
    if (!resumeModal || resumeModal.hidden) return;
    resumeModal.classList.remove("open");
    document.body.classList.remove("modal-open");
    setTimeout(() => {
      resumeModal.hidden = true;
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }, 350);
  }
  if (resumeModal) {
    modalClose.addEventListener("click", closeResumeModal);
    $$("[data-close-modal]", resumeModal).forEach((el) => el.addEventListener("click", closeResumeModal));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeResumeModal(); });
  }

  const unlockTrack = $("#unlockTrack");
  if (unlockTrack) {
    const parcel = $("#parcel");
    const parcelBox = $("#parcelBox");
    const knot = $("#knot");
    const unlockBar = $("#unlockProgress");
    const unlockPercent = $("#unlockPercent");
    const vaultStatus = $("#vaultStatus");
    const unlockedActions = $("#unlockedActions");
    const reopenBtn = $("#reopenResume");
    const hapticToggle = $("#hapticToggle");
    const canVibrate = "vibrate" in navigator && !reducedMotion;
    let unlocked = false;
    let hapticsArmed = false;
    let lastTick = -1;
    let lastLabel = "";

    // Browsers only allow vibration after a real user gesture, so arm it with a tap.
    if (hapticToggle && canVibrate) {
      hapticToggle.hidden = false;
      hapticToggle.addEventListener("click", () => {
        hapticsArmed = true;
        hapticToggle.classList.add("on");
        hapticToggle.textContent = "📳 Haptics on — feel each pull";
        try { navigator.vibrate(14); } catch (_) { /* unsupported */ }
      });
    }
    if (reopenBtn) reopenBtn.addEventListener("click", openResumeModal);

    function hapticTick(step) {
      if (reducedMotion) return;
      if (knot) {
        knot.classList.remove("tick");
        void knot.offsetWidth;
        knot.classList.add("tick");
      }
      if (canVibrate && hapticsArmed) {
        try { navigator.vibrate(step % 3 === 2 ? [12, 26, 14] : 9); } catch (_) { /* not permitted */ }
      }
    }

    function updateUnlock() {
      if (unlocked) return;
      const rect = unlockTrack.getBoundingClientRect();
      const total = Math.max(unlockTrack.offsetHeight - window.innerHeight, 1);
      const p = Math.max(0, Math.min(1, -rect.top / total));
      const value = Math.round(p * 100);
      const clamp = (v) => Math.max(0, Math.min(1, v));
      const smooth = (v) => v * v * (3 - 2 * v);

      // staged motion: bow loosens first, then rope slips free
      parcel.style.setProperty("--p", p.toFixed(3));
      parcel.style.setProperty("--knot", smooth(clamp((p - 0.04) / 0.60)).toFixed(3));
      parcel.style.setProperty("--slip", smooth(clamp((p - 0.45) / 0.55)).toFixed(3));
      unlockBar.style.width = value + "%";
      unlockPercent.textContent = value + "% untied";
      parcelBox.classList.toggle("shaking", p > 0.08 && p < 0.96);

      const step = Math.floor(p * 12);
      if (step > 0 && p < 1 && step !== lastTick) {
        lastTick = step;
        hapticTick(step);
      }

      const label = p < 0.16 ? "Sealed shut"
        : p < 0.45 ? "Loosening the knot..."
        : p < 0.80 ? "Pulling the rope free..."
        : "Almost free...";
      if (label !== lastLabel && vaultStatus) {
        lastLabel = label;
        vaultStatus.textContent = label;
      }

      if (p >= 0.985) {
        unlocked = true;
        parcelBox.classList.remove("shaking");
        if (canVibrate && hapticsArmed) { try { navigator.vibrate([18, 40, 26]); } catch (_) {} }
        parcel.classList.add("unlocked");
        unlockedActions.hidden = false;
        vaultStatus.textContent = "Unsealed";
        showToast("Résumé unsealed 🔓");
        openResumeModal();
      }
    }

    window.addEventListener("scroll", updateUnlock, { passive: true });
    window.addEventListener("resize", updateUnlock);
    updateUnlock();
  }

  /* ---------- Project filters ---------- */
  const filterBtns = $$(".filter-btn");
  const projectCards = $$(".project-card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
      projectCards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !show);
        if (show && !reducedMotion) {
          card.style.opacity = "0";
          card.style.transform = "translateY(12px)";
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.opacity = "";
              card.style.transform = "";
            });
          });
        }
      });
    });
  });

  /* ---------- Expandable project details ---------- */
  $$(".details-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".project-card");
      const details = $(".project-details", card);
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      details.hidden = expanded;
      if (btn.firstChild) btn.firstChild.textContent = expanded ? "Details " : "Hide details ";
    });
  });

  /* ---------- Skill tabs ---------- */
  const skillTabs = $$(".skill-tab");
  const skillPanels = $$(".skill-panel");
  skillTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      skillTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", String(active));
      });
      skillPanels.forEach((panel) => {
        const active = panel.id === tab.dataset.tab;
        panel.classList.toggle("active", active);
        panel.hidden = !active;
        if (active && !reducedMotion) {
          $$(".skill-chip", panel).forEach((chip, i) => {
            chip.style.animation = "none";
            void chip.offsetWidth;
            chip.style.animation = `chipIn .35s ease ${i * 25}ms both`;
          });
        }
      });
    });
  });

  /* ---------- Usage bars ---------- */
  const bars = $$(".bar-fill");
  function fillBars() { bars.forEach((bar) => { bar.style.width = bar.dataset.width + "%"; }); }
  if ("IntersectionObserver" in window) {
    const barObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { fillBars(); barObs.disconnect(); }
    }, { threshold: 0.3 });
    barObs.observe($(".usage-panel"));
  } else {
    fillBars();
  }

  /* ---------- Copy email ---------- */
  $("#copyEmail").addEventListener("click", async () => {
    const email = "abhinavgireesh013@gmail.com";
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const temp = document.createElement("textarea");
        temp.value = email;
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }
      showToast("Email address copied ✓");
    } catch (err) {
      showToast("Copy failed — please select the email manually");
    }
  });

  /* ---------- Contact form → mailto ---------- */
  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const subject = data.get("subject") || "Hello from your portfolio";
    const body =
      "Hi Abhinav,\n\n" + data.get("message") + "\n\n" +
      "— " + data.get("name") + "\n" + data.get("email");
    window.location.href = "mailto:abhinavgireesh013@gmail.com?subject=" +
      encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    showToast("Opening your email app...");
  });

  /* ---------- Toast + year ---------- */
  function showToast(msg) {
    const toast = $("#toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }
  $("#year").textContent = new Date().getFullYear();
})();

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const prefersDark =
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? true;

  const THEME_KEY = "sallysong.theme";
  const LANG_KEY = "sallysong.lang";
  const html = document.documentElement;

  function getSavedTheme() {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark") return v;
    return null;
  }

  function setTheme(theme) {
    if (!theme) {
      html.removeAttribute("data-theme");
      localStorage.removeItem(THEME_KEY);
      return;
    }
    html.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function applyInitialTheme() {
    const saved = getSavedTheme();
    if (saved) setTheme(saved);
    else setTheme(prefersDark ? "dark" : "light");
  }

  applyInitialTheme();

  function getSavedLang() {
    const v = localStorage.getItem(LANG_KEY);
    return v === "en" || v === "zh" ? v : null;
  }

  function setLang(lang) {
    const value = lang === "en" ? "en" : "zh";
    html.dataset.lang = value;
    localStorage.setItem(LANG_KEY, value);
  }

  const I18N = {
    zh: {
      "home-hero-title": "线条、像素点<br />和日常里的山脉",
      "home-hero-subtitle": "一个安静的入口，通往作品、文字、小店和写给你的信。",
      "portfolio-title": "图像与作品",
      "portfolio-subtitle":
        "这里会放你的系列作品、展览项目与视觉实验。现在是占位布局，等你把真实图片给我，我们再一起把每一张都接好链接与说明。",
      "writing-title": "文字与片段",
      "writing-subtitle":
        "不一定是长文章，也可以是一两句想法、一个还没完整成型的句子，或者只属于当下的心情记录。",
      "shop-title": "小店与印刷物",
      "shop-subtitle":
        "这里可以放你的作品周边：例如明信片、海报、画册、数字壁纸等。现在先用占位卡片替代，之后可以接入真实购买链接。",
      "contact-title": "写信给 Sally",
      "contact-subtitle":
        "无论是合作、展览、工作机会，还是单纯想聊聊创作与生活，都可以从这里开始。",
    },
    en: {
      "home-hero-title": "Lines, dots,<br />and everyday mountains",
      "home-hero-subtitle":
        "A quiet entrance into images, words, a small shop, and letters written to you.",
      "portfolio-title": "Images & Works",
      "portfolio-subtitle":
        "Here you’ll eventually find series, exhibitions, and visual experiments. For now, these blocks are placeholders waiting for your real projects.",
      "writing-title": "Words & Fragments",
      "writing-subtitle":
        "Not only long essays, but also short notes, unfinished sentences, and small records of how a day feels.",
      "shop-title": "Shop & Editions",
      "shop-subtitle":
        "Posters, postcards, zines or digital wallpapers – a small place for things that can travel with you.",
      "contact-title": "Write to Sally",
      "contact-subtitle":
        "For collaborations, exhibitions, work, or simply a conversation about making and living.",
    },
  };

  function applyLang(lang) {
    const value = lang === "en" ? "en" : "zh";
    setLang(value);

    const dict = I18N[value];
    if (dict) {
      $("[data-i18n-key]") &&
        $$("[data-i18n-key]").forEach((el) => {
          const key = el.getAttribute("data-i18n-key");
          if (!key) return;
          const msg = dict[key];
          if (!msg) return;
          el.innerHTML = msg;
        });
    }

    const modeBtn = $("[data-mode-toggle]");
    if (modeBtn) {
      const labelSpan = modeBtn.querySelector(".mode-toggle-text");
      if (labelSpan) labelSpan.textContent = value === "zh" ? "En" : "Ch";
      modeBtn.setAttribute("aria-label", value === "zh" ? "Switch to English" : "切换到中文");
    }
  }

  const initialLang = getSavedLang() || "zh";
  applyLang(initialLang);

  const modeBtn = $("[data-mode-toggle]");
  if (modeBtn) {
    modeBtn.addEventListener("click", () => {
      const current = html.dataset.lang === "en" ? "en" : "zh";
      const next = current === "zh" ? "en" : "zh";
      applyLang(next);
    });
  }

  // Mobile nav
  const navToggle = $(".nav-toggle");
  const navPanel = $("#nav-panel");

  function setNavOpen(open) {
    if (!navToggle || !navPanel) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navPanel.dataset.open = open ? "true" : "false";
  }

  if (navToggle && navPanel) {
    setNavOpen(false);

    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      setNavOpen(!open);
    });

    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const isInside = navPanel.contains(t) || navToggle.contains(t);
      if (!isInside) setNavOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });

    $$(".nav-link", navPanel).forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href") || "";
        if (!href.startsWith("#")) return;
        const target = $(href);
        if (!target) return;
        e.preventDefault();
        setNavOpen(false);
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        history.pushState(null, "", href);
      });
    });
  }

  // Active nav highlight
  const sectionIds = ["#about", "#projects", "#contact"];
  const navLinks = $$(".nav-panel .nav-link").filter((a) => sectionIds.includes(a.getAttribute("href") || ""));

  function setCurrent(hash) {
    navLinks.forEach((a) => {
      const active = (a.getAttribute("href") || "") === hash;
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (!visible?.target?.id) return;
        setCurrent(`#${visible.target.id}`);
      },
      { root: null, threshold: [0.2, 0.35, 0.5], rootMargin: "-20% 0px -55% 0px" }
    );

    sectionIds
      .map((id) => $(id))
      .filter(Boolean)
      .forEach((el) => observer.observe(el));
  } else {
    setCurrent(location.hash || "#about");
  }

  // Copy email
  const copyBtn = $("[data-copy-email]");
  const emailEl = $("[data-email]");
  if (copyBtn && emailEl) {
    copyBtn.addEventListener("click", async () => {
      const email = emailEl.textContent?.trim() || "";
      if (!email) return;
      const original = copyBtn.textContent;
      try {
        await navigator.clipboard.writeText(email);
        copyBtn.textContent = "已复制";
      } catch {
        copyBtn.textContent = "复制失败";
      } finally {
        window.setTimeout(() => {
          copyBtn.textContent = original || "复制";
        }, 1200);
      }
    });
  }

  // Contact form demo
  const form = $("[data-contact-form]");
  const statusEl = $("[data-form-status]");
  if (form && statusEl) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const message = String(fd.get("message") || "").trim();

      if (!name || !email || !message) {
        statusEl.textContent = "请把表单填完整。";
        return;
      }

      statusEl.textContent = "已收到（示例）：我会尽快回复你。";
      form.reset();
    });
  }

  // Footer year
  const year = $("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  // ===== Canvas: dot-only multi-wave groups + denser lines + stronger mouse influence =====
  const canvas = $(".mountain-canvas");
  if (canvas && canvas instanceof HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      let width = 0;
      let height = 0;
      let devicePixelRatio = 1;

      let mouseX = 0.5;
      let mouseY = 0.5;
      let lastPointerAt = performance.now();

      let lastTime = 0;

      // performance scaling (mobile tends to need fewer points)
      const isCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
      const perfScale = isCoarsePointer ? 0.72 : 1; // lower = fewer points/particles

      function resize() {
        const rect = canvas.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        devicePixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.max(1, Math.floor(width * devicePixelRatio));
        canvas.height = Math.max(1, Math.floor(height * devicePixelRatio));

        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

        // dot rendering: keep edges crisp-ish across engines
        ctx.imageSmoothingEnabled = false;
      }

      // Some lines are denser via smaller step
      const lines = [
        // Top group (3)
        { offset: 0.22, amp: 30, freq: 1.0, step: 8, baseSize: 3.4, jitterSize: 1.2 },
        { offset: 0.25, amp: 34, freq: 1.15, step: 5, baseSize: 4.0, jitterSize: 1.6 }, // denser
        { offset: 0.28, amp: 36, freq: 1.3, step: 8, baseSize: 3.4, jitterSize: 1.2 },

        // Mid group (2)
        { offset: 0.40, amp: 40, freq: 1.6, step: 6, baseSize: 4.1, jitterSize: 1.6 }, // denser
        { offset: 0.44, amp: 42, freq: 1.8, step: 9, baseSize: 3.2, jitterSize: 1.1 },

        // Lower-mid group (4)
        { offset: 0.56, amp: 40, freq: 1.7, step: 6, baseSize: 4.0, jitterSize: 1.6 }, // denser
        { offset: 0.59, amp: 42, freq: 1.9, step: 9, baseSize: 3.1, jitterSize: 1.1 },
        { offset: 0.62, amp: 40, freq: 2.1, step: 5, baseSize: 4.0, jitterSize: 1.7 }, // densest
        { offset: 0.65, amp: 38, freq: 1.85, step: 9, baseSize: 3.0, jitterSize: 1.1 },

        // Bottom group (2)
        { offset: 0.78, amp: 28, freq: 1.1, step: 6, baseSize: 4.0, jitterSize: 1.5 },
        { offset: 0.82, amp: 26, freq: 0.95, step: 10, baseSize: 2.8, jitterSize: 1.0 },
      ];

      // Uniform “bigger swell” baseline
      lines.forEach((l) => (l.amp *= 1.25));

      // DPR compensation: prevent super-thick look on high-DPR devices
      function dprComp(v) {
        const dpr = devicePixelRatio || 1;
        return v * (1 / Math.min(2, dpr));
      }

      function clamp01(x) {
        return Math.max(0, Math.min(1, x));
      }

      function smoothstep01(x) {
        const t = clamp01(x);
        return t * t * (3 - 2 * t);
      }

      function localInfluence(x, yRef) {
        const mx = mouseX * width;
        const my = mouseY * height;
        const dx = x - mx;
        const dy = (yRef ?? my) - my;

        // larger radius for more obvious interaction
        const R = 220;
        const dist = Math.hypot(dx, dy);

        // smooth falloff (0..1)
        return 1 - smoothstep01(dist / R);
      }

      // -------- Particles (floating near lines) --------
      const particles = [];
      let PARTICLE_COUNT = Math.floor(150 * perfScale);

      function initParticles() {
        particles.length = 0;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.push({
            x: Math.random() * (width || 1),
            lineIndex: Math.floor(Math.random() * lines.length),
            phase: Math.random() * Math.PI * 2,
            drift: 6 + Math.random() * 18,
            speed: 18 + Math.random() * 55, // pixels/sec baseline
            size: 1.2 + Math.random() * 2.0,
          });
        }
      }

      // y position on a given line at x (used by particles + line dots)
      function yAt(line, x, tSec) {
        const { offset, amp, freq } = line;
        const baseY = height * offset;
        const ratio = x / (width || 1);

        // Big swell + fast jitter + livelier noise
        const noiseScale = 3.0 + mouseX * 6.2;

        const swell =
          Math.sin(ratio * Math.PI * (freq * 0.62) + tSec * 1.35 + mouseX * 1.2) *
          (amp * 1.08 * (0.6 + 0.4 * Math.cos(ratio * Math.PI)));

        const jitter =
          Math.sin(ratio * Math.PI * (freq * 3.6) + tSec * 6.8 + offset * 3.2) *
          (amp * 0.22);

        const noise =
          Math.sin(ratio * 10 + tSec * 1.3 + offset * 5) * noiseScale * 0.4;

        // Stronger mouse warp (local)
        const inf = localInfluence(x, baseY);
        const warp = inf * Math.sin(tSec * 9.5 + ratio * 12) * (amp * 0.46);

        // Extra “bend toward pointer” (more obvious)
        const bend = inf * Math.sin(tSec * 3.2 + ratio * 7.2) * (amp * 0.18);

        return baseY + swell + jitter + noise + warp + bend;
      }

      // Draw a line as DOTS ONLY (no ctx.stroke)
      function drawDotLine(line, tSec, dtSec) {
        const segments = Math.floor(260 * perfScale);
        const step = Math.max(3, Math.floor((line.step || 8) / perfScale));

        for (let i = 0; i <= segments; i += step) {
          const ratio = i / segments;
          const x = ratio * width;

          const y = yAt(line, x, tSec);

          // stronger local influence: size/alpha/extra jitter
          const inf = localInfluence(x, y);

          // dot size (DPR-compensated)
          const base = dprComp(line.baseSize ?? 3.2);
          const jitterSize = dprComp(line.jitterSize ?? 1.2);

          // time-based micro “breathing”
          const breath = (Math.sin(tSec * 4.2 + ratio * 18 + line.offset * 9) + 1) * 0.5;

          // mouse makes dots larger and more present
          const size = base + breath * jitterSize + inf * dprComp(2.6);

          // extra positional jitter near mouse (more obvious interaction)
          const wobble =
            inf *
            Math.sin(tSec * 10.5 + ratio * 22 + line.freq * 2) *
            dprComp(3.2);

          // slightly offset forward to imply motion (subtle)
          const y2 = y + wobble - dprComp(2.0);

          // alpha increases near mouse; overall tuned by perf
          const a = 0.18 + inf * 0.50;
          ctx.fillStyle = `rgba(0,0,0,${a})`;

          ctx.fillRect(x - size / 2, y2 - size / 2, size, size);

          // Optional: tiny “secondary dot” on denser lines (adds richness without stroke)
          // only on lines with small step
          if (step <= 6 && (i % (step * 2) === 0)) {
            const s2 = size * 0.55;
            const a2 = (0.10 + inf * 0.25) * 0.9;
            ctx.fillStyle = `rgba(0,0,0,${a2})`;
            ctx.fillRect(x - s2 / 2, y2 + dprComp(3.4) - s2 / 2, s2, s2);
          }
        }
      }

      function drawParticles(tSec, dtSec) {
        ctx.save();
        ctx.globalAlpha = 0.8;

        for (const p of particles) {
          // Move using dt (consistent across 60/120Hz)
          p.x += p.speed * dtSec;
          if (p.x > width + 30) p.x = -30;

          const line = lines[p.lineIndex];
          const centerY = yAt(line, p.x, tSec);

          // Local mouse influence around particle
          const inf = localInfluence(p.x, centerY);

          // Float around the line
          p.phase += (1.1 + (p.speed / 80) * 0.25) * dtSec;
          const floatY = Math.sin(p.phase + p.x * 0.012) * p.drift;

          // Mouse energizes particles more
          const y = centerY + floatY + inf * Math.sin(tSec * 10 + p.phase) * 14;

          const base = dprComp(p.size);
          const s = base + inf * dprComp(2.0);
          const a = 0.12 + inf * 0.55;

          ctx.fillStyle = `rgba(0,0,0,${a})`;
          ctx.fillRect(p.x - s / 2, y - s / 2, s, s);
        }

        ctx.restore();
      }

      function loop(timestamp) {
        const tSec = timestamp / 1000;
        const dtSec = Math.min(0.05, (timestamp - (lastTime || timestamp)) / 1000);
        lastTime = timestamp;

        // Mobile/idle: animate a virtual pointer so it doesn’t “freeze” without hover
        if (timestamp - lastPointerAt > 1600) {
          mouseX = 0.5 + 0.18 * Math.sin(timestamp * 0.00035);
          mouseY = 0.5 + 0.12 * Math.cos(timestamp * 0.00028);
        }

        ctx.clearRect(0, 0, width, height);

        // Draw dot lines
        ctx.save();
        ctx.globalAlpha = 0.55;
        for (const line of lines) drawDotLine(line, tSec, dtSec);
        ctx.restore();

        // Floating particles near lines
        drawParticles(tSec, dtSec);

        requestAnimationFrame(loop);
      }

      resize();
      initParticles();

      window.addEventListener("resize", () => {
        resize();
        PARTICLE_COUNT = Math.floor(150 * perfScale);
        initParticles();
      });

      window.addEventListener("pointermove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / (rect.width || 1);
        mouseY = (e.clientY - rect.top) / (rect.height || 1);
        mouseX = clamp01(mouseX);
        mouseY = clamp01(mouseY);
        lastPointerAt = performance.now();
      });

      requestAnimationFrame(loop);
    }
  }
})();

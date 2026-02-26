(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? true;

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
      if (labelSpan) {
        labelSpan.textContent = value === "zh" ? "En" : "Ch";
      }
      modeBtn.setAttribute(
        "aria-label",
        value === "zh" ? "Switch to English" : "切换到中文"
      );
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
  const navLinks = $$(".nav-panel .nav-link").filter((a) =>
    sectionIds.includes(a.getAttribute("href") || "")
  );

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

  // Home mountain canvas
  const canvas = $(".mountain-canvas");
  if (canvas && canvas instanceof HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      let width = 0;
      let height = 0;
      let devicePixelRatio = window.devicePixelRatio || 1;
      let mouseX = 0.5;
      let lastTime = 0;

      function resize() {
        const rect = canvas.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        ctx.imageSmoothingEnabled = true;
      }

      const lines = [
        // 上方：三条较靠近
        { offset: 0.22, amp: 26, freq: 1.0, pixel: false },
        { offset: 0.25, amp: 28, freq: 1.15, pixel: true },
        { offset: 0.28, amp: 30, freq: 1.3, pixel: false },
        // 中部：两条交织
        { offset: 0.40, amp: 32, freq: 1.6, pixel: true },
        { offset: 0.44, amp: 34, freq: 1.8, pixel: false },
        // 中下：四条较密的组合
        { offset: 0.56, amp: 30, freq: 1.7, pixel: true },
        { offset: 0.59, amp: 32, freq: 1.9, pixel: false },
        { offset: 0.62, amp: 30, freq: 2.1, pixel: true },
        { offset: 0.65, amp: 28, freq: 1.85, pixel: false },
        // 底部：两条更平一点的线
        { offset: 0.78, amp: 22, freq: 1.1, pixel: true },
        { offset: 0.82, amp: 20, freq: 0.95, pixel: false },
      ];

      function drawLine(line, t) {
        const { offset, amp, freq, pixel } = line;
        const baseY = height * offset;
        const segments = 260;
        const noiseScale = 2 + mouseX * 4;
        const timeOffset = t * 0.0006;

        ctx.lineWidth = 0.4;
        ctx.strokeStyle = "rgba(0,0,0,0.55)";

        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const ratio = i / segments;
          const x = ratio * width;
          const wave =
            Math.sin(ratio * Math.PI * freq + timeOffset * 2.4 + mouseX * 1.6) *
            (amp * 0.95 * (0.6 + 0.4 * Math.cos(ratio * Math.PI)));
          const noise =
            Math.sin(ratio * 10 + timeOffset * 1.3 + offset * 5) * noiseScale * 0.4;
          const y = baseY + wave + noise;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        if (pixel) {
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          const step = 6;
          for (let i = 0; i <= segments; i += step) {
            const ratio = i / segments;
            const x = ratio * width;
            const wave =
              Math.sin(ratio * Math.PI * freq + timeOffset * 3 + mouseX * 2) *
              (amp * (0.6 + 0.4 * Math.cos(ratio * Math.PI)));
            const noise =
              Math.sin(ratio * 10 + timeOffset * 1.3 + offset * 5) * noiseScale * 0.4;
            const yOnLine = baseY + wave + noise;
            const offsetForward = 6;
            const y = yOnLine - offsetForward;
            const baseSize = 3;
            const size = baseSize + (Math.sin(ratio * 20 + offset * 10) + 1) * 1;
            const px = x - size / 2;
            const py = y - size / 2;
            ctx.fillRect(px, py, size, size);
          }
        }
      }

      function loop(timestamp) {
        const dt = timestamp - lastTime;
        lastTime = timestamp;
        if (dt > 80) {
          lastTime = timestamp;
        }
        ctx.clearRect(0, 0, width, height);

        ctx.save();
        ctx.globalAlpha = 0.4;
        for (const line of lines) {
          drawLine(line, timestamp);
        }
        ctx.restore();

        requestAnimationFrame(loop);
      }

      resize();
      window.addEventListener("resize", resize);

      window.addEventListener("pointermove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / (rect.width || 1);
        mouseX = Math.max(0, Math.min(1, mouseX));
      });

      requestAnimationFrame(loop);
    }
  }
})();

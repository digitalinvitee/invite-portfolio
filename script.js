document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.querySelector(".topbar");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const navLinks = [...document.querySelectorAll(".nav a[href^='#']")];

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  }

  function updateActiveLink() {
    if (!sections.length) return;

    const current = sections
      .map((section) => ({
        section,
        distance: Math.abs(section.getBoundingClientRect().top - 120),
      }))
      .sort((a, b) => a.distance - b.distance)[0]?.section;

    navLinks.forEach((link) => {
      link.classList.toggle(
        "is-active",
        link.getAttribute("href") === `#${current?.id}`
      );
    });
  }

  function closeMenu() {
    body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    mobileNav?.setAttribute("aria-hidden", "true");
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNav?.setAttribute("aria-hidden", String(!isOpen));
  });

  document.querySelectorAll(".mobile-nav a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /* LANGUAGE SWITCH */

  const langButtons = document.querySelectorAll(".lang-btn");
  const translatableItems = document.querySelectorAll("[data-ka][data-en]");

  function setLanguage(lang) {
    translatableItems.forEach((item) => {
      item.textContent = item.dataset[lang];
    });

    langButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    document.documentElement.lang = lang;
    localStorage.setItem("invitePortfolioLang", lang);
  }

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.lang);
      closeMenu();
    });
  });

  const savedLang = localStorage.getItem("invitePortfolioLang") || "ka";
  setLanguage(savedLang);

  /* MOTION */

  const motionSelectors = [
    ".section-head",
    ".text-panel",
    ".matrix",
    ".feature-card",
    ".feature-list li",
    ".pill",
    ".audience-list li",
    ".project",
    ".conditions",
    ".contact-item",
    ".contact-panel",
  ];

  const motionItems = document.querySelectorAll(motionSelectors.join(", "));

  motionItems.forEach((item, index) => {
    item.setAttribute("data-motion", "fade-up");
    item.style.transitionDelay = `${Math.min(index * 28, 240)}ms`;
  });

  document.querySelectorAll(".project-media").forEach((item) => {
    item.setAttribute("data-motion", "scale");
  });

  if (!prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -70px 0px",
      }
    );

    document.querySelectorAll("[data-motion]").forEach((item) => {
      observer.observe(item);
    });
  } else {
    document.querySelectorAll("[data-motion]").forEach((item) => {
      item.classList.add("is-visible");
    });
  }

  document.querySelectorAll(".project-media, .text-panel").forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      item.style.setProperty("--mx", `${x}%`);
      item.style.setProperty("--my", `${y}%`);
    });
  });

  const glow = document.querySelector(".cursor-glow");

  if (
    glow &&
    !prefersReducedMotion &&
    window.matchMedia("(pointer: fine)").matches
  ) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      glow.style.opacity = "1";
    });

    function renderGlow() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      glow.style.transform = `translate3d(${currentX - 180}px, ${
        currentY - 180
      }px, 0)`;

      requestAnimationFrame(renderGlow);
    }

    renderGlow();
  }

  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach((item) => {
      item.addEventListener("pointermove", (event) => {
        const rect = item.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        item.style.transform = `translate3d(${x * 0.12}px, ${
          y * 0.18
        }px, 0)`;
      });

      item.addEventListener("pointerleave", () => {
        item.style.transform = "";
      });
    });
  }

  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.setAttribute("rel", "noopener noreferrer");
  });

  /* GOOGLE SHEETS CONTACT FORM */

  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  function setFormStatus(type, message) {
    if (!formStatus) return;

    formStatus.textContent = message;
    formStatus.classList.remove("is-success", "is-error", "is-loading");
    formStatus.classList.add(`is-${type}`);
  }

  if (contactForm) {
    const scriptURL =
      "https://script.google.com/macros/s/AKfycbypQ11omDaHcphIgSLeA8OKwIXCHeeilp-dUmfD7IqQmbllDV6D3DAR2jEJCKgACI6F/exec";

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitBtn = contactForm.querySelector(".submit-btn");
      const currentLang = document.documentElement.lang || "ka";
      const originalText = submitBtn
        ? submitBtn.textContent
        : currentLang === "en"
          ? "Send"
          : "გაგზავნა";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent =
          currentLang === "en" ? "Sending..." : "იგზავნება...";
      }

      setFormStatus(
        "loading",
        currentLang === "en" ? "Sending your request..." : "თქვენი მოთხოვნა იგზავნება..."
      );

      const data = {
        name: contactForm.name.value.trim(),
        email: contactForm.email.value.trim(),
        phone: contactForm.phone.value.trim(),
        projectType: contactForm.project_type.value,
        message: contactForm.message.value.trim(),
        language: currentLang,
      };

      try {
        await fetch(scriptURL, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(data),
        });

        setFormStatus(
          "success",
          currentLang === "en"
            ? "Your request has been received. We will contact you shortly."
            : "თქვენი მოთხოვნა მიღებულია. უმოკლეს დროში დაგიკავშირდებით."
        );

        contactForm.reset();

        if (submitBtn) {
          submitBtn.textContent = currentLang === "en" ? "Send" : "გაგზავნა";
        }
      } catch (error) {
        setFormStatus(
          "error",
          currentLang === "en"
            ? "Something went wrong. Please try again."
            : "დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან."
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;

          if (!formStatus?.classList.contains("is-success")) {
            submitBtn.textContent = originalText;
          }
        }
      }
    });
  }

  window.addEventListener(
    "scroll",
    () => {
      updateHeader();
      updateActiveLink();
    },
    { passive: true }
  );

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  updateHeader();
  updateActiveLink();
});
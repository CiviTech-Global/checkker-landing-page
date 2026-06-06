/* ============================================================
   CHECKKER LANDING PAGE — JavaScript
   Particle system, scroll animations, interactivity
   ============================================================ */

(function () {
  'use strict';

  // --- Preloader ---
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
      initRevealAnimations();
    }, 800);
  });

  document.body.style.overflow = 'hidden';

  // --- Particle System ---
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  let rafId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.targetOpacity = this.opacity;
      this.isGold = Math.random() < 0.15;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = (150 - dist) / 150;
        this.x += (dx / dist) * force * 2;
        this.y += (dy / dist) * force * 2;
        this.targetOpacity = Math.min(0.8, this.opacity + 0.3);
      } else {
        this.targetOpacity = this.opacity;
      }

      // Smooth opacity
      const currentOpacity = parseFloat(this._renderOpacity || this.opacity);
      this._renderOpacity = currentOpacity + (this.targetOpacity - currentOpacity) * 0.05;

      // Wrap around
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      if (this.isGold) {
        ctx.fillStyle = `rgba(212, 168, 67, ${this._renderOpacity || this.opacity})`;
      } else {
        ctx.fillStyle = `rgba(232, 228, 217, ${(this._renderOpacity || this.opacity) * 0.5})`;
      }
      ctx.fill();
    }
  }

  function initParticles() {
    resizeCanvas();
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 200);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.06;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(212, 168, 67, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawConnections();
    rafId = requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    // Re-init if particle count changes significantly
    const targetCount = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 200);
    if (Math.abs(particles.length - targetCount) > 20) {
      initParticles();
    }
  });

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  initParticles();
  animateParticles();

  // --- Navbar Scroll ---
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // --- Mobile Menu ---
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // --- Scroll Reveal Animations ---
  function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal-up');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseFloat(el.dataset.delay || 0);
          setTimeout(() => {
            el.classList.add('revealed');
          }, delay * 1000);
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // --- Counter Animation ---
  function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          let current = 0;
          const increment = target / 40;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              el.textContent = target;
              clearInterval(timer);
            } else {
              el.textContent = Math.floor(current);
            }
          }, 30);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  animateCounters();

  // --- Smooth Scroll for Nav Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navHeight = navbar.offsetHeight;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Floating Pieces Parallax ---
  const floatingPieces = document.querySelectorAll('.floating-piece');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    floatingPieces.forEach(piece => {
      const speed = parseFloat(piece.dataset.speed || 0.2);
      piece.style.transform = `translateY(${scrollY * speed * -0.3}px)`;
    });
  }, { passive: true });

  // --- Tilt Effect on Concept Image ---
  const conceptWrapper = document.querySelector('.concept-board-wrapper');
  if (conceptWrapper) {
    conceptWrapper.addEventListener('mousemove', (e) => {
      const rect = conceptWrapper.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      conceptWrapper.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });

    conceptWrapper.addEventListener('mouseleave', () => {
      conceptWrapper.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
      conceptWrapper.style.transition = 'transform 0.6s ease-out';
    });

    conceptWrapper.addEventListener('mouseenter', () => {
      conceptWrapper.style.transition = 'none';
    });
  }

  // --- Card Hover Sound-like Visual Feedback ---
  document.querySelectorAll('.card-item').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.4s, box-shadow 0.4s';
    });
  });

  // --- Active Nav Link Highlight ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === `#${current}`) {
        link.style.color = 'var(--gold)';
      }
    });
  }, { passive: true });

})();

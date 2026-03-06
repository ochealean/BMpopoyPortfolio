/* ========================================
   BM Popoy Del Rosario Portfolio - Script
   ======================================== */

/* ===== PAGE LOADER ===== */
(function () {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;

    // Minimum time the loader stays visible (ms).
    // Low-tier devices will take longer anyway; this prevents
    // an instant invisible flash on fast connections.
    const MIN_DISPLAY = 1200;
    const startTime = Date.now();

    function hideLoader() {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_DISPLAY - elapsed);

        setTimeout(() => {
            loader.classList.add('hidden');
            // Remove from DOM after fade completes so it doesn't
            // block any pointer events underneath.
            loader.addEventListener('transitionend', () => loader.remove(), { once: true });
        }, remaining);
    }

    // 'load' fires after all sub-resources (images, fonts, scripts) finish.
    window.addEventListener('load', hideLoader);

    // Safety fallback: force-hide after 8 s even if 'load' never fires
    // (e.g. a broken image preventing the event on very slow connections).
    setTimeout(hideLoader, 8000);
})();

document.addEventListener('DOMContentLoaded', () => {

    // ===== ELEMENTS =====
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.getElementById('backToTop');
    const contactForm = document.getElementById('contactForm');
    const particlesContainer = document.getElementById('particles');

    // ===== MOBILE NAV TOGGLE =====
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // ===== NAVBAR SCROLL EFFECT =====
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ===== ACTIVE NAV LINK ON SCROLL =====
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ===== BACK TO TOP BUTTON =====
    function handleBackToTop() {
        if (window.scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== SCROLL EVENT LISTENER =====
    window.addEventListener('scroll', () => {
        handleNavbarScroll();
        updateActiveLink();
        handleBackToTop();
    });

    // Trigger on load
    handleNavbarScroll();

    // ===== SCROLL REVEAL ANIMATION =====
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        const windowHeight = window.innerHeight;

        reveals.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const revealPoint = 120;

            if (elementTop < windowHeight - revealPoint) {
                el.classList.add('visible');
            }
        });
    }

    // Add reveal class to elements
    function initRevealElements() {
        const selectors = [
            '.about-content', '.about-image',
            '.vm-card',
            '.edu-item',
            '.career-card', '.org-card',
            '.committee-block',
            '.advocacy-card',
            '.timeline-item',
            '.gallery-item',
            '.quote-content',
            '.contact-info', '.contact-form-wrapper'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach((el, i) => {
                el.classList.add('reveal');
                el.style.transitionDelay = `${i * 0.1}s`;
            });
        });
    }

    initRevealElements();
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger for above-the-fold content

    // ===== COUNTER ANIMATION =====
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const speed = 70; // Lower is faster

        counters.forEach(counter => {
            if (counter.dataset.animated) return;

            const rect = counter.getBoundingClientRect();
            if (rect.top > window.innerHeight || rect.bottom < 0) return;

            counter.dataset.animated = 'true';
            const target = +counter.getAttribute('data-target');
            const increment = target / speed;

            const updateCount = () => {
                const current = +counter.innerText;
                if (current < target) {
                    counter.innerText = Math.ceil(current + increment);
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            };

            updateCount();
        });
    }

    window.addEventListener('scroll', animateCounters);
    animateCounters();

    // ===== HERO PARTICLES =====
    function createParticles() {
        const count = 30;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.width = (Math.random() * 4 + 2) + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 10) + 's';
            particle.style.opacity = Math.random() * 0.4 + 0.1;
            particlesContainer.appendChild(particle);
        }
    }

    createParticles();

    // ===== SMOOTH SCROLLING FOR ALL ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return; // Skip empty/bare hash links
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ===== CONTACT FORM HANDLING =====
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const name = formData.get('name');

        // Simple feedback (replace with real endpoint in production)
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        btn.style.background = '#28a745';
        btn.style.borderColor = '#28a745';
        btn.style.color = '#fff';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
            btn.disabled = false;
            contactForm.reset();
        }, 3000);

        console.log(`Message from ${name} submitted successfully.`);
    });

    // ===== TYPING EFFECT FOR HERO SUBTITLE =====
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const text = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        heroSubtitle.style.opacity = '1';
        let i = 0;

        function typeWriter() {
            if (i < text.length) {
                heroSubtitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 80);
            }
        }

        setTimeout(typeWriter, 500);
    }

});

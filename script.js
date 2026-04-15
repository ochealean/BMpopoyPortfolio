/* ========================================
   BM Popoy Del Rosario Portfolio - Script
   ======================================== */

/* ===== PAGE LOADER ===== */
(function () {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;

    const MIN_DISPLAY = 1200;
    const startTime = Date.now();

    function hideLoader() {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_DISPLAY - elapsed);

        setTimeout(() => {
            loader.classList.add('hidden');
            loader.addEventListener('transitionend', () => loader.remove(), { once: true });
        }, remaining);
    }

    window.addEventListener('load', hideLoader);
    setTimeout(hideLoader, 8000);
})();

document.addEventListener('DOMContentLoaded', () => {
    const state = {
        sections: {},
        events: [],
        isAdmin: false
    };

    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.getElementById('backToTop');
    const contactForm = document.getElementById('contactForm');
    const particlesContainer = document.getElementById('particles');

    const eventsGrid = document.getElementById('eventsGrid');
    const adminAuthStatus = document.getElementById('adminAuthStatus');
    const adminEditor = document.getElementById('adminEditor');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const adminSectionsForm = document.getElementById('adminSectionsForm');
    const adminEventForm = document.getElementById('adminEventForm');
    const sectionSaveStatus = document.getElementById('sectionSaveStatus');
    const eventSaveStatus = document.getElementById('eventSaveStatus');

    const staticFieldMap = {
        fieldHeroSubtitle: ['hero', 'subtitle'],
        fieldHeroTagline: ['hero', 'tagline'],
        fieldProfileImageUrl: ['about', 'profileImageUrl'],
        fieldAboutHeading: ['about', 'heading'],
        fieldAboutParagraph1: ['about', 'paragraph1'],
        fieldAboutParagraph2: ['about', 'paragraph2'],
        fieldAboutEmail: ['about', 'email'],
        fieldAboutPosition: ['about', 'position'],
        fieldStatProjects: ['stats', 'communityProjects'],
        fieldStatOrdinances: ['stats', 'ordinancesAuthored'],
        fieldStatFamilies: ['stats', 'familiesServed'],
        fieldVision: ['missionVision', 'vision'],
        fieldMission: ['missionVision', 'mission'],
        fieldContactAddress: ['contact', 'officeAddress'],
        fieldContactPhone: ['contact', 'phone'],
        fieldContactEmail: ['contact', 'email'],
        fieldContactHours: ['contact', 'officeHours'],
        fieldFacebookUrl: ['contact', 'facebookUrl'],
        fieldFacebookLabel: ['contact', 'facebookLabel'],
        fieldQuoteText: ['quote', 'text'],
        fieldQuoteAuthor: ['quote', 'author']
    };

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    async function apiFetch(url, options = {}) {
        const response = await fetch(url, {
            credentials: 'include',
            ...options
        });

        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const payload = isJson ? await response.json() : null;

        if (!response.ok) {
            const message = payload && payload.error ? payload.error : `Request failed (${response.status})`;
            throw new Error(message);
        }

        return payload;
    }

    function setStatus(element, message, isError = false) {
        if (!element) return;
        element.textContent = message;
        element.classList.toggle('error', isError);
        element.classList.toggle('success', !isError && !!message);
    }

    function applyTextById(id, value) {
        const element = document.getElementById(id);
        if (!element || typeof value === 'undefined' || value === null) return;
        element.textContent = value;
    }

    function applySectionsToDom(sections) {
        const hero = sections.hero || {};
        const about = sections.about || {};
        const stats = sections.stats || {};
        const missionVision = sections.missionVision || {};
        const quote = sections.quote || {};
        const contact = sections.contact || {};

        applyTextById('heroSubtitleText', hero.subtitle);
        applyTextById('heroTaglineText', hero.tagline);

        const profileImage = document.getElementById('aboutProfileImage');
        if (profileImage && about.profileImageUrl) {
            profileImage.src = about.profileImageUrl;
        }

        applyTextById('aboutHeadingText', about.heading);
        applyTextById('aboutParagraph1Text', about.paragraph1);
        applyTextById('aboutParagraph2Text', about.paragraph2);
        applyTextById('aboutEmailText', about.email);
        applyTextById('aboutPositionText', about.position);

        const statProjects = document.getElementById('statCommunityProjects');
        const statOrdinances = document.getElementById('statOrdinancesAuthored');
        const statFamilies = document.getElementById('statFamiliesServed');

        if (statProjects && Number.isFinite(Number(stats.communityProjects))) {
            statProjects.setAttribute('data-target', String(stats.communityProjects));
            statProjects.textContent = '0';
            delete statProjects.dataset.animated;
        }

        if (statOrdinances && Number.isFinite(Number(stats.ordinancesAuthored))) {
            statOrdinances.setAttribute('data-target', String(stats.ordinancesAuthored));
            statOrdinances.textContent = '0';
            delete statOrdinances.dataset.animated;
        }

        if (statFamilies && Number.isFinite(Number(stats.familiesServed))) {
            statFamilies.setAttribute('data-target', String(stats.familiesServed));
            statFamilies.textContent = '0';
            delete statFamilies.dataset.animated;
        }

        applyTextById('visionText', missionVision.vision);
        applyTextById('missionText', missionVision.mission);
        applyTextById('quoteText', quote.text);
        applyTextById('quoteAuthorText', quote.author);

        applyTextById('contactOfficeAddressText', contact.officeAddress);
        applyTextById('contactPhoneText', contact.phone);
        applyTextById('contactEmailText', contact.email);
        applyTextById('contactHoursText', contact.officeHours);
        applyTextById('contactFacebookLabelText', contact.facebookLabel);

        const fbLink = document.getElementById('contactFacebookLink');
        if (fbLink && contact.facebookUrl) {
            fbLink.href = contact.facebookUrl;
        }
    }

    function getSectionValue(sectionKey, propKey, fallback = '') {
        const section = state.sections[sectionKey] || {};
        const value = section[propKey];
        return typeof value === 'undefined' || value === null ? fallback : value;
    }

    function fillAdminFormFromSections() {
        Object.entries(staticFieldMap).forEach(([fieldId, [sectionKey, propKey]]) => {
            const input = document.getElementById(fieldId);
            if (!input) return;
            input.value = getSectionValue(sectionKey, propKey, '');
        });
    }

    function collectSectionPayload() {
        const payload = {
            hero: {},
            about: {},
            stats: {},
            missionVision: {},
            contact: {},
            quote: {}
        };

        Object.entries(staticFieldMap).forEach(([fieldId, [sectionKey, propKey]]) => {
            const input = document.getElementById(fieldId);
            if (!input) return;

            if (sectionKey === 'stats') {
                const numeric = Number.parseInt(input.value || '0', 10);
                payload[sectionKey][propKey] = Number.isNaN(numeric) ? 0 : numeric;
                return;
            }

            payload[sectionKey][propKey] = input.value.trim();
        });

        return payload;
    }

    async function saveSectionsPayload(payload) {
        const sectionEntries = Object.entries(payload);

        for (const [key, value] of sectionEntries) {
            await apiFetch('/api/sections', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });
        }
    }

    function renderEvents() {
        if (!eventsGrid) return;

        if (!state.events.length) {
            eventsGrid.innerHTML = `
                <div class="gallery-item">
                    <div class="gallery-placeholder">
                        <i class="fas fa-calendar-day"></i>
                        <p>No uploaded events yet</p>
                    </div>
                </div>
            `;
            return;
        }

        eventsGrid.innerHTML = state.events.map((event) => `
            <article class="event-card reveal">
                <div class="event-image-wrap">
                    ${event.coverImageUrl
                        ? `<img src="${escapeHtml(event.coverImageUrl)}" alt="${escapeHtml(event.title)}" class="event-cover" loading="lazy">`
                        : `<div class="gallery-placeholder"><i class="fas fa-image"></i><p>No image</p></div>`}
                </div>
                <div class="event-card-body">
                    <p class="event-meta"><i class="fas fa-calendar"></i> ${escapeHtml(event.eventDate)} <span class="event-sep">|</span> <i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</p>
                    <h4>${escapeHtml(event.title)}</h4>
                    <p class="event-count">${event.imageCount || 0} image(s)</p>
                    ${state.isAdmin ? `<button type="button" class="btn btn-primary event-delete-btn" data-event-id="${event.id}">Delete Event</button>` : ''}
                </div>
            </article>
        `).join('');

        revealOnScroll();
    }

    async function loadBootstrapData() {
        try {
            const data = await apiFetch('/api/bootstrap');
            state.sections = data.sections || {};
            state.events = data.events || [];
            applySectionsToDom(state.sections);
            fillAdminFormFromSections();
            renderEvents();
            animateCounters();
        } catch (error) {
            console.error('Failed to load content:', error);
        }
    }

    function updateAdminState() {
        if (adminAuthStatus) {
            adminAuthStatus.textContent = state.isAdmin ? 'Logged in as supervisor' : 'Not logged in';
        }

        if (adminEditor) {
            adminEditor.style.display = state.isAdmin ? 'block' : 'none';
        }

        if (adminLogoutBtn) {
            adminLogoutBtn.style.display = state.isAdmin ? 'inline-flex' : 'none';
        }
    }

    async function refreshAdminSession() {
        try {
            await apiFetch('/api/admin-auth', { method: 'GET' });
            state.isAdmin = true;
        } catch {
            state.isAdmin = false;
        }

        updateAdminState();
        renderEvents();
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            setStatus(adminAuthStatus, 'Signing in...');

            const email = document.getElementById('adminEmail')?.value.trim() || '';
            const password = document.getElementById('adminPassword')?.value || '';

            try {
                await apiFetch('/api/admin-auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                state.isAdmin = true;
                updateAdminState();
                renderEvents();
                setStatus(adminAuthStatus, 'Login successful');
                adminLoginForm.reset();
            } catch (error) {
                setStatus(adminAuthStatus, error.message, true);
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', async () => {
            try {
                await apiFetch('/api/admin-auth', { method: 'DELETE' });
            } catch (error) {
                console.error(error);
            }

            state.isAdmin = false;
            updateAdminState();
            renderEvents();
            setStatus(adminAuthStatus, 'Logged out');
        });
    }

    if (adminSectionsForm) {
        adminSectionsForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!state.isAdmin) {
                setStatus(sectionSaveStatus, 'Login is required to edit content', true);
                return;
            }

            setStatus(sectionSaveStatus, 'Saving sections...');
            const payload = collectSectionPayload();

            try {
                await saveSectionsPayload(payload);
                setStatus(sectionSaveStatus, 'Static content saved');
                await loadBootstrapData();
            } catch (error) {
                setStatus(sectionSaveStatus, error.message, true);
            }
        });
    }

    if (adminEventForm) {
        adminEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!state.isAdmin) {
                setStatus(eventSaveStatus, 'Login is required to upload events', true);
                return;
            }

            const title = document.getElementById('eventTitle')?.value.trim() || '';
            const eventDate = document.getElementById('eventDate')?.value || '';
            const location = document.getElementById('eventLocation')?.value.trim() || '';
            const files = document.getElementById('eventImages')?.files || [];

            if (!title || !eventDate || !location) {
                setStatus(eventSaveStatus, 'Event title, date, and location are required', true);
                return;
            }

            if (!files.length) {
                setStatus(eventSaveStatus, 'Please select at least one image', true);
                return;
            }

            if (files.length > 10) {
                setStatus(eventSaveStatus, 'Maximum 10 images per event', true);
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('eventDate', eventDate);
            formData.append('location', location);

            for (const file of files) {
                formData.append('images', file, file.name);
            }

            setStatus(eventSaveStatus, 'Uploading event...');

            try {
                await apiFetch('/api/events', {
                    method: 'POST',
                    body: formData
                });

                adminEventForm.reset();
                setStatus(eventSaveStatus, 'Event uploaded successfully');
                await loadBootstrapData();
            } catch (error) {
                setStatus(eventSaveStatus, error.message, true);
            }
        });
    }

    if (eventsGrid) {
        eventsGrid.addEventListener('click', async (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;

            if (!target.classList.contains('event-delete-btn')) return;
            if (!state.isAdmin) return;

            const eventId = target.getAttribute('data-event-id');
            if (!eventId) return;

            const confirmDelete = window.confirm('Delete this event and all of its images?');
            if (!confirmDelete) return;

            try {
                await apiFetch(`/api/events?eventId=${encodeURIComponent(eventId)}`, {
                    method: 'DELETE'
                });
                await loadBootstrapData();
            } catch (error) {
                setStatus(eventSaveStatus, error.message, true);
            }
        });
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (!navToggle || !navMenu) return;
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!navMenu || !navToggle) return;
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    function handleNavbarScroll() {
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach((link) => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    function handleBackToTop() {
        if (!backToTop) return;

        if (window.scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.addEventListener('scroll', () => {
        handleNavbarScroll();
        updateActiveLink();
        handleBackToTop();
        revealOnScroll();
        animateCounters();
    });

    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        const windowHeight = window.innerHeight;

        reveals.forEach((el) => {
            const elementTop = el.getBoundingClientRect().top;
            const revealPoint = 120;

            if (elementTop < windowHeight - revealPoint) {
                el.classList.add('visible');
            }
        });
    }

    function initRevealElements() {
        const selectors = [
            '.about-content',
            '.about-image',
            '.vm-card',
            '.edu-item',
            '.career-card',
            '.org-card',
            '.committee-block',
            '.advocacy-card',
            '.timeline-item',
            '.gallery-item',
            '.quote-content',
            '.contact-info',
            '.contact-form-wrapper',
            '.event-card'
        ];

        selectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el, i) => {
                el.classList.add('reveal');
                el.style.transitionDelay = `${i * 0.08}s`;
            });
        });
    }

    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const speed = 70;

        counters.forEach((counter) => {
            if (counter.dataset.animated) return;

            const rect = counter.getBoundingClientRect();
            if (rect.top > window.innerHeight || rect.bottom < 0) return;

            const target = Number(counter.getAttribute('data-target'));
            if (!Number.isFinite(target)) return;

            counter.dataset.animated = 'true';
            const increment = Math.max(1, target / speed);

            const updateCount = () => {
                const current = Number(counter.innerText.replace(/,/g, '')) || 0;
                if (current < target) {
                    counter.innerText = Math.ceil(current + increment).toLocaleString();
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            };

            updateCount();
        });
    }

    function createParticles() {
        if (!particlesContainer) return;
        const count = 30;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.width = `${Math.random() * 4 + 2}px`;
            particle.style.height = particle.style.width;
            particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.opacity = String(Math.random() * 0.4 + 0.1);
            particlesContainer.appendChild(particle);
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const btn = contactForm.querySelector('button[type="submit"]');
            if (!btn) return;

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
    }

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

    handleNavbarScroll();
    handleBackToTop();
    initRevealElements();
    revealOnScroll();
    animateCounters();
    createParticles();
    updateAdminState();

    const startupTasks = [loadBootstrapData()];
    const hasAdminUi = Boolean(adminLoginForm || adminEditor || adminSectionsForm || adminEventForm || adminLogoutBtn);

    if (hasAdminUi) {
        startupTasks.push(refreshAdminSession());
    }

    Promise.all(startupTasks).catch((error) => {
        console.error(error);
    });
});

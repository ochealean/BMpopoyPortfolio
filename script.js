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
    const EMAILJS_CONFIG = {
        PUBLIC_KEY: '9f-57UFwyDZOggQB2',
        SERVICE_ID: 'service_obuvmoh',
        TEMPLATE_ID: 'template_dg621p2'
    };

    const state = {
        sections: {},
        events: [],
        isAdmin: false
    };

    let store = {
        statsArray: [],
        vision: "By 2030, Bataan will achieve inclusive growth driven by sustainable investments and empowered communities.",
        mission: "Deliver excellent public service through transparency, accountability, and multi-sectoral collaboration.",
        education: [
            { yearRange: "1984–1990", level: "Elementary", school: "Bagac Elementary School", course: "" },
            { yearRange: "1990–1994", level: "Secondary", school: "Bernabe High School", course: "" },
            { yearRange: "1996–2001", level: "College", school: "Tomas Del Rosario College", course: "Banking & Finance" },
            { yearRange: "Graduate School", level: "Graduate Studies", school: "University of Makati", course: "Political Science" },
            { yearRange: "Graduate School", level: "Graduate Studies", school: "", course: "Business Administration" }
        ],
        career: [
            { period: "2019 – Present", title: "Provincial Board Member", org: "Provincial Government of Bataan" },
            { period: "2010 – 2019", title: "Municipal Councilor", org: "Municipality of Bagac, Bataan" },
            { period: "2007 – 2010", title: "Project Manager", org: "Xaviernet Enterprises — San Mateo, Rizal" },
            { period: "2001 – 2007", title: "Purchasing Manager / Admin. Officer", org: "Archinet International — Taguig City" }
        ],
        organizations: [],
        committees: [
            { period: "2024 – Present", chairman: ["Peace and Order, and Public Safety","Transportation and Communications"], viceChair: ["Agriculture, Food and Fisheries","Indigenous Cultural Communities","Labor, Manpower, Employment, and Civil Service","Tourism","Trade, Commerce, and Industry","Youth and Sports Development"], member: ["Education and Culture","Energy, Water, and Public Utilities"] },
            { period: "2022 – 2024", chairman: ["Peace and Order and Public Safety","Tourism"], viceChair: ["Justice, Human Rights, and Legal Matters","Agriculture, Food and Fisheries","Finance, Budget, Appropriation","Infrastructure","Cooperatives","Barangay Affairs","Indigenous Cultural Communities"], member: ["Labor, Manpower, Employment","Rules and Ethics","Social Welfare","Trade, Commerce","Transportation","Youth and Sports"] },
            { period: "2019 – 2022", chairman: ["Tourism","Peace and Order and Public Safety"], viceChair: ["Trade, Commerce","Rules and Ethics","Health","Social Welfare","Senior Citizens","Youth and Sports"], member: ["Education & Culture","Housing","Energy","Cooperatives","Transportation","Barangay Affairs","Labor"] }
        ],
        advocacies: [
            { title: "Education", description: "Ensuring quality and accessible education for all – scholarships, facilities, teacher support." },
            { title: "Health & Wellness", description: "Comprehensive healthcare, medical missions, mental health awareness." },
            { title: "Environment", description: "Sustainable development, clean-up drives, tree planting ordinances." },
            { title: "Social Welfare", description: "Livelihood programs, disaster relief, safety nets for vulnerable sectors." },
            { title: "Infrastructure", description: "Modern roads, bridges, public buildings for economic growth." },
            { title: "Youth Empowerment", description: "Training, sports programs, leadership development." }
        ],
        achievements: [
            { year: "2024", title: "Free Education Ordinance", description: "Educational assistance to underprivileged families." },
            { year: "2023", title: "Livelihood & Skills Training", description: "Province-wide initiative benefiting 3,000 families." },
            { year: "2023", title: "Medical Mission Drive", description: "30+ barangays, free check-ups and medicines." },
            { year: "2022", title: "Infrastructure Development", description: "Farm-to-market roads and school buildings." },
            { year: "2022", title: "Disaster Relief Operations", description: "Immediate response during typhoons." }
        ],
        events: []
    };

    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.getElementById('backToTop');
    const contactForm = document.getElementById('contactForm');
    const contactFormStatus = document.getElementById('contactFormStatus');
    const contactUnavailableModal = document.getElementById('contactUnavailableModal');
    const contactUnavailableFacebookLink = document.getElementById('contactUnavailableFacebookLink');
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
    const eventModal = document.getElementById('eventModal');
    const eventModalImage = document.getElementById('eventModalImage');
    const eventModalCaption = document.getElementById('eventModalCaption');
    const eventModalCounter = document.getElementById('eventModalCounter');
    const eventModalPrev = document.getElementById('eventModalPrev');
    const eventModalNext = document.getElementById('eventModalNext');

    const modalState = {
        images: [],
        index: 0,
        title: ''
    };

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

    function getEventImages(event) {
        if (Array.isArray(event.imageUrls) && event.imageUrls.length) {
            return event.imageUrls;
        }

        return event.coverImageUrl ? [event.coverImageUrl] : [];
    }

    function syncPublicCarousel(carousel, index) {
        if (!carousel) return;

        const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
        if (!slides.length) return;

        const nextIndex = ((index % slides.length) + slides.length) % slides.length;
        carousel.dataset.currentIndex = String(nextIndex);

        const track = carousel.querySelector('.public-event-carousel-track');
        if (track) {
            track.style.transform = `translateX(-${nextIndex * 100}%)`;
        }

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === nextIndex);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === nextIndex);
        });
    }

    function updateEventModalView() {
        if (!eventModal || !eventModalImage || !modalState.images.length) return;

        const currentUrl = modalState.images[modalState.index];
        eventModalImage.src = currentUrl;
        eventModalImage.alt = `${modalState.title} image ${modalState.index + 1}`;

        if (eventModalCaption) {
            eventModalCaption.textContent = modalState.images.length > 1
                ? `${modalState.title} — ${modalState.index + 1} of ${modalState.images.length}`
                : modalState.title;
        }

        if (eventModalCounter) {
            eventModalCounter.textContent = modalState.images.length > 1
                ? `${modalState.index + 1} / ${modalState.images.length}`
                : '1 / 1';
        }

        if (eventModalPrev) {
            eventModalPrev.disabled = modalState.images.length < 2;
        }

        if (eventModalNext) {
            eventModalNext.disabled = modalState.images.length < 2;
        }
    }

    function openEventModal(images, title, startIndex = 0) {
        if (!eventModal || !eventModalImage || !images.length) return;

        modalState.images = images;
        modalState.title = title || 'Event image';
        modalState.index = ((startIndex % images.length) + images.length) % images.length;

        updateEventModalView();
        eventModal.classList.add('is-open');
        eventModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeEventModal() {
        if (!eventModal) return;

        eventModal.classList.remove('is-open');
        eventModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    function stepEventModal(direction) {
        if (!modalState.images.length) return;

        modalState.index = (modalState.index + direction + modalState.images.length) % modalState.images.length;
        updateEventModalView();
    }

    function openContactUnavailableModal() {
        if (!contactUnavailableModal) return;
        contactUnavailableModal.classList.add('is-open');
        contactUnavailableModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeContactUnavailableModal() {
        if (!contactUnavailableModal) return;
        contactUnavailableModal.classList.remove('is-open');
        contactUnavailableModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
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

    function formatContactDate() {
        return new Date().toLocaleString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
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
        applyTextById('aboutDateOfBirthText', about.dateOfBirth);
        applyTextById('aboutEmailText', about.email);
        applyTextById('aboutPositionText', about.position);

        const dynamicContainer = document.getElementById('aboutDynamicInfoRows');
        if (dynamicContainer) {
            dynamicContainer.innerHTML = '';
            (about.dynamicPersonalInfo || []).forEach(row => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'info-row';
                rowDiv.innerHTML = `<strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}`;
                dynamicContainer.appendChild(rowDiv);
            });
        }

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

    function getAboutStatIcon(label) {
        const normalized = String(label || '').toLowerCase();

        if (normalized.includes('community') || normalized.includes('project')) return 'chart-line';
        if (normalized.includes('ordinance')) return 'gavel';
        if (normalized.includes('famil')) return 'users';
        if (normalized.includes('education')) return 'graduation-cap';
        if (normalized.includes('health')) return 'heart';
        if (normalized.includes('youth')) return 'users';
        return 'chart-simple';
    }

    function getAboutStatLogoMarkup(stat) {
        if (!stat) {
            return '<i class="fas fa-chart-simple"></i>';
        }

        if (stat.logoType === 'upload' && stat.logoValue) {
            return `<img src="${escapeHtml(stat.logoValue)}" alt="${escapeHtml(stat.label || 'Stat logo')}" style="width:18px; height:18px; object-fit:cover; border-radius:4px; vertical-align:middle; margin-right:6px;">`;
        }

        const icon = stat.logoValue || getAboutStatIcon(stat.label);
        return `<i class="fas fa-${escapeHtml(icon)}"></i>`;
    }

    function formatAboutStatLabel(label) {
        const parts = String(label || '').trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return '';
        if (parts.length === 1) return escapeHtml(parts[0]);
        return `${escapeHtml(parts[0])}<br>${escapeHtml(parts.slice(1).join(' '))}`;
    }

    function renderAboutStats(statsArray) {
        const container = document.querySelector('.about-stats');
        if (!container) return;

        const stats = Array.isArray(statsArray) ? statsArray.filter((stat) => stat && stat.label) : [];

        if (!stats.length) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = stats.map((stat) => {
            const value = Number(stat.value);
            const safeValue = Number.isFinite(value) ? value : 0;
            const logoMarkup = getAboutStatLogoMarkup(stat);

            return `
                <div class="stat-item">
                    <span class="stat-number" data-target="${safeValue}">0</span><span class="stat-suffix">+</span>
                    <p>${logoMarkup} ${formatAboutStatLabel(stat.label)}</p>
                </div>
            `;
        }).join('');
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

        eventsGrid.innerHTML = state.events.map((event) => {
            const imageUrls = getEventImages(event);
            const coverImageUrl = imageUrls[0] || '';
            const carouselId = `publicEventCarousel-${event.id}`;

            const carouselSlides = imageUrls.map((url, index) => `
                <button type="button" class="public-event-slide${index === 0 ? ' is-active' : ''}" data-carousel-slide data-image-index="${index}" data-image-url="${escapeHtml(url)}" aria-label="Open image ${index + 1}">
                    <img src="${escapeHtml(url)}" alt="${escapeHtml(event.title)} image ${index + 1}" class="event-cover" loading="lazy">
                </button>
            `).join('');

            const carouselDots = imageUrls.length > 1
                ? `<div class="public-event-dots">${imageUrls.map((_, index) => `
                        <button type="button" class="public-event-dot${index === 0 ? ' is-active' : ''}" data-carousel-dot data-image-index="${index}" aria-label="View image ${index + 1}"></button>
                    `).join('')}</div>`
                : '';

            return `
            <article class="event-card reveal">
                <div class="event-image-wrap" data-event-carousel id="${carouselId}" data-current-index="0" data-image-count="${imageUrls.length}">
                    ${imageUrls.length > 1 ? `
                        <button type="button" class="public-event-carousel-nav public-event-carousel-prev" data-carousel-action="prev" aria-label="Previous image">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                    ` : ''}
                    <div class="public-event-carousel-viewport">
                        <div class="public-event-carousel-track" style="transform: translateX(0%);">
                            ${coverImageUrl ? carouselSlides : `<div class="gallery-placeholder"><i class="fas fa-image"></i><p>No image</p></div>`}
                        </div>
                    </div>
                    ${imageUrls.length > 1 ? `
                        <button type="button" class="public-event-carousel-nav public-event-carousel-next" data-carousel-action="next" aria-label="Next image">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="event-card-body">
                    <p class="event-meta"><i class="fas fa-calendar"></i> ${escapeHtml(event.eventDate)} <span class="event-sep">|</span> <i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</p>
                    <h4>${escapeHtml(event.title)}</h4>
                    <p class="event-count">${event.imageCount || imageUrls.length || 0} image(s)</p>
                    ${carouselDots}
                    ${state.isAdmin ? `<button type="button" class="btn btn-primary event-delete-btn" data-event-id="${event.id}">Delete Event</button>` : ''}
                </div>
            </article>
        `;
        }).join('');

        revealOnScroll();
    }

    function normalizeStatLabel(label) {
        return String(label || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    function mapStoreStatsToSectionStats(statsArray, currentStats = {}) {
        const mapped = {
            ...currentStats
        };

        if (!Array.isArray(statsArray) || !statsArray.length) {
            return mapped;
        }

        const normalizedEntries = statsArray.map((stat) => ({
            label: normalizeStatLabel(stat && stat.label),
            value: Number(stat && stat.value)
        }));

        const community = normalizedEntries.find((entry) => entry.label.includes('community') || entry.label.includes('project'));
        const ordinances = normalizedEntries.find((entry) => entry.label.includes('ordinance'));
        const families = normalizedEntries.find((entry) => entry.label.includes('famil'));

        if (community && Number.isFinite(community.value)) mapped.communityProjects = community.value;
        if (ordinances && Number.isFinite(ordinances.value)) mapped.ordinancesAuthored = ordinances.value;
        if (families && Number.isFinite(families.value)) mapped.familiesServed = families.value;

        const positionalValues = statsArray
            .map((stat) => Number(stat && stat.value))
            .filter((value) => Number.isFinite(value));

        if (!Number.isFinite(Number(mapped.communityProjects)) && Number.isFinite(positionalValues[0])) {
            mapped.communityProjects = positionalValues[0];
        }
        if (!Number.isFinite(Number(mapped.ordinancesAuthored)) && Number.isFinite(positionalValues[1])) {
            mapped.ordinancesAuthored = positionalValues[1];
        }
        if (!Number.isFinite(Number(mapped.familiesServed)) && Number.isFinite(positionalValues[2])) {
            mapped.familiesServed = positionalValues[2];
        }

        return mapped;
    }

    async function loadBootstrapData() {
        try {
            const data = await apiFetch('/api/bootstrap');
            state.sections = data.sections || {};
            state.events = data.events || [];
            renderEvents();

            // Load store from admin_store_data
            const adminStoreData = state.sections['admin_store_data'];
            if (adminStoreData) {
                Object.assign(store, adminStoreData);
            }

            // Prefer stats from the same admin record
            if (adminStoreData && Array.isArray(adminStoreData.statsArray) && adminStoreData.statsArray.length) {
                state.sections.stats = mapStoreStatsToSectionStats(adminStoreData.statsArray, state.sections.stats || {});
            } else if ((!state.sections.stats || Object.keys(state.sections.stats).length === 0) && store.statsArray && store.statsArray.length) {
                state.sections.stats = mapStoreStatsToSectionStats(store.statsArray, state.sections.stats || {});
            }
            if (store.vision) {
                state.sections.missionVision = state.sections.missionVision || {};
                state.sections.missionVision.vision = store.vision;
                state.sections.missionVision.mission = store.mission;
            }

            applySectionsToDom(state.sections);
            renderAboutStats((adminStoreData && Array.isArray(adminStoreData.statsArray) && adminStoreData.statsArray.length)
                ? adminStoreData.statsArray
                : (store.statsArray || []));
            fillAdminFormFromSections();

            try {
                renderDynamicSections();
            } catch (error) {
                console.warn('Dynamic section rendering failed:', error);
            }

            try {
                animateCounters();
            } catch (error) {
                console.warn('Counter animation failed:', error);
            }
        } catch (error) {
            console.error('Failed to load content:', error);
        }
    }

    function renderDynamicSections() {
        renderEducation();
        renderCareer();
        renderOrganizations();
        renderCommittees();
        renderAdvocacies();
        renderAchievements();
    }

    function getEducationIcon(level) {
        const lvl = String(level || '').toLowerCase();
        if (lvl.includes('elementary')) return 'fa-book';
        if (lvl.includes('secondary') || lvl.includes('high')) return 'fa-book-open';
        if (lvl.includes('college') || lvl.includes('undergraduate')) return 'fa-graduation-cap';
        if (lvl.includes('graduate') || lvl.includes('master') || lvl.includes('phd')) return 'fa-school';
        return 'fa-graduation-cap';
    }

    function getEducationColor(level) {
        const lvl = String(level || '').toLowerCase();
        if (lvl.includes('elementary')) return 'edu-primary';
        if (lvl.includes('secondary') || lvl.includes('high')) return 'edu-secondary';
        if (lvl.includes('college') || lvl.includes('undergraduate')) return 'edu-tertiary';
        if (lvl.includes('graduate') || lvl.includes('master') || lvl.includes('phd')) return 'edu-graduate';
        return 'edu-primary';
    }

    function renderEducation() {
        const container = document.querySelector('.education-timeline');
        if (!container || !store.education) return;
        container.innerHTML = store.education.map((edu, idx) => {
            const icon = getEducationIcon(edu.level);
            const colorClass = getEducationColor(edu.level);
            return `
            <div class="edu-item reveal" style="--item-index: ${idx};">
                <div class="edu-dot ${colorClass}"></div>
                <div class="edu-content ${colorClass}">
                    <div class="edu-icon-badge ${colorClass}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <span class="edu-year">${escapeHtml(edu.yearRange)}</span>
                    <h4>${escapeHtml(edu.level)}</h4>
                    <p class="edu-school">${escapeHtml(edu.school)}</p>
                    ${edu.course ? `<p class="edu-course">${escapeHtml(edu.course)}</p>` : ''}
                </div>
            </div>
        `}).join('');
        revealOnScroll();
    }

    function getCareerIcon(title) {
        const ttl = String(title || '').toLowerCase();
        if (ttl.includes('board') || ttl.includes('member')) return 'fa-gavel';
        if (ttl.includes('manager') || ttl.includes('director') || ttl.includes('head')) return 'fa-chart-line';
        if (ttl.includes('officer') || ttl.includes('executive')) return 'fa-briefcase';
        if (ttl.includes('consultant')) return 'fa-handshake';
        if (ttl.includes('specialist')) return 'fa-toolbox';
        if (ttl.includes('coordinator') || ttl.includes('assistant')) return 'fa-person-chalkboard';
        return 'fa-briefcase';
    }

    function resolveCareerLogo(career) {
        const explicitLogoValue = String(career?.logoValue || '').trim();
        if (career?.logoType === 'icon' && explicitLogoValue) return explicitLogoValue;

        const guessedIcon = getCareerIcon(career?.title || '');
        return guessedIcon.replace('fa-', '');
    }

    function getCareerLogoMarkup(career) {
        const isUploadedLogo = career?.logoType === 'upload' && String(career?.logoValue || '').trim();

        if (isUploadedLogo) {
            return `<img src="${escapeHtml(career.logoValue)}" alt="${escapeHtml(career?.title || 'Career logo')}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
        }

        return `<i class="fas fa-${escapeHtml(resolveCareerLogo(career))}"></i>`;
    }

    function renderCareer() {
        const container = document.querySelector('.career-timeline');
        if (!container || !store.career) return;
        container.innerHTML = store.career.map((c, idx) => {
            const logoMarkup = getCareerLogoMarkup(c);
            return `
            <div class="career-item reveal" style="--item-index: ${idx};">
                <div class="career-marker"></div>
                <div class="career-content">
                    <div class="career-header">
                        <div class="career-icon">
                            ${logoMarkup}
                        </div>
                        <div class="career-info">
                            <span class="career-period">${escapeHtml(c.period)}</span>
                            <h4>${escapeHtml(c.title)}</h4>
                        </div>
                    </div>
                    <p class="career-org">${escapeHtml(c.org)}</p>
                </div>
            </div>
        `}).join('');
        revealOnScroll();
    }

    function resolveOrganizationIcon(org) {
        const explicitLogoValue = String(org?.logoValue || '').trim();
        if (org?.logoType === 'icon' && explicitLogoValue) return explicitLogoValue;

        const explicitIcon = String(org?.icon || '').trim();
        if (explicitIcon) return explicitIcon;

        const text = `${String(org?.name || '')} ${String(org?.role || '')}`.toLowerCase();
        if (text.includes('rotary')) return 'globe';
        if (text.includes('lion')) return 'paw';
        if (text.includes('league') || text.includes('board')) return 'landmark';
        if (text.includes('eagle')) return 'shield-alt';
        return 'users';
    }

    function getOrganizationLogoMarkup(org) {
        const isUploadedLogo = org?.logoType === 'upload' && String(org?.logoValue || '').trim();

        if (isUploadedLogo) {
            return `<img src="${escapeHtml(org.logoValue)}" alt="${escapeHtml(org?.name || 'Organization logo')}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        }

        return `<i class="fas fa-${escapeHtml(resolveOrganizationIcon(org))}"></i>`;
    }

    function renderOrganizations() {
        const container = document.querySelector('.org-grid');
        if (!container || !Array.isArray(store.organizations)) return;

        if (!store.organizations.length) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = store.organizations.map((org) => `
            <div class="org-card reveal">
                <div class="org-icon">${getOrganizationLogoMarkup(org)}</div>
                <h4>${escapeHtml(org?.name || '')}</h4>
                <p>${escapeHtml(org?.role || '')}</p>
            </div>
        `).join('');

        revealOnScroll();
    }

    function renderCommittees() {
        const container = document.querySelector('.committees-list');
        if (!container || !store.committees) return;
        container.innerHTML = store.committees.map(comm => {
            const chairman = Array.isArray(comm?.chairman) ? comm.chairman : [];
            const viceChair = Array.isArray(comm?.viceChair) ? comm.viceChair : [];
            const member = Array.isArray(comm?.member) ? comm.member : [];
            return `
            <div class="committee-item reveal">
                <h4>${escapeHtml(comm?.period || '')}</h4>
                <div class="committee-details">
                    ${chairman.length ? `<p><strong>Chairman:</strong> ${chairman.map(item => escapeHtml(item)).join(', ')}</p>` : ''}
                    ${viceChair.length ? `<p><strong>Vice-Chair:</strong> ${viceChair.map(item => escapeHtml(item)).join(', ')}</p>` : ''}
                    ${member.length ? `<p><strong>Member:</strong> ${member.map(item => escapeHtml(item)).join(', ')}</p>` : ''}
                </div>
            </div>
        `;
        }).join('');
        revealOnScroll();
    }

    function guessAdvocacyIcon(title) {
        const lowered = String(title || '').toLowerCase();
        if (lowered.includes('education')) return 'graduation-cap';
        if (lowered.includes('health')) return 'hospital';
        if (lowered.includes('environment')) return 'leaf';
        if (lowered.includes('social')) return 'hands-helping';
        if (lowered.includes('infrastructure')) return 'road';
        if (lowered.includes('youth')) return 'users';
        return 'star';
    }

    function resolveAdvocacyIcon(advocacy) {
        const explicitLogoValue = String(advocacy?.logoValue || '').trim();
        if (advocacy?.logoType === 'icon' && explicitLogoValue) return explicitLogoValue;

        const explicitIcon = String(advocacy?.icon || '').trim();
        if (explicitIcon) return explicitIcon;

        return guessAdvocacyIcon(advocacy?.title || '');
    }

    function getAdvocacyLogoMarkup(advocacy) {
        const isUploadedLogo = advocacy?.logoType === 'upload' && String(advocacy?.logoValue || '').trim();

        if (isUploadedLogo) {
            return `<img src="${escapeHtml(advocacy.logoValue)}" alt="${escapeHtml(advocacy?.title || 'Advocacy logo')}" style="width:100%; height:100%; object-fit:cover; border-radius:14px;">`;
        }

        return `<i class="fas fa-${escapeHtml(resolveAdvocacyIcon(advocacy))}"></i>`;
    }

    function renderAdvocacies() {
        const container = document.querySelector('.advocacies-grid');
        if (!container || !store.advocacies) return;
        container.innerHTML = store.advocacies.map(adv => {
            const title = String(adv?.title || '');
            return `
            <div class="advocacy-item reveal">
                <div class="advocacy-icon">
                    ${getAdvocacyLogoMarkup(adv)}
                </div>
                <h4>${escapeHtml(title)}</h4>
                <p>${escapeHtml(adv?.description || '')}</p>
            </div>
        `;
        }).join('');
        revealOnScroll();
    }

    function renderAchievements() {
        const container = document.querySelector('.achievements-list');
        if (!container || !store.achievements) return;
        container.innerHTML = store.achievements.map(ach => `
            <div class="achievement-item reveal">
                <div class="achievement-year">${escapeHtml(ach.year)}</div>
                <div class="achievement-content">
                    <h4>${escapeHtml(ach.title)}</h4>
                    <p>${escapeHtml(ach.description)}</p>
                </div>
            </div>
        `).join('');
        revealOnScroll();
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

            const carouselButton = target.closest('[data-carousel-action]');
            if (carouselButton && carouselButton instanceof HTMLElement) {
                const carousel = carouselButton.closest('[data-event-carousel]');
                if (carousel instanceof HTMLElement) {
                    const currentIndex = Number.parseInt(carousel.dataset.currentIndex || '0', 10) || 0;
                    const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
                    if (!slides.length) return;

                    const action = carouselButton.getAttribute('data-carousel-action');
                    const nextIndex = action === 'prev'
                        ? currentIndex - 1
                        : currentIndex + 1;
                    syncPublicCarousel(carousel, nextIndex);
                }
                return;
            }

            const carouselDot = target.closest('[data-carousel-dot]');
            if (carouselDot && carouselDot instanceof HTMLElement) {
                const carousel = carouselDot.closest('[data-event-carousel]');
                if (carousel instanceof HTMLElement) {
                    const index = Number.parseInt(carouselDot.getAttribute('data-image-index') || '0', 10) || 0;
                    syncPublicCarousel(carousel, index);
                }
                return;
            }

            const carouselSlide = target.closest('[data-carousel-slide]');
            if (carouselSlide && carouselSlide instanceof HTMLElement) {
                const carousel = carouselSlide.closest('[data-event-carousel]');
                const card = carouselSlide.closest('.event-card');
                if (!(carousel instanceof HTMLElement) || !(card instanceof HTMLElement)) return;

                const imageUrls = Array.from(carousel.querySelectorAll('[data-carousel-slide]'))
                    .map((slide) => slide.getAttribute('data-image-url'))
                    .filter((url) => !!url);

                const startIndex = Number.parseInt(carouselSlide.getAttribute('data-image-index') || '0', 10) || 0;
                const title = card.querySelector('h4')?.textContent || 'Event image';
                openEventModal(imageUrls, title, startIndex);
                return;
            }

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

    if (eventModal) {
        eventModal.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;

            if (target.matches('[data-modal-close]')) {
                closeEventModal();
            }
        });
    }

    if (eventModalPrev) {
        eventModalPrev.addEventListener('click', () => stepEventModal(-1));
    }

    if (eventModalNext) {
        eventModalNext.addEventListener('click', () => stepEventModal(1));
    }

    document.addEventListener('keydown', (e) => {
        if (!eventModal || !eventModal.classList.contains('is-open')) return;

        if (e.key === 'Escape') {
            closeEventModal();
            return;
        }

        if (e.key === 'ArrowLeft') {
            stepEventModal(-1);
            return;
        }

        if (e.key === 'ArrowRight') {
            stepEventModal(1);
        }
    });

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
        const showContactUnavailableMessage = () => {
            const formData = new FormData(contactForm);

            fetch('/api/contact-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'unavailable',
                    source: 'website-contact-form',
                    fullName: String(formData.get('name') || '').trim(),
                    email: String(formData.get('email') || '').trim(),
                    phone: String(formData.get('phone') || '').trim(),
                    subject: String(formData.get('subject') || '').trim(),
                    message: String(formData.get('message') || '').trim()
                })
            }).catch(() => {
                // Keep UX uninterrupted even if analytics logging fails.
            });

            if (contactUnavailableFacebookLink) {
                const fbLink = document.getElementById('contactFacebookLink');
                if (fbLink && fbLink.href) {
                    contactUnavailableFacebookLink.href = fbLink.href;
                }
            }

            setStatus(contactFormStatus, 'Email service is currently unavailable. Please use Facebook contact instead.', true);
            openContactUnavailableModal();
        };

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showContactUnavailableMessage();
        });

        const contactSubmitButton = contactForm.querySelector('button[type="submit"]');
        if (contactSubmitButton) {
            contactSubmitButton.addEventListener('click', (e) => {
                e.preventDefault();
                showContactUnavailableMessage();
            });
        }
    }

    if (contactUnavailableModal) {
        contactUnavailableModal.addEventListener('click', (event) => {
            if (event.target instanceof HTMLElement && event.target.closest('[data-contact-modal-close]')) {
                closeContactUnavailableModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && contactUnavailableModal.classList.contains('is-open')) {
                closeContactUnavailableModal();
            }
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

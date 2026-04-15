document.addEventListener('DOMContentLoaded', () => {
    const state = {
        sections: {},
        events: [],
        isAdmin: false
    };

    const eventsGrid = document.getElementById('eventsGrid');
    const adminAuthStatus = document.getElementById('adminAuthStatus');
    const adminEditor = document.getElementById('adminEditor');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const adminTopLogoutBtn = document.getElementById('adminTopLogoutBtn');
    const adminSectionsForm = document.getElementById('adminSectionsForm');
    const adminEventForm = document.getElementById('adminEventForm');
    const sectionSaveStatus = document.getElementById('sectionSaveStatus');
    const eventSaveStatus = document.getElementById('eventSaveStatus');
    const adminLoader = document.getElementById('adminLoader');
    const adminLoaderText = document.getElementById('adminLoaderText');
    const adminToastStack = document.getElementById('adminToastStack');
    const eventModal = document.getElementById('eventModal');
    const eventModalImage = document.getElementById('eventModalImage');
    const eventModalCaption = document.getElementById('eventModalCaption');
    const eventModalCounter = document.getElementById('eventModalCounter');
    const eventModalPrev = document.getElementById('eventModalPrev');
    const eventModalNext = document.getElementById('eventModalNext');

    let activeLoaderCount = 0;
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

    function syncAdminCarousel(carousel, index) {
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

    function showLoader(message = 'Working...') {
        if (adminLoaderText) {
            adminLoaderText.textContent = message;
        }

        if (adminLoader) {
            adminLoader.classList.add('visible');
            adminLoader.setAttribute('aria-hidden', 'false');
        }
    }

    function hideLoader() {
        if (!adminLoader) return;
        adminLoader.classList.remove('visible');
        adminLoader.setAttribute('aria-hidden', 'true');
    }

    function removeToast(toastElement) {
        if (!toastElement || toastElement.dataset.removing === '1') return;

        toastElement.dataset.removing = '1';
        toastElement.classList.remove('show');
        setTimeout(() => toastElement.remove(), 180);
    }

    function showToast(message, kind = 'info') {
        if (!adminToastStack || !message) return;

        const toastElement = document.createElement('article');
        toastElement.className = `admin-toast admin-toast-${kind}`;

        const messageElement = document.createElement('p');
        messageElement.textContent = message;

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'admin-toast-close';
        closeButton.setAttribute('aria-label', 'Dismiss notification');
        closeButton.textContent = 'x';

        toastElement.appendChild(messageElement);
        toastElement.appendChild(closeButton);
        adminToastStack.appendChild(toastElement);

        requestAnimationFrame(() => {
            toastElement.classList.add('show');
        });

        const dismissTimer = setTimeout(() => removeToast(toastElement), 3400);
        closeButton.addEventListener('click', () => {
            clearTimeout(dismissTimer);
            removeToast(toastElement);
        });
    }

    async function withLoader(message, action) {
        activeLoaderCount += 1;
        showLoader(message);

        try {
            return await action();
        } finally {
            activeLoaderCount = Math.max(0, activeLoaderCount - 1);
            if (activeLoaderCount === 0) {
                hideLoader();
            }
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

        eventsGrid.innerHTML = state.events.map((event) => {
            const imageUrls = getEventImages(event);
            const coverImageUrl = imageUrls[0] || '';
            const carouselSlides = imageUrls.map((url, index) => `
                <button type="button" class="public-event-slide${index === 0 ? ' is-active' : ''}" data-carousel-slide data-image-index="${index}" data-image-url="${escapeHtml(url)}" aria-label="Open image ${index + 1}">
                    <img src="${escapeHtml(url)}" alt="${escapeHtml(event.title)} image ${index + 1}" class="event-cover" loading="lazy">
                </button>
            `).join('');

            const dots = imageUrls.length > 1
                ? `<div class="public-event-dots">${imageUrls.map((_, index) => `
                        <button type="button" class="public-event-dot${index === 0 ? ' is-active' : ''}" data-carousel-dot data-image-index="${index}" aria-label="View image ${index + 1}"></button>
                    `).join('')}</div>`
                : '';

            return `
            <article class="event-card">
                <div class="event-image-wrap" data-event-carousel data-current-index="0" data-image-count="${imageUrls.length}">
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
                    ${dots}
                    ${state.isAdmin ? `<button type="button" class="btn btn-primary event-delete-btn" data-event-id="${event.id}">Delete Event</button>` : ''}
                </div>
            </article>
        `;
        }).join('');
    }

    async function loadBootstrapData() {
        const data = await apiFetch('/api/bootstrap');
        state.sections = data.sections || {};
        state.events = data.events || [];
        fillAdminFormFromSections();
        renderEvents();
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

        if (adminTopLogoutBtn) {
            adminTopLogoutBtn.style.display = state.isAdmin ? 'inline-flex' : 'none';
        }

        if (adminLoginForm) {
            adminLoginForm.style.display = state.isAdmin ? 'none' : 'block';
        }
    }

    async function logoutAdmin() {
        try {
            await withLoader('Signing out...', async () => {
                await apiFetch('/api/admin-auth', { method: 'DELETE' });
            });
        } catch (error) {
            console.error(error);
            showToast('Failed to logout. Please try again.', 'error');
            return;
        }

        state.isAdmin = false;
        updateAdminState();
        renderEvents();
        setStatus(adminAuthStatus, 'Logged out');
        setStatus(sectionSaveStatus, '');
        setStatus(eventSaveStatus, '');
        showToast('Logged out', 'info');
    }

    async function refreshAdminSession() {
        try {
            const session = await apiFetch('/api/admin-auth', { method: 'GET' });
            state.isAdmin = !!(session && session.authenticated === true);
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
                await withLoader('Signing in...', async () => {
                    await apiFetch('/api/admin-auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                });

                state.isAdmin = true;
                updateAdminState();
                renderEvents();
                setStatus(adminAuthStatus, 'Login successful');
                adminLoginForm.reset();
                showToast('Login successful', 'success');
            } catch (error) {
                setStatus(adminAuthStatus, error.message, true);
                showToast(error.message, 'error');
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', logoutAdmin);
    }

    if (adminTopLogoutBtn) {
        adminTopLogoutBtn.addEventListener('click', logoutAdmin);
    }

    if (adminSectionsForm) {
        adminSectionsForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!state.isAdmin) {
                setStatus(sectionSaveStatus, 'Login is required to edit content', true);
                showToast('Login is required to edit content', 'error');
                return;
            }

            setStatus(sectionSaveStatus, 'Saving sections...');
            const payload = collectSectionPayload();

            try {
                await withLoader('Saving static content...', async () => {
                    await saveSectionsPayload(payload);
                    await loadBootstrapData();
                });
                setStatus(sectionSaveStatus, 'Static content saved');
                showToast('Static content saved', 'success');
            } catch (error) {
                setStatus(sectionSaveStatus, error.message, true);
                showToast(error.message, 'error');
            }
        });
    }

    if (adminEventForm) {
        adminEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!state.isAdmin) {
                setStatus(eventSaveStatus, 'Login is required to upload events', true);
                showToast('Login is required to upload events', 'error');
                return;
            }

            const title = document.getElementById('eventTitle')?.value.trim() || '';
            const eventDate = document.getElementById('eventDate')?.value || '';
            const location = document.getElementById('eventLocation')?.value.trim() || '';
            const files = document.getElementById('eventImages')?.files || [];

            if (!title || !eventDate || !location) {
                setStatus(eventSaveStatus, 'Event title, date, and location are required', true);
                showToast('Event title, date, and location are required', 'error');
                return;
            }

            if (!files.length) {
                setStatus(eventSaveStatus, 'Please select at least one image', true);
                showToast('Please select at least one image', 'error');
                return;
            }

            if (files.length > 10) {
                setStatus(eventSaveStatus, 'Maximum 10 images per event', true);
                showToast('Maximum 10 images per event', 'error');
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
                await withLoader('Uploading event...', async () => {
                    await apiFetch('/api/events', {
                        method: 'POST',
                        body: formData
                    });
                });

                adminEventForm.reset();
                setStatus(eventSaveStatus, 'Event uploaded successfully');
                await loadBootstrapData();
                showToast('Event uploaded successfully', 'success');
            } catch (error) {
                setStatus(eventSaveStatus, error.message, true);
                showToast(error.message, 'error');
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
                    const action = carouselButton.getAttribute('data-carousel-action');
                    const nextIndex = action === 'prev' ? currentIndex - 1 : currentIndex + 1;
                    syncAdminCarousel(carousel, nextIndex);
                }
                return;
            }

            const carouselDot = target.closest('[data-carousel-dot]');
            if (carouselDot && carouselDot instanceof HTMLElement) {
                const carousel = carouselDot.closest('[data-event-carousel]');
                if (carousel instanceof HTMLElement) {
                    const index = Number.parseInt(carouselDot.getAttribute('data-image-index') || '0', 10) || 0;
                    syncAdminCarousel(carousel, index);
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
                await withLoader('Deleting event...', async () => {
                    await apiFetch(`/api/events?eventId=${encodeURIComponent(eventId)}`, {
                        method: 'DELETE'
                    });
                });
                await loadBootstrapData();
                setStatus(eventSaveStatus, 'Event deleted');
                showToast('Event deleted', 'info');
            } catch (error) {
                setStatus(eventSaveStatus, error.message, true);
                showToast(error.message, 'error');
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

    withLoader('Loading admin data...', async () => {
        await Promise.all([loadBootstrapData(), refreshAdminSession()]);
    }).catch((error) => {
        console.error(error);
        setStatus(adminAuthStatus, 'Failed to load admin data', true);
        showToast('Failed to load admin data', 'error');
    });
});

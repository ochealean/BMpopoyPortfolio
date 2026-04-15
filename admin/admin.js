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

    let activeLoaderCount = 0;

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

        eventsGrid.innerHTML = state.events.map((event) => `
            <article class="event-card">
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

    withLoader('Loading admin data...', async () => {
        await Promise.all([loadBootstrapData(), refreshAdminSession()]);
    }).catch((error) => {
        console.error(error);
        setStatus(adminAuthStatus, 'Failed to load admin data', true);
        showToast('Failed to load admin data', 'error');
    });
});

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
    const adminToastStack = document.getElementById('adminToastStack') || document.getElementById('toastStack');
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
        fieldAboutDob: ['about', 'dateOfBirth'],
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

    window.pendingEditEventUploadFiles = window.pendingEditEventUploadFiles || [];

    function syncPendingEditEventUploadInput() {
        const input = document.getElementById('m_add_images');
        if (!input) return;

        try {
            const dataTransfer = new DataTransfer();
            window.pendingEditEventUploadFiles.forEach((file) => dataTransfer.items.add(file));
            input.files = dataTransfer.files;
        } catch {
            input.value = '';
        }
    }

    function renderPendingEditEventUploadPreview() {
        const preview = document.getElementById('m_add_images_preview');
        if (!preview) return;

        if (!window.pendingEditEventUploadFiles.length) {
            preview.innerHTML = '<small style="color:#64748b;">No new images selected.</small>';
            syncPendingEditEventUploadInput();
            return;
        }

        preview.innerHTML = window.pendingEditEventUploadFiles.map((file, index) => {
            const url = URL.createObjectURL(file);
            return `
                <div style="position:relative; width:110px; height:80px; border-radius:10px; overflow:hidden; border:1px solid #e2e8f0; background:#fff;">
                    <img src="${url}" alt="${escapeHtml(file.name)}" style="width:100%; height:100%; object-fit:cover; display:block;">
                    <button type="button" onclick="removePendingEditEventUploadFile(${index})" aria-label="Remove selected image" style="position:absolute; top:6px; right:6px; width:24px; height:24px; border:none; border-radius:999px; background:rgba(220,38,38,0.95); color:#fff; font-size:16px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center;">&times;</button>
                </div>
            `;
        }).join('');

        syncPendingEditEventUploadInput();
    }

    window.renderPendingEditEventUploadPreview = renderPendingEditEventUploadPreview;
    window.syncPendingEditEventUploadInput = syncPendingEditEventUploadInput;

    window.removePendingEditEventUploadFile = (index) => {
        const nextIndex = Number(index);
        if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= window.pendingEditEventUploadFiles.length) return;

        window.pendingEditEventUploadFiles.splice(nextIndex, 1);
        renderPendingEditEventUploadPreview();
    };

    window.resetPendingEditEventUploadState = () => {
        window.pendingEditEventUploadFiles = [];

        const input = document.getElementById('m_add_images');
        if (input) {
            input.value = '';
        }

        const preview = document.getElementById('m_add_images_preview');
        if (preview) {
            preview.innerHTML = '<small style="color:#64748b;">No new images selected.</small>';
        }

        syncPendingEditEventUploadInput();
    };

    window.appendPendingEditEventUploadFiles = (files) => {
        const existingKeys = new Set(
            window.pendingEditEventUploadFiles.map((file) => `${file.name}|${file.size}|${file.lastModified}|${file.type}`)
        );
        const wasUnderLimit = window.pendingEditEventUploadFiles.length < 10;

        for (const file of files) {
            if (window.pendingEditEventUploadFiles.length >= 10) {
                break;
            }

            const key = `${file.name}|${file.size}|${file.lastModified}|${file.type}`;
            if (existingKeys.has(key)) continue;

            window.pendingEditEventUploadFiles.push(file);
            existingKeys.add(key);
        }

        if (wasUnderLimit && window.pendingEditEventUploadFiles.length >= 10) {
            window.adminShowToast?.('10 images maximum only', 'error');
        }
    };

    window.pendingNewEventUploadFiles = window.pendingNewEventUploadFiles || [];

    function syncPendingNewEventUploadInput() {
        const input = document.getElementById('m_new_images');
        if (!input) return;

        try {
            const dataTransfer = new DataTransfer();
            window.pendingNewEventUploadFiles.forEach((file) => dataTransfer.items.add(file));
            input.files = dataTransfer.files;
        } catch {
            input.value = '';
        }
    }

    function renderPendingNewEventUploadPreview() {
        const preview = document.getElementById('m_new_images_preview');
        if (!preview) return;

        if (!window.pendingNewEventUploadFiles.length) {
            preview.innerHTML = '<small style="color:#64748b;">No images selected.</small>';
            syncPendingNewEventUploadInput();
            return;
        }

        preview.innerHTML = window.pendingNewEventUploadFiles.map((file, index) => {
            const url = URL.createObjectURL(file);
            return `
                <div style="position:relative; width:110px; height:80px; border-radius:10px; overflow:hidden; border:1px solid #e2e8f0; background:#fff;">
                    <img src="${url}" alt="${escapeHtml(file.name)}" style="width:100%; height:100%; object-fit:cover; display:block;">
                    <button type="button" onclick="removePendingNewEventUploadFile(${index})" aria-label="Remove selected image" style="position:absolute; top:6px; right:6px; width:24px; height:24px; border:none; border-radius:999px; background:rgba(220,38,38,0.95); color:#fff; font-size:16px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center;">&times;</button>
                </div>
            `;
        }).join('');

        syncPendingNewEventUploadInput();
    }

    window.resetPendingNewEventUploadState = () => {
        window.pendingNewEventUploadFiles = [];

        const input = document.getElementById('m_new_images');
        if (input) {
            input.value = '';
        }

        const preview = document.getElementById('m_new_images_preview');
        if (preview) {
            preview.innerHTML = '<small style="color:#64748b;">No images selected.</small>';
        }

        syncPendingNewEventUploadInput();
    };

    window.renderPendingNewEventUploadPreview = renderPendingNewEventUploadPreview;
    window.syncPendingNewEventUploadInput = syncPendingNewEventUploadInput;

    window.removePendingNewEventUploadFile = (index) => {
        const nextIndex = Number(index);
        if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= window.pendingNewEventUploadFiles.length) return;

        window.pendingNewEventUploadFiles.splice(nextIndex, 1);
        renderPendingNewEventUploadPreview();
    };

    window.appendPendingNewEventUploadFiles = (files) => {
        const existingKeys = new Set(
            window.pendingNewEventUploadFiles.map((file) => `${file.name}|${file.size}|${file.lastModified}|${file.type}`)
        );
        const wasUnderLimit = window.pendingNewEventUploadFiles.length < 10;

        for (const file of files) {
            if (window.pendingNewEventUploadFiles.length >= 10) {
                break;
            }

            const key = `${file.name}|${file.size}|${file.lastModified}|${file.type}`;
            if (existingKeys.has(key)) continue;

            window.pendingNewEventUploadFiles.push(file);
            existingKeys.add(key);
        }

        if (wasUnderLimit && window.pendingNewEventUploadFiles.length >= 10) {
            window.adminShowToast?.('10 images maximum only', 'error');
        }
    };

    window.deleteEventImage = async (imageId) => {
        const modal = document.getElementById('dynamicModal');
        const idx = Number(modal?.dataset.idx);
        const parsedImageId = Number(imageId);

        if (!Number.isInteger(parsedImageId) || parsedImageId <= 0) {
            showToast('Invalid image selected', 'error');
            return;
        }

        if (!confirm('Delete this image permanently?')) return;

        try {
            await apiFetch(`/api/event-image?imageId=${encodeURIComponent(String(parsedImageId))}`, { method: 'DELETE' });
            await loadBootstrapData();
            renderAll();
            if (Number.isInteger(idx) && idx >= 0) {
                openDynamicModal('event', idx);
            }
            showToast('Image deleted', 'info');
        } catch (error) {
            showToast(error.message || 'Failed to delete image', 'error');
        }
    };

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
                ? `${modalState.title} ï¿½ ${modalState.index + 1} of ${modalState.images.length}`
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
        toastElement.className = `toast admin-toast-${kind}`;

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

    window.apiFetch = apiFetch;
    window.escapeHtml = escapeHtml;
    window.adminShowToast = showToast;
    window.adminState = state;

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
        fillDynamicDobInputsFromSections();
        fillCommunityProjectTextFieldsFromSections();
        
        // Refresh dynamic UI (renders legacy "group1", "group2", etc)
        if (typeof renderAllDynamicFields === 'function') {
            renderAllDynamicFields(); 
        }
    }

    function fillDynamicDobInputsFromSections() {
        const container = document.getElementById('fieldDateOfBirthDynamicContainer');
        if (!container) return;
        container.innerHTML = '';
        
        // Load from "about" section
        const dynamicRows = getSectionValue('about', 'dynamicPersonalInfo', []);
        
        // Sync with legacy customFieldsData.group2 if empty (for compatibility during transition)
        if (Array.isArray(dynamicRows) && dynamicRows.length > 0) {
            // Update the legacy storage so the renderAllDynamicFields() can also see it
            if(window.customFieldsData) {
                window.customFieldsData.group2 = dynamicRows.map(row => ({
                    label: row.label,
                    value: row.value,
                    placeholder: row.label
                }));
            }
            if(window.saveCustomFieldsToStorage) {
                window.saveCustomFieldsToStorage();
            }
        }
    }

    function fillCommunityProjectTextFieldsFromSections() {
        const container = document.getElementById('fieldCommunityProjectsDynamicContainer');
        if (!container) return;
        container.innerHTML = '';
        const projectTexts = getSectionValue('stats', 'communityProjectTextFields', []);
        if (Array.isArray(projectTexts)) {
            projectTexts.forEach(val => {
                appendCommunityProjectTextField(val);
            });
        }
    }

    function appendDynamicDobInput(label, value = '') {
        const container = document.getElementById('fieldDateOfBirthDynamicContainer');
        if (!container) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'dynamic-dob-wrapper';
        wrapper.style.display = 'flex';
        wrapper.style.gap = '8px';
        wrapper.style.alignItems = 'center';
        wrapper.dataset.label = label;

        const labelSpan = document.createElement('span');
        labelSpan.textContent = label + ':';
        labelSpan.style.minWidth = '100px';
        labelSpan.style.fontWeight = '500';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'dynamic-dob-input';
        input.value = value;
        input.style.flex = '1';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-outline btn-sm';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Remove this row';
        deleteBtn.onclick = () => wrapper.remove();

        wrapper.appendChild(labelSpan);
        wrapper.appendChild(input);
        wrapper.appendChild(deleteBtn);
        container.appendChild(wrapper);
    }

    function appendCommunityProjectTextField(value = '') {
        const container = document.getElementById('fieldCommunityProjectsDynamicContainer');
        if (!container) return;

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '8px';
        wrapper.style.marginTop = '4px';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'community-project-textfield';
        input.value = value;
        input.placeholder = 'Project detail...';
        input.style.flex = '1';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-outline btn-sm';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = () => wrapper.remove();

        wrapper.appendChild(input);
        wrapper.appendChild(deleteBtn);
        container.appendChild(wrapper);
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

            if (sectionKey === 'stats' && propKey !== 'communityProjectTextFields') {
                const numeric = Number.parseInt(input.value || '0', 10);
                payload[sectionKey][propKey] = Number.isNaN(numeric) ? 0 : numeric;
                return;
            }

            payload[sectionKey][propKey] = input.value.trim();
        });

        // Collect dynamic DOB rows (legacy sync)
        const dobRows = [];
        
        // Use window relative access to avoid ReferenceError if the closure is still parsing
        const legacyData = window.customFieldsData || {};
        
        // 1. Check legacy customFieldsData.group2 (where Add Custom Field button saves data)
        if (Array.isArray(legacyData.group2)) {
            legacyData.group2.forEach(f => {
                dobRows.push({ label: f.label, value: f.value });
            });
        }
        
        // 2. Also check if there are any .dynamic-dob-wrapper elements in the DOM
        document.querySelectorAll('.dynamic-dob-wrapper').forEach(wrapper => {
            const label = wrapper.dataset.label;
            const value = wrapper.querySelector('.dynamic-dob-input').value;
            // Avoid duplicates
            if (!dobRows.find(r => r.label === label)) {
                dobRows.push({ label, value });
            }
        });
        
        payload.about.dynamicPersonalInfo = dobRows;

        // Collect community projects textfields
        const projectTexts = [];
        document.querySelectorAll('.community-project-textfield').forEach(input => {
            projectTexts.push(input.value.trim());
        });
        payload.stats.communityProjectTextFields = projectTexts;

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
    window.saveSectionsPayload = saveSectionsPayload;

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
        store.events = Array.isArray(state.events) ? state.events.map((event) => ({
            id: event.id,
            title: event.title,
            eventDate: event.eventDate,
            location: event.location,
            coverImageUrl: event.coverImageUrl || '',
            imageUrls: Array.isArray(event.imageUrls) ? event.imageUrls : [],
            imageIds: Array.isArray(event.imageIds) ? event.imageIds : [],
            imageCount: Number(event.imageCount || (Array.isArray(event.imageUrls) ? event.imageUrls.length : 0) || (event.coverImageUrl ? 1 : 0))
        })) : [];
        fillAdminFormFromSections();
        renderEvents();
        if (typeof window.renderEventsAdmin === 'function') {
            window.renderEventsAdmin();
        }
    }

    window.loadBootstrapData = loadBootstrapData;

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
        window.location.replace('./admin_login.html');
    }

    async function refreshAdminSession() {
        try {
            const session = await apiFetch('/api/admin-auth', { method: 'GET' });
            state.isAdmin = !!(session && session.authenticated === true);
        } catch {
            state.isAdmin = false;
            window.location.replace('./admin_login.html');
            return;
        }

        updateAdminState();
        renderEvents();
    }

    window.refreshAdminSession = refreshAdminSession;

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

            // Sync legacy dynamic fields (Personal Info rows from Group 2)
            const group2Fields = collectGroup2DynamicFieldsPayload(); 
            if (group2Fields.length > 0) {
                payload.about.dynamicPersonalInfo = group2Fields;
            }

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

    function collectGroup2DynamicFieldsPayload() {
        const results = [];
        // Group 2 is the contact/personal info section in the legacy script
        const fields = window.customFieldsData ? window.customFieldsData.group2 || [] : [];
        fields.forEach(f => {
            results.push({ label: f.label, value: f.value });
        });
        return results;
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
                setStatus(eventSaveStatus, '10 images maximum only', true);
                showToast('10 images maximum only', 'error');
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
        // Move dynamic field logic to local scope within the closure to avoid global collisions
        // but ensure they are available to the functions that need them.
        if (typeof loadCustomFieldsFromStorage === 'function') {
            await loadCustomFieldsFromStorage(); 
        }
        if (typeof loadFromStorage === 'function') {
            await loadFromStorage();
        }
        await Promise.all([loadBootstrapData(), refreshAdminSession()]);
    }).catch((error) => {
        console.error(error);
        setStatus(adminAuthStatus, 'Failed to load admin data', true);
        showToast('Failed to load admin data', 'error');
    });
});
window.__disableLegacyAdminBlock = true;
(function(){
            if (window.__disableLegacyAdminBlock) {
                return;
            }
            // DYNAMIC FIELDS MANAGER - Supports 4 independent groups (group1, group2, group3, group4)
            let customFieldsData = {
                group1: [],  // hero/about section
                group2: [],  // contact section
                group3: [],  // stats section
                group4: []   // vision/quote section
            };
            window.customFieldsData = customFieldsData; // Expose globally for payload collection logic

            // Load from database (legacy sync fallback)
            async function loadCustomFieldsFromStorage(){
                try {
                    const response = await apiFetch('/api/sections?key=dynamic_fields_v2');
                    if(response && response.section && response.section.value){
                        const parsed = response.section.value;
                        if(parsed.group1) customFieldsData.group1 = parsed.group1;
                        if(parsed.group2) customFieldsData.group2 = parsed.group2;
                        if(parsed.group3) customFieldsData.group3 = parsed.group3;
                        if(parsed.group4) customFieldsData.group4 = parsed.group4;
                    }
                } catch(e) {}
                renderAllDynamicFields();
            }
            window.loadCustomFieldsFromStorage = loadCustomFieldsFromStorage; // Expose globally
            async function saveCustomFieldsToStorage(){
                if (!state.isAdmin) return;
                try {
                    await apiFetch('/api/sections', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            key: 'dynamic_fields_v2',
                            value: {
                                group1: customFieldsData.group1,
                                group2: customFieldsData.group2,
                                group3: customFieldsData.group3,
                                group4: customFieldsData.group4
                            }
                        })
                    });
                } catch(e) {
                    console.error("Failed to save dynamic fields to database:", e);
                }
            }
            window.saveCustomFieldsToStorage = saveCustomFieldsToStorage; // Expose globally

            function renderDynamicFields(containerId, groupKey){
                const container = document.getElementById(containerId);
                if(!container) return;
                const fields = customFieldsData[groupKey] || [];
                if(fields.length === 0){
                    container.innerHTML = '';
                    return;
                }
                container.innerHTML = fields.map((field, idx) => `
                    <div class="dynamic-field-row" data-field-idx="${idx}" data-group="${groupKey}">
                        <div class="field-input-wrapper">
                            <label><i class="fas fa-pen-alt"></i> ${escapeHtml(field.label)}</label>
                            <input type="text" class="dynamic-field-value" data-idx="${idx}" data-group="${groupKey}" value="${escapeHtml(field.value || '')}" placeholder="${escapeHtml(field.placeholder || 'Enter value')}">
                        </div>
                        <button type="button" class="btn btn-danger btn-sm delete-dynamic-field" data-idx="${idx}" data-group="${groupKey}"><i class="fas fa-trash-alt"></i> Delete</button>
                    </div>
                `).join('');
                // attach change listeners
                document.querySelectorAll(`#${containerId} .dynamic-field-value`).forEach(inp => {
                    inp.removeEventListener('change', handleDynamicInputChange);
                    inp.addEventListener('change', handleDynamicInputChange);
                });
                document.querySelectorAll(`#${containerId} .delete-dynamic-field`).forEach(btn => {
                    btn.removeEventListener('click', handleDeleteField);
                    btn.addEventListener('click', handleDeleteField);
                });
            }

            function handleDynamicInputChange(e){
                const input = e.target;
                const idx = parseInt(input.getAttribute('data-idx'));
                const group = input.getAttribute('data-group');
                if(!isNaN(idx) && group && customFieldsData[group] && customFieldsData[group][idx]){
                    customFieldsData[group][idx].value = input.value;
                    saveCustomFieldsToStorage();
                }
            }

            function handleDeleteField(e){
                const btn = e.currentTarget;
                const idx = parseInt(btn.getAttribute('data-idx'));
                const group = btn.getAttribute('data-group');
                if(!isNaN(idx) && customFieldsData[group]){
                    customFieldsData[group].splice(idx, 1);
                    saveCustomFieldsToStorage();
                    renderAllDynamicFields();
                    showToast("Custom field removed", "info");
                }
            }

            function renderAllDynamicFields(){
                renderDynamicFields('dynamicFieldsContainer1', 'group1');
                renderDynamicFields('dynamicFieldsContainer2', 'group2');
                renderDynamicFields('dynamicFieldsContainer3', 'group3');
                renderDynamicFields('dynamicFieldsContainer4', 'group4');
            }
            window.renderAllDynamicFields = renderAllDynamicFields; // Expose globally

            // Modal handling
            let pendingGroup = null;
            let pendingContainerId = null;
            function openAddFieldModal(groupKey, containerId){
                pendingGroup = groupKey;
                pendingContainerId = containerId;
                const modal = document.getElementById('dynamicFieldModal');
                document.getElementById('modalFieldLabel').value = '';
                document.getElementById('modalFieldPlaceholder').value = '';
                modal.classList.add('active');
            }
            function closeModal(){ document.getElementById('dynamicFieldModal').classList.remove('active'); pendingGroup=null; }
            function createFieldFromModal(){
                const label = document.getElementById('modalFieldLabel').value.trim();
                if(!label){
                    showToast("Please enter a field label", "error");
                    return;
                }
                const placeholder = document.getElementById('modalFieldPlaceholder').value.trim();
                if(pendingGroup && customFieldsData[pendingGroup] !== undefined){
                    customFieldsData[pendingGroup].push({ label: label, placeholder: placeholder || label, value: '' });
                    saveCustomFieldsToStorage();
                    renderAllDynamicFields();
                    showToast(`Added field: "${label}"`, "success");
                    closeModal();
                } else {
                    showToast("Error: group not found", "error");
                }
            }

            // Toast & helpers
            function showToast(msg, type="info"){
                const stack = document.getElementById('adminToastStack') || document.getElementById('toastStack');
                if(!stack) return;
                const toast = document.createElement('div');
                toast.className = `toast admin-toast-${type}`;
                toast.innerHTML = `<p><i class="fas ${type==='success'?'fa-check-circle':type==='error'?'fa-exclamation-triangle':'fa-info-circle'}"></i> ${escapeHtml(msg)}</p><button class="admin-toast-close">&times;</button>`;
                stack.appendChild(toast);
                setTimeout(()=>toast.remove(), 3500);
                toast.querySelector('.admin-toast-close')?.addEventListener('click',()=>toast.remove());
            }
            function escapeHtml(str){ return String(str||'').replace(/[&<>]/g, function(m){if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m;}); }

            // ---- ORIGINAL ADMIN BACKEND SIMULATION (kept for functionality) -----
            let state = { isAdmin: false, sections: {}, events: [] };
            const eventsGrid = document.getElementById('eventsGrid');
            const adminAuthStatus = document.getElementById('adminAuthStatus');
            const adminEditor = document.getElementById('adminEditor');
            const adminLoginForm = document.getElementById('adminLoginForm');
            const adminLogoutBtn = document.getElementById('adminLogoutBtn');
            const adminTopLogoutBtn = document.getElementById('adminTopLogoutBtn');
            const adminSectionsForm = document.getElementById('adminSectionsForm');
            const adminEventForm = document.getElementById('adminEventForm');
            const sectionSaveStatus = document.getElementById('sectionSaveStatus');


            async function refreshSession(){ try{ const s = await apiFetch('/api/admin-auth'); state.isAdmin = !!(s && s.authenticated); }catch(e){ state.isAdmin=false; } updateAdminState(); renderEvents(); }
            async function logout(){ await apiFetch('/api/admin-auth',{method:'DELETE'}); state.isAdmin=false; updateAdminState(); renderEvents(); showToast("Logged out","info"); }
            adminLoginForm?.addEventListener('submit', async(e)=>{ e.preventDefault(); const email=document.getElementById('adminEmail').value, pwd=document.getElementById('adminPassword').value; try{ await apiFetch('/api/admin-auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pwd})}); state.isAdmin=true; updateAdminState(); renderEvents(); showToast("Login successful","success"); adminLoginForm.reset(); }catch(err){ showToast(err.message,"error"); } });
            adminLogoutBtn?.addEventListener('click',logout); adminTopLogoutBtn?.addEventListener('click',logout);
            adminSectionsForm?.addEventListener('submit', async(e)=>{ 
                // This duplicate listener is causing 404s by calling /api/sections/meta
                // The main handler above correctly uses /api/sections
                // We'll let the main handler handle the submission
                return;
            });
            function setStatus(el,msg,isErr=false){ if(!el)return; el.innerText=msg; el.classList.toggle('error', isErr); el.classList.toggle('success', !isErr && !!msg); }
            eventsGrid?.addEventListener('click', async(e)=>{
                const button = e.target.closest?.('.event-delete-btn');
                if (!button || !state.isAdmin) return;

                const id = button.getAttribute('data-event-id') || button.getAttribute('data-id');
                if (!id) {
                    showToast('Invalid event selected', 'error');
                    return;
                }

                if (!confirm('Delete this event permanently?')) return;

                try {
                    await apiFetch(`/api/events?eventId=${encodeURIComponent(id)}`, { method: 'DELETE' });
                    await loadBootstrapData();
                    renderAll();
                    showToast('Event deleted', 'info');
                } catch (error) {
                    showToast(error.message || 'Failed to delete event', 'error');
                }
            });
            adminEventForm?.addEventListener('submit', async(e)=>{ e.preventDefault(); if(!state.isAdmin){ showToast("Login required","warning"); return; } const fd=new FormData(); fd.append('title',document.getElementById('eventTitle').value); fd.append('eventDate',document.getElementById('eventDate').value); fd.append('location',document.getElementById('eventLocation').value); const files=document.getElementById('eventImages').files; for(let f of files) fd.append('images',f); try{ await apiFetch('/api/events',{method:'POST',body:fd}); document.getElementById('adminEventForm').reset(); await loadBootstrapData(); showToast("Event uploaded","success"); }catch(err){ showToast(err.message,"error"); } });
            
            // Initialize
            // loadCustomFieldsFromStorage();
            // Promise.all([loadBootstrapData(), refreshSession()]).catch(console.warn);
            document.getElementById('cancelModalBtn')?.addEventListener('click',closeModal);
            document.getElementById('confirmCreateFieldBtn')?.addEventListener('click',createFieldFromModal);
            document.querySelectorAll('.add-field-btn').forEach(btn=>{ btn.addEventListener('click',(e)=>{ const group = btn.getAttribute('data-target-group'); const container = btn.getAttribute('data-container'); if(group && container) openAddFieldModal(group, container); }); });
            window.addEventListener('click',(e)=>{ if(e.target === document.getElementById('dynamicFieldModal')) closeModal(); });
        })();

        
    const apiFetch = window.apiFetch || (async (url, options = {}) => {
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
    });

    const escapeHtml = window.escapeHtml || function(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const showToast = window.adminShowToast || function(message, kind = 'warning') {
        if (!message) return;
        if (String(message).toLowerCase().includes('login required')) {
            return;
        }
        if (kind === 'error') {
            showToast(message);
            console.error(message);
            return;
        }
        console.log(message);
    };
    const state = window.adminState || { isAdmin: false };

    let store = {
        statsArray: [],   // will hold { id, label, value }
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
        organizations: [
            { name: "Rotary International", role: "Public Image", icon: "globe" },
            { name: "Lions International", role: "Vice President", icon: "paw" },
            { name: "Provincial Board Members League of the Philippines (PBMLP)", role: "Treasurer — Region III", icon: "landmark" },
            { name: "Eagles 1Bataan", role: "Member", icon: "shield-alt" }
        ],
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

    // Helper: initialize statsArray
    function initStatsArray() {
        if (!store.statsArray || store.statsArray.length === 0) {
            store.statsArray = [
                { id: 1001, label: "Community Projects", value: 124 },
                { id: 1002, label: "Ordinances Authored", value: 57 },
                { id: 1003, label: "Families Served", value: 12800 }
            ];
        }
    }

    async function hydrateStatsArrayFromSections() {
        try {
            const response = await apiFetch('/api/sections?key=stats');
            const stats = response && response.section ? response.section.value : null;

            if (!stats || (store.statsArray && store.statsArray.length > 0)) return;

            const nextStats = [];
            if (Number.isFinite(Number(stats.communityProjects))) {
                nextStats.push({ id: 1001, label: 'Community Projects', value: Number(stats.communityProjects) });
            }
            if (Number.isFinite(Number(stats.ordinancesAuthored))) {
                nextStats.push({ id: 1002, label: 'Ordinances Authored', value: Number(stats.ordinancesAuthored) });
            }
            if (Number.isFinite(Number(stats.familiesServed))) {
                nextStats.push({ id: 1003, label: 'Families Served', value: Number(stats.familiesServed) });
            }

            if (nextStats.length) {
                store.statsArray = nextStats;
            }
        } catch (error) {
            console.warn('Failed to hydrate stats from sections:', error);
        }
    }

    function normalizeStatLabel(label) {
        return String(label || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    function mapStatsArrayToSectionStats(statsArray, currentStats = {}) {
        const mapped = { ...currentStats };

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

    async function persistToStorage() {
        try {
            const toStore = { ...store };

            await window.saveSectionsPayload?.({
                admin_store_data: toStore
            });
            console.log("Data persisted to database");
        } catch (error) {
            console.error("Failed to persist data to database:", error);
            showToast("Failed to save to database", "error");
        }
    }

    async function loadFromStorage() {
        try {
            const response = await apiFetch('/api/sections?key=admin_store_data');
            if (response && response.section && response.section.value) {
                const data = response.section.value;
                Object.assign(store, data);
                console.log("Data loaded from database");
            }
        } catch (error) {
            console.warn("No previous database store found or error loading, using defaults:", error);
        }
        if (!Array.isArray(store.statsArray) || store.statsArray.length === 0) {
            await hydrateStatsArrayFromSections();
        }
        initStatsArray();
        renderAll();
    }
    window.loadFromStorage = loadFromStorage;

    function renderAll() {
        renderStatsEditor();     
        renderVisionMission();
        renderEducation();
        renderCareer();
        renderOrganizations();
        renderCommittees();
        renderAdvocacies();
        renderAchievements();
        renderEventsAdmin();
    }

    function renderStatsEditor() {
        const container = document.getElementById("statsEditor");
        if (!container) return;
        if (!store.statsArray.length) {
            container.innerHTML = '<div class="empty-msg">No statistics added yet.</div>';
            return;
        }
        let html = '<div class="stats-flex" style="flex-direction: column;">';
        store.statsArray.forEach(stat => {
            const logoHtml = getStatLogoMarkup(stat);
            html += `
                <div class="dynamic-stat-item" data-id="${stat.id}">
                    <div class="stat-header">
                        <span class="stat-name">${logoHtml} ${escapeHtml(stat.label)}</span>
                        <div>
                            <button class="btn btn-outline btn-sm" onclick="editStatLabel(${stat.id})" style="margin-right: 6px;"><i class="fas fa-pen"></i> Rename</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteStatRow(${stat.id})"><i class="fas fa-trash"></i> Remove</button>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 8px;">
                        <input type="number" id="stat_val_${stat.id}" class="stat-value-input" value="${Number(stat.value) || 0}">
                        <button class="btn btn-primary btn-sm" onclick="updateStatValue(${stat.id})"><i class="fas fa-save"></i> Save Value</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function getStatLogoMarkup(stat) {
        if (!stat) {
            return '<i class="fas fa-chart-simple"></i>';
        }

        if (stat.logoType === 'upload' && stat.logoValue) {
            return `<img src="${escapeHtml(stat.logoValue)}" alt="${escapeHtml(stat.label || 'Stat logo')}" style="width:18px; height:18px; object-fit:cover; border-radius:4px; vertical-align:middle; margin-right:6px;">`;
        }

        const icon = stat.logoValue || 'chart-simple';
        return `<i class="fas fa-${escapeHtml(icon)}"></i>`;
    }

    window.updateStatValue = (id) => {
        const input = document.getElementById(`stat_val_${id}`);
        if (!input) return;
        let newVal = parseInt(input.value);
        if (isNaN(newVal)) newVal = 0;
        const statIdx = store.statsArray.findIndex(s => s.id === id);
        if (statIdx !== -1) {
            store.statsArray[statIdx].value = newVal;
            persistToStorage();
            showToast(`✅ "${store.statsArray[statIdx].label}" updated to ${newVal}`);
            renderStatsEditor();
        }
    };
    window.editStatLabel = (id) => {
        const stat = store.statsArray.find(s => s.id === id);
        if (!stat) return;
        const newLabel = prompt("Enter new label for this statistic:", stat.label);
        if (newLabel && newLabel.trim()) {
            stat.label = newLabel.trim();
            persistToStorage();
            renderStatsEditor();
            showToast(`Label changed to "${stat.label}"`);
        }
    };
    window.deleteStatRow = (id) => {
        if (confirm("Remove this statistic row permanently?")) {
            store.statsArray = store.statsArray.filter(s => s.id !== id);
            persistToStorage();
            renderStatsEditor();
            showToast("Stat row removed");
        }
    };

    function openAddStatModal() {
        const modal = document.getElementById("addStatModal");
        document.getElementById("newStatLabel").value = "";
        document.getElementById("newStatValue").value = "0";
        const logoType = document.getElementById("newStatLogoType");
        const logoIcon = document.getElementById("newStatLogoIcon");
        const logoUpload = document.getElementById("newStatLogoUpload");
        const logoPreview = document.getElementById("newStatLogoPreview");

        if (logoType) logoType.value = 'icon';
        setNewStatLogoIcon('chart-simple');
        if (logoUpload) logoUpload.value = '';
        if (logoPreview) {
            logoPreview.innerHTML = '<i class="fas fa-image"></i>';
        }
        updateNewStatLogoModalState();
        modal.classList.add("active");
    }

    function setNewStatLogoIcon(iconName) {
        const logoIconInput = document.getElementById("newStatLogoIcon");
        const iconButtons = document.querySelectorAll('.logo-icon-choice');

        if (logoIconInput) {
            logoIconInput.value = iconName;
        }

        iconButtons.forEach((button) => {
            button.classList.toggle('is-selected', button.getAttribute('data-logo-icon') === iconName);
        });
    }
    function updateNewStatLogoModalState() {
        const logoType = document.getElementById("newStatLogoType");
        const logoIconWrap = document.getElementById("newStatLogoIconWrap");
        const logoUploadWrap = document.getElementById("newStatLogoUploadWrap");
        if (!logoType) return;

        const isUpload = logoType.value === 'upload';
        if (logoIconWrap) logoIconWrap.style.display = isUpload ? 'none' : 'block';
        if (logoUploadWrap) logoUploadWrap.style.display = isUpload ? 'block' : 'none';
    }

    function updateNewStatLogoPreview() {
        const logoUploadInput = document.getElementById("newStatLogoUpload");
        const logoPreview = document.getElementById("newStatLogoPreview");
        const file = logoUploadInput?.files?.[0];

        if (!logoPreview) return;

        if (!file) {
            logoPreview.innerHTML = '<i class="fas fa-image"></i>';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            logoPreview.innerHTML = `<img src="${String(reader.result || '')}" alt="Logo preview" style="width:100%; height:100%; object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
    }

    async function readFileAsDataUrl(file) {
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Failed to read image'));
            reader.readAsDataURL(file);
        });
    }

    window.confirmAddStat = async () => {
        const labelInput = document.getElementById("newStatLabel");
        const valueInput = document.getElementById("newStatValue");
        const logoTypeInput = document.getElementById("newStatLogoType");
        const logoIconInput = document.getElementById("newStatLogoIcon");
        const logoUploadInput = document.getElementById("newStatLogoUpload");
        const logoPreview = document.getElementById("newStatLogoPreview");
        const label = labelInput.value.trim();
        if (!label) { showToast("Please enter a stat label", "error"); return; }
        let val = parseInt(valueInput.value);
        if (isNaN(val)) val = 0;
        const newId = Date.now();

        const logoType = logoTypeInput?.value === 'upload' ? 'upload' : 'icon';
        let logoValue = logoIconInput?.value || 'chart-simple';

        if (logoType === 'upload') {
            const file = logoUploadInput?.files?.[0];
            if (file) {
                logoValue = await readFileAsDataUrl(file);
            } else if (logoPreview) {
                showToast('Please choose a logo image to upload', 'error');
                return;
            }
        }

        store.statsArray.push({ id: newId, label: label, value: val, logoType, logoValue });
        persistToStorage();
        renderStatsEditor();
        document.getElementById("addStatModal").classList.remove("active");
        showToast(`➕ Added new stat: "${label}"`);
    };

    function renderVisionMission() {
        const container = document.getElementById("visionMissionEditor");
        if (!container) return;
        container.innerHTML = `
            <div class="items-grid">
                <div style="background:#f9fef5; padding:16px; border-radius:12px; margin-bottom:12px;">
                    <label style="font-weight:700;">Vision:</label>
                    <textarea id="visionTextArea" rows="2" style="width:100%; margin-top:8px; border-radius:8px; border:1px solid #e2e8f0; padding:12px;">${escapeHtml(store.vision || '')}</textarea>
                </div>
                <div style="background:#f9fef5; padding:16px; border-radius:12px; margin-bottom:12px;">
                    <label style="font-weight:700;">Mission:</label>
                    <textarea id="missionTextArea" rows="2" style="width:100%; margin-top:8px; border-radius:8px; border:1px solid #e2e8f0; padding:12px;">${escapeHtml(store.mission || '')}</textarea>
                </div>
                <button class="btn btn-primary" onclick="saveVisionMission()" style="width:fit-content;"><i class="fas fa-save"></i> Save Vision & Mission</button>
            </div>
        `;
    }
    window.saveVisionMission = async () => {
        store.vision = document.getElementById("visionTextArea").value;
        store.mission = document.getElementById("missionTextArea").value;
        await persistToStorage();
        showToast("Vision/Mission saved", "success");
        renderVisionMission();
    };

    function renderEducation() {
        const container = document.getElementById("educationList");
        if (!container) return;
        if(store.education.length===0) { container.innerHTML='<div class="empty-msg">No education entries</div>'; return; }
        container.innerHTML = store.education.map((edu, idx) => `
            <div class="item-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                <div><strong>${escapeHtml(edu.yearRange || '')}</strong> – ${escapeHtml(edu.level || '')}<br><small>${escapeHtml(edu.school || '')} ${escapeHtml(edu.course || '')}</small></div>
                <div class="item-actions">
                    <button class="btn btn-outline btn-sm" onclick="editEducation(${idx})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEducation(${idx})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
    function renderCareer() {
        const container = document.getElementById("careerList");
        if (!container) return;
        if(store.career.length===0) { container.innerHTML='<div class="empty-msg">No career entries</div>'; return; }
        container.innerHTML = store.career.map((c, idx) => `
            <div class="item-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                <div><strong>${escapeHtml(c.period || '')}</strong> – ${escapeHtml(c.title || '')}<br><small>${escapeHtml(c.org || '')}</small></div>
                <div class="item-actions">
                    <button class="btn btn-outline btn-sm" onclick="editCareer(${idx})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCareer(${idx})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    const ORGANIZATION_ICON_OPTIONS = [
        'globe', 'users', 'landmark', 'shield-alt', 'paw',
        'building-columns', 'city', 'briefcase', 'handshake', 'people-group',
        'graduation-cap', 'book', 'book-open', 'school', 'chalkboard-teacher',
        'heart', 'hands-helping', 'hospital', 'leaf', 'tree',
        'gavel', 'balance-scale', 'flag', 'award', 'star',
        'medal', 'trophy', 'ribbon', 'bullhorn', 'megaphone',
        'church', 'mosque', 'place-of-worship', 'pray', 'cross',
        'seedling', 'recycle', 'water', 'fire', 'mountain',
        'ship', 'anchor', 'truck', 'road', 'plane',
        'wifi', 'laptop', 'microchip', 'tools', 'wrench'
    ];

    const CAREER_ICON_OPTIONS = [
        'briefcase', 'suitcase', 'chart-line', 'chart-bar', 'gavel',
        'handshake', 'person-chalkboard', 'users', 'people-group', 'user-tie',
        'star', 'award', 'trophy', 'medal', 'ribbon',
        'graduation-cap', 'book', 'certificate', 'id-badge', 'toolbox',
        'wrench', 'hammer', 'screwdriver-wrench', 'cog', 'sliders',
        'laptop', 'desktop', 'keyboard', 'computer-mouse', 'display',
        'building', 'building-columns', 'landmark', 'house', 'city',
        'industry', 'helmet-safety', 'road', 'truck', 'plane',
        'file-signature', 'network-wired', 'diagram-project', 'sitemap', 'globe',
        'clipboard', 'clipboard-check', 'file', 'file-contract', 'file-invoice'
    ];

    const ADVOCACY_ICON_OPTIONS = Array.from(new Set([
        ...ORGANIZATION_ICON_OPTIONS,
        ...CAREER_ICON_OPTIONS
    ]));

    function getOrganizationLogoState(org) {
        if (org?.logoType === 'upload' && org?.logoValue) {
            return {
                logoType: 'upload',
                logoValue: String(org.logoValue)
            };
        }

        const icon = String(org?.logoValue || org?.icon || 'globe').trim() || 'globe';
        return {
            logoType: 'icon',
            logoValue: icon
        };
    }

    function getOrganizationLogoMarkup(org) {
        const logo = getOrganizationLogoState(org);

        if (logo.logoType === 'upload' && logo.logoValue) {
            return `<img src="${escapeHtml(logo.logoValue)}" alt="${escapeHtml(org?.name || 'Organization logo')}" style="width:20px; height:20px; object-fit:cover; border-radius:5px; vertical-align:middle; margin-right:8px; border:1px solid #e2e8f0;">`;
        }

        return `<i class="fas fa-${escapeHtml(logo.logoValue)}" style="margin-right:8px;"></i>`;
    }

    function setOrganizationLogoPreview(dataUrl) {
        const preview = document.getElementById('m_logo_upload_preview');
        if (!preview) return;

        if (!dataUrl) {
            preview.innerHTML = '<i class="fas fa-image"></i>';
            return;
        }

        preview.innerHTML = `<img src="${escapeHtml(dataUrl)}" alt="Logo preview" style="width:100%; height:100%; object-fit:cover;">`;
    }

    function setOrganizationLogoIcon(iconName) {
        const iconInput = document.getElementById('m_logo_icon');
        if (iconInput) {
            iconInput.value = iconName;
        }

        document.querySelectorAll('#m_logo_icon_grid .logo-icon-choice').forEach((button) => {
            button.classList.toggle('is-selected', button.getAttribute('data-logo-icon') === iconName);
        });
    }

    function updateOrganizationLogoModalState() {
        const logoTypeInput = document.getElementById('m_logo_type');
        const iconWrap = document.getElementById('m_logo_icon_wrap');
        const uploadWrap = document.getElementById('m_logo_upload_wrap');
        if (!logoTypeInput) return;

        const isUpload = logoTypeInput.value === 'upload';
        if (iconWrap) iconWrap.style.display = isUpload ? 'none' : 'block';
        if (uploadWrap) uploadWrap.style.display = isUpload ? 'block' : 'none';
    }

    async function updateOrganizationLogoPreviewFromFile() {
        const fileInput = document.getElementById('m_logo_upload');
        const dataInput = document.getElementById('m_logo_upload_data');
        const file = fileInput?.files?.[0];

        if (!dataInput) return;

        if (!file) {
            setOrganizationLogoPreview(dataInput.value || '');
            return;
        }

        try {
            const dataUrl = await readFileAsDataUrl(file);
            dataInput.value = dataUrl;
            setOrganizationLogoPreview(dataUrl);
        } catch {
            showToast('Failed to read logo image', 'error');
        }
    }

    function bindOrganizationLogoModalHandlers() {
        const logoTypeInput = document.getElementById('m_logo_type');
        const iconGrid = document.getElementById('m_logo_icon_grid');
        const uploadInput = document.getElementById('m_logo_upload');

        logoTypeInput?.addEventListener('change', updateOrganizationLogoModalState);
        iconGrid?.addEventListener('click', (event) => {
            const button = event.target instanceof HTMLElement ? event.target.closest('.logo-icon-choice') : null;
            if (!(button instanceof HTMLElement)) return;
            const iconName = button.getAttribute('data-logo-icon');
            if (!iconName) return;
            setOrganizationLogoIcon(iconName);
        });
        uploadInput?.addEventListener('change', () => {
            updateOrganizationLogoPreviewFromFile();
        });

        updateOrganizationLogoModalState();
    }

    // Career Logo Helper Functions
    function getCareerLogoState(career) {
        if (career?.logoType === 'upload' && career?.logoValue) {
            return {
                logoType: 'upload',
                logoValue: String(career.logoValue)
            };
        }

        const iconCandidate = String(career?.logoValue || 'briefcase').trim() || 'briefcase';
        const icon = CAREER_ICON_OPTIONS.includes(iconCandidate) ? iconCandidate : 'briefcase';
        return {
            logoType: 'icon',
            logoValue: icon
        };
    }

    function setCareerLogoPreview(dataUrl) {
        const preview = document.getElementById('m_career_logo_upload_preview');
        if (!preview) return;

        if (!dataUrl) {
            preview.innerHTML = '<i class="fas fa-image"></i>';
            return;
        }

        preview.innerHTML = `<img src="${escapeHtml(dataUrl)}" alt="Logo preview" style="width:100%; height:100%; object-fit:cover;">`;
    }

    function setCareerLogoIcon(iconName) {
        const iconInput = document.getElementById('m_career_logo_icon');
        if (iconInput) {
            iconInput.value = iconName;
        }

        document.querySelectorAll('#m_career_logo_icon_grid .logo-icon-choice').forEach((button) => {
            button.classList.toggle('is-selected', button.getAttribute('data-logo-icon') === iconName);
        });
    }

    function updateCareerLogoModalState() {
        const logoTypeInput = document.getElementById('m_career_logo_type');
        const iconWrap = document.getElementById('m_career_logo_icon_wrap');
        const uploadWrap = document.getElementById('m_career_logo_upload_wrap');
        if (!logoTypeInput) return;

        const isUpload = logoTypeInput.value === 'upload';
        if (iconWrap) iconWrap.style.display = isUpload ? 'none' : 'block';
        if (uploadWrap) uploadWrap.style.display = isUpload ? 'block' : 'none';
    }

    async function updateCareerLogoPreviewFromFile() {
        const fileInput = document.getElementById('m_career_logo_upload');
        const dataInput = document.getElementById('m_career_logo_upload_data');
        const file = fileInput?.files?.[0];

        if (!dataInput) return;

        if (!file) {
            setCareerLogoPreview(dataInput.value || '');
            return;
        }

        try {
            const dataUrl = await readFileAsDataUrl(file);
            dataInput.value = dataUrl;
            setCareerLogoPreview(dataUrl);
        } catch {
            showToast('Failed to read logo image', 'error');
        }
    }

    function bindCareerLogoModalHandlers() {
        const logoTypeInput = document.getElementById('m_career_logo_type');
        const iconGrid = document.getElementById('m_career_logo_icon_grid');
        const uploadInput = document.getElementById('m_career_logo_upload');

        logoTypeInput?.addEventListener('change', updateCareerLogoModalState);
        iconGrid?.addEventListener('click', (event) => {
            const button = event.target instanceof HTMLElement ? event.target.closest('.logo-icon-choice') : null;
            if (!(button instanceof HTMLElement)) return;
            const iconName = button.getAttribute('data-logo-icon');
            if (!iconName) return;
            setCareerLogoIcon(iconName);
        });
        uploadInput?.addEventListener('change', () => {
            updateCareerLogoPreviewFromFile();
        });

        updateCareerLogoModalState();
    }

    // Advocacy Logo Helper Functions
    function guessAdvocacyIconFromTitle(title) {
        const lowered = String(title || '').toLowerCase();
        if (lowered.includes('education')) return 'graduation-cap';
        if (lowered.includes('health')) return 'hospital';
        if (lowered.includes('environment')) return 'leaf';
        if (lowered.includes('social')) return 'hands-helping';
        if (lowered.includes('infrastructure')) return 'road';
        if (lowered.includes('youth')) return 'users';
        return 'star';
    }

    function getAdvocacyLogoState(advocacy) {
        if (advocacy?.logoType === 'upload' && advocacy?.logoValue) {
            return {
                logoType: 'upload',
                logoValue: String(advocacy.logoValue)
            };
        }

        const iconCandidate = String(advocacy?.logoValue || advocacy?.icon || guessAdvocacyIconFromTitle(advocacy?.title || '')).trim() || 'star';
        const icon = ADVOCACY_ICON_OPTIONS.includes(iconCandidate) ? iconCandidate : 'star';
        return {
            logoType: 'icon',
            logoValue: icon
        };
    }

    function getAdvocacyLogoMarkup(advocacy) {
        const logo = getAdvocacyLogoState(advocacy);

        if (logo.logoType === 'upload' && logo.logoValue) {
            return `<img src="${escapeHtml(logo.logoValue)}" alt="${escapeHtml(advocacy?.title || 'Advocacy logo')}" style="width:20px; height:20px; object-fit:cover; border-radius:5px; vertical-align:middle; margin-right:8px; border:1px solid #e2e8f0;">`;
        }

        return `<i class="fas fa-${escapeHtml(logo.logoValue)}" style="margin-right:8px;"></i>`;
    }

    function setAdvocacyLogoPreview(dataUrl) {
        const preview = document.getElementById('m_adv_logo_upload_preview');
        if (!preview) return;

        if (!dataUrl) {
            preview.innerHTML = '<i class="fas fa-image"></i>';
            return;
        }

        preview.innerHTML = `<img src="${escapeHtml(dataUrl)}" alt="Logo preview" style="width:100%; height:100%; object-fit:cover;">`;
    }

    function setAdvocacyLogoIcon(iconName) {
        const iconInput = document.getElementById('m_adv_logo_icon');
        if (iconInput) {
            iconInput.value = iconName;
        }

        document.querySelectorAll('#m_adv_logo_icon_grid .logo-icon-choice').forEach((button) => {
            button.classList.toggle('is-selected', button.getAttribute('data-logo-icon') === iconName);
        });
    }

    function updateAdvocacyLogoModalState() {
        const logoTypeInput = document.getElementById('m_adv_logo_type');
        const iconWrap = document.getElementById('m_adv_logo_icon_wrap');
        const uploadWrap = document.getElementById('m_adv_logo_upload_wrap');
        if (!logoTypeInput) return;

        const isUpload = logoTypeInput.value === 'upload';
        if (iconWrap) iconWrap.style.display = isUpload ? 'none' : 'block';
        if (uploadWrap) uploadWrap.style.display = isUpload ? 'block' : 'none';
    }

    async function updateAdvocacyLogoPreviewFromFile() {
        const fileInput = document.getElementById('m_adv_logo_upload');
        const dataInput = document.getElementById('m_adv_logo_upload_data');
        const file = fileInput?.files?.[0];

        if (!dataInput) return;

        if (!file) {
            setAdvocacyLogoPreview(dataInput.value || '');
            return;
        }

        try {
            const dataUrl = await readFileAsDataUrl(file);
            dataInput.value = dataUrl;
            setAdvocacyLogoPreview(dataUrl);
        } catch {
            showToast('Failed to read logo image', 'error');
        }
    }

    function bindAdvocacyLogoModalHandlers() {
        const logoTypeInput = document.getElementById('m_adv_logo_type');
        const iconGrid = document.getElementById('m_adv_logo_icon_grid');
        const uploadInput = document.getElementById('m_adv_logo_upload');

        logoTypeInput?.addEventListener('change', updateAdvocacyLogoModalState);
        iconGrid?.addEventListener('click', (event) => {
            const button = event.target instanceof HTMLElement ? event.target.closest('.logo-icon-choice') : null;
            if (!(button instanceof HTMLElement)) return;
            const iconName = button.getAttribute('data-logo-icon');
            if (!iconName) return;
            setAdvocacyLogoIcon(iconName);
        });
        uploadInput?.addEventListener('change', () => {
            updateAdvocacyLogoPreviewFromFile();
        });

        updateAdvocacyLogoModalState();
    }

    function renderOrganizations() {
        const container = document.getElementById("orgList");
        if (!container) return;
        if(store.organizations.length===0) { container.innerHTML='<div class="empty-msg">No organizations</div>'; return; }
        container.innerHTML = store.organizations.map((org, idx) => `
            <div class="item-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                <div>${getOrganizationLogoMarkup(org)}<strong>${escapeHtml(org.name || '')}</strong> – ${escapeHtml(org.role || '')}</div>
                <div class="item-actions">
                    <button class="btn btn-outline btn-sm" onclick="editOrg(${idx})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteOrg(${idx})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
    function renderCommittees() {
        const container = document.getElementById("committeesList");
        if (!container) return;
        if(store.committees.length===0) { container.innerHTML='<div class="empty-msg">No committee periods</div>'; return; }
        container.innerHTML = store.committees.map((comm, idx) => `
            <div class="admin-card" style="margin-bottom:16px; padding:12px; background:#fafafa; border-radius:8px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <strong>📅 ${escapeHtml(comm.period || '')}</strong>
                    <div>
                        <button class="btn btn-outline btn-sm" onclick="editCommittee(${idx})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCommittee(${idx})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div style="font-size:0.9rem;">
                    <div><span style="color:#8BC525; font-weight:600;">Chairman:</span> ${escapeHtml((comm.chairman || []).join(', '))}</div>
                    <div><span style="color:#8BC525; font-weight:600;">Vice-Chair:</span> ${escapeHtml((comm.viceChair || []).join(', '))}</div>
                    <div><span style="color:#666;">Member:</span> ${escapeHtml((comm.member || []).join(', '))}</div>
                </div>
            </div>
        `).join('');
    }
    function renderAdvocacies() {
        const container = document.getElementById("advocaciesList");
        if (!container) return;
        if(store.advocacies.length===0) { container.innerHTML='<div class="empty-msg">No advocacies</div>'; return; }
        container.innerHTML = store.advocacies.map((adv, idx) => `
            <div class="item-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                <div>${getAdvocacyLogoMarkup(adv)}<strong>${escapeHtml(adv.title || '')}</strong><br><small>${escapeHtml(adv.description || '')}</small></div>
                <div class="item-actions">
                    <button class="btn btn-outline btn-sm" onclick="editAdvocacy(${idx})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAdvocacy(${idx})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
    function renderAchievements() {
        const container = document.getElementById("achievementsList");
        if (!container) return;
        if(store.achievements.length===0) { container.innerHTML='<div class="empty-msg">No achievements</div>'; return; }
        container.innerHTML = store.achievements.map((ach, idx) => `
            <div class="item-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                <div><strong>${escapeHtml(ach.year || '')}</strong> – ${escapeHtml(ach.title || '')}<br><small>${escapeHtml(ach.description || '')}</small></div>
                <div class="item-actions">
                    <button class="btn btn-outline btn-sm" onclick="editAchievement(${idx})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAchievement(${idx})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
    function renderEventsAdmin() {
        const container = document.getElementById("eventsListAdmin");
        if (!container) return;
        const stateEvents = Array.isArray(state.events) ? state.events : [];
        const baseEvents = stateEvents.length
            ? stateEvents
            : (Array.isArray(store.events) ? store.events : []);

        const eventsSource = baseEvents.map((event, index) => {
            const matchedStateEvent = stateEvents.find((stateEvent) => Number(stateEvent.id) === Number(event.id)) || stateEvents[index] || {};
            const merged = { ...matchedStateEvent, ...event };
            const imageUrls = Array.isArray(merged.imageUrls)
                ? merged.imageUrls
                : (Array.isArray(matchedStateEvent.imageUrls) ? matchedStateEvent.imageUrls : []);
            const imageIds = Array.isArray(merged.imageIds)
                ? merged.imageIds
                : (Array.isArray(matchedStateEvent.imageIds) ? matchedStateEvent.imageIds : []);
            const coverImageUrl = merged.coverImageUrl || matchedStateEvent.coverImageUrl || imageUrls[0] || '';
            return {
                ...merged,
                imageUrls,
                imageIds,
                coverImageUrl
            };
        });

        if ((!Array.isArray(store.events) || store.events.length === 0) && eventsSource.length) {
            store.events = eventsSource.map((event) => ({
                id: event.id,
                title: event.title,
                eventDate: event.eventDate,
                location: event.location,
                coverImageUrl: event.coverImageUrl || '',
                imageUrls: Array.isArray(event.imageUrls) ? event.imageUrls : [],
                imageIds: Array.isArray(event.imageIds) ? event.imageIds : [],
                imageCount: Number(event.imageCount || (Array.isArray(event.imageUrls) ? event.imageUrls.length : 0) || (event.coverImageUrl ? 1 : 0))
            }));
        }

        if (eventsSource.length===0) { container.innerHTML='<div class="empty-msg">No events in store.</div>'; return; }
        container.innerHTML = eventsSource.map((ev, idx) => `
            <div class="item-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                <div class="admin-event-item-info">
                    <div class="admin-event-thumb-wrap">
                        ${ev.coverImageUrl
                            ? `<img src="${escapeHtml(ev.coverImageUrl)}" alt="${escapeHtml(ev.title || 'Event image')}" class="admin-event-thumb" loading="lazy">`
                            : `<div class="admin-event-thumb admin-event-thumb-placeholder"><i class="fas fa-image"></i></div>`}
                        ${(Number(ev.imageCount || (Array.isArray(ev.imageUrls) ? ev.imageUrls.length : 0) || (ev.coverImageUrl ? 1 : 0)) > 1)
                            ? `<span class="admin-event-thumb-badge">${Number(ev.imageCount || ev.imageUrls.length || 1)} images</span>`
                            : ''}
                    </div>
                    <div>
                        <strong>${escapeHtml(ev.title || '')}</strong> (${escapeHtml(ev.eventDate || '')})
                        ${ev.location ? `<br><small>${escapeHtml(ev.location)}</small>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-outline btn-sm" onclick="editEvent(${idx})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEvent(${idx})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    window.editEducation = (idx) => openDynamicModal("education", idx);
    window.deleteEducation = (idx) => { store.education.splice(idx,1); persistToStorage(); renderEducation(); };
    window.editCareer = (idx) => openDynamicModal("career", idx);
    window.deleteCareer = (idx) => { store.career.splice(idx,1); persistToStorage(); renderCareer(); };
    window.editOrg = (idx) => openDynamicModal("organization", idx);
    window.deleteOrg = (idx) => { store.organizations.splice(idx,1); persistToStorage(); renderOrganizations(); };
    window.editCommittee = (idx) => openDynamicModal("committee", idx);
    window.deleteCommittee = (idx) => { store.committees.splice(idx,1); persistToStorage(); renderCommittees(); };
    window.editAdvocacy = (idx) => openDynamicModal("advocacy", idx);
    window.deleteAdvocacy = (idx) => { store.advocacies.splice(idx,1); persistToStorage(); renderAdvocacies(); };
    window.editAchievement = (idx) => openDynamicModal("achievement", idx);
    window.deleteAchievement = (idx) => { store.achievements.splice(idx,1); persistToStorage(); renderAchievements(); };
    window.editEvent = (idx) => openDynamicModal("event", idx);
    window.deleteEvent = async (idx) => {
        const event = store.events[idx];
        const eventId = Number(event && event.id);

        if (!Number.isInteger(eventId) || eventId <= 0) {
            showToast('Invalid event selected', 'error');
            return;
        }

        if (!confirm('Delete this event permanently?')) {
            return;
        }

        try {
            await apiFetch(`/api/events?eventId=${encodeURIComponent(String(eventId))}`, { method: 'DELETE' });
            await loadBootstrapData();
            renderAll();
            showToast('Event deleted', 'info');
        } catch (error) {
            showToast(error.message || 'Failed to delete event', 'error');
        }
    };

    function openDynamicModal(type, idx) {
        const modal = document.getElementById("dynamicModal");
        const modalTitle = document.getElementById("modalTitle");
        const modalFields = document.getElementById("modalFields");
        let fieldsHtml = "";
        if(type==="education"){
            const edu=store.education[idx];
            fieldsHtml=`<label>Year Range</label><input type="text" id="m_yearRange" value="${escapeHtml(edu.yearRange || '')}">
                        <label>Level</label><input type="text" id="m_level" value="${escapeHtml(edu.level || '')}">
                        <label>School</label><input type="text" id="m_school" value="${escapeHtml(edu.school || '')}">
                        <label>Course (optional)</label><input type="text" id="m_course" value="${escapeHtml(edu.course || '')}">`;
            modalTitle.innerText="Edit Education";
        } else if(type==="career"){
            const c=store.career[idx];
            const logo = getCareerLogoState(c);
            const iconButtons = CAREER_ICON_OPTIONS.map((icon) => `
                <button type="button" class="logo-icon-choice${logo.logoType === 'icon' && logo.logoValue === icon ? ' is-selected' : ''}" data-logo-icon="${escapeHtml(icon)}" aria-label="${escapeHtml(icon)}" title="${escapeHtml(icon)}" style="height:46px; border:1px solid #cbd5e1; border-radius:10px; background:#fff; display:flex; align-items:center; justify-content:center;"><i class="fas fa-${escapeHtml(icon)}"></i></button>
            `).join('');

            fieldsHtml=`<label>Period</label><input type="text" id="m_period" value="${escapeHtml(c.period || '')}">
                        <label>Title</label><input type="text" id="m_title" value="${escapeHtml(c.title || '')}">
                        <label>Organization</label><input type="text" id="m_org" value="${escapeHtml(c.org || '')}">
                        <label style="margin-top:10px;">Logo Selection</label>
                        <select id="m_career_logo_type" style="margin-top:8px;">
                            <option value="icon" ${logo.logoType === 'icon' ? 'selected' : ''}>Choose icon logo</option>
                            <option value="upload" ${logo.logoType === 'upload' ? 'selected' : ''}>Upload custom logo</option>
                        </select>
                        <div id="m_career_logo_icon_wrap" style="margin-top:10px;">
                            <label>Icon Logo</label>
                            <input type="hidden" id="m_career_logo_icon" value="${escapeHtml(logo.logoType === 'icon' ? logo.logoValue : 'briefcase')}">
                            <div id="m_career_logo_icon_grid" style="display:grid; grid-template-columns:repeat(6, minmax(0, 1fr)); gap:8px; margin-top:8px; max-height:220px; overflow-y:auto; padding-right:6px;">
                                ${iconButtons}
                            </div>
                        </div>
                        <div id="m_career_logo_upload_wrap" style="margin-top:10px;">
                            <label>Upload Custom Logo</label>
                            <input type="hidden" id="m_career_logo_upload_data" value="${escapeHtml(logo.logoType === 'upload' ? logo.logoValue : '')}">
                            <input type="file" id="m_career_logo_upload" accept="image/*" style="margin-top:8px;">
                            <div id="m_career_logo_upload_preview" style="margin-top:8px; width:72px; height:72px; border:1px dashed #cbd5e1; border-radius:12px; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#f8fafc; color:#94a3b8;">${logo.logoType === 'upload' && logo.logoValue ? `<img src="${escapeHtml(logo.logoValue)}" alt="Logo preview" style="width:100%; height:100%; object-fit:cover;">` : '<i class="fas fa-image"></i>'}</div>
                        </div>`;
            modalTitle.innerText="Edit Career";
        } else if(type==="organization"){
            const o=store.organizations[idx];
            const logo = getOrganizationLogoState(o);
            const iconButtons = ORGANIZATION_ICON_OPTIONS.map((icon) => `
                <button type="button" class="logo-icon-choice${logo.logoType === 'icon' && logo.logoValue === icon ? ' is-selected' : ''}" data-logo-icon="${escapeHtml(icon)}" aria-label="${escapeHtml(icon)}" title="${escapeHtml(icon)}" style="height:46px; border:1px solid #cbd5e1; border-radius:10px; background:#fff; display:flex; align-items:center; justify-content:center;"><i class="fas fa-${escapeHtml(icon)}"></i></button>
            `).join('');

            fieldsHtml=`<label>Name</label><input type="text" id="m_name" value="${escapeHtml(o.name || '')}">
                        <label>Role</label><input type="text" id="m_role" value="${escapeHtml(o.role || '')}">
                        <label style="margin-top:10px;">Logo Selection</label>
                        <select id="m_logo_type" style="margin-top:8px;">
                            <option value="icon" ${logo.logoType === 'icon' ? 'selected' : ''}>Choose icon logo</option>
                            <option value="upload" ${logo.logoType === 'upload' ? 'selected' : ''}>Upload custom logo</option>
                        </select>
                        <div id="m_logo_icon_wrap" style="margin-top:10px;">
                            <label>Icon Logo</label>
                            <input type="hidden" id="m_logo_icon" value="${escapeHtml(logo.logoType === 'icon' ? logo.logoValue : 'globe')}">
                            <div id="m_logo_icon_grid" style="display:grid; grid-template-columns:repeat(6, minmax(0, 1fr)); gap:8px; margin-top:8px; max-height:220px; overflow-y:auto; padding-right:6px;">
                                ${iconButtons}
                            </div>
                        </div>
                        <div id="m_logo_upload_wrap" style="margin-top:10px;">
                            <label>Upload Custom Logo</label>
                            <input type="hidden" id="m_logo_upload_data" value="${escapeHtml(logo.logoType === 'upload' ? logo.logoValue : '')}">
                            <input type="file" id="m_logo_upload" accept="image/*" style="margin-top:8px;">
                            <div id="m_logo_upload_preview" style="margin-top:8px; width:72px; height:72px; border:1px dashed #cbd5e1; border-radius:12px; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#f8fafc; color:#94a3b8;">${logo.logoType === 'upload' && logo.logoValue ? `<img src="${escapeHtml(logo.logoValue)}" alt="Logo preview" style="width:100%; height:100%; object-fit:cover;">` : '<i class="fas fa-image"></i>'}</div>
                        </div>`;
            modalTitle.innerText="Edit Organization";
        } else if(type==="committee"){
            const com=store.committees[idx];
            fieldsHtml=`<label>Period</label><input type="text" id="m_period" value="${escapeHtml(com.period || '')}">
                        <label>Chairman (comma separated)</label><input type="text" id="m_chairman" value="${escapeHtml((com.chairman || []).join(', '))}">
                        <label>Vice-Chair (comma separated)</label><input type="text" id="m_vice" value="${escapeHtml((com.viceChair || []).join(', '))}">
                        <label>Member (comma separated)</label><input type="text" id="m_member" value="${escapeHtml((com.member || []).join(', '))}">`;
            modalTitle.innerText="Edit Committee Period";
        } else if(type==="advocacy"){
            const a=store.advocacies[idx];
            const logo = getAdvocacyLogoState(a);
            const iconButtons = ADVOCACY_ICON_OPTIONS.map((icon) => `
                <button type="button" class="logo-icon-choice${logo.logoType === 'icon' && logo.logoValue === icon ? ' is-selected' : ''}" data-logo-icon="${escapeHtml(icon)}" aria-label="${escapeHtml(icon)}" title="${escapeHtml(icon)}" style="height:46px; border:1px solid #cbd5e1; border-radius:10px; background:#fff; display:flex; align-items:center; justify-content:center;"><i class="fas fa-${escapeHtml(icon)}"></i></button>
            `).join('');

            fieldsHtml=`<label>Title</label><input type="text" id="m_title" value="${escapeHtml(a.title || '')}">
                        <label>Description</label><textarea id="m_desc" rows="3">${escapeHtml(a.description || '')}</textarea>
                        <label style="margin-top:10px;">Logo Selection</label>
                        <select id="m_adv_logo_type" style="margin-top:8px;">
                            <option value="icon" ${logo.logoType === 'icon' ? 'selected' : ''}>Choose icon logo</option>
                            <option value="upload" ${logo.logoType === 'upload' ? 'selected' : ''}>Upload custom logo</option>
                        </select>
                        <div id="m_adv_logo_icon_wrap" style="margin-top:10px;">
                            <label>Icon Logo</label>
                            <input type="hidden" id="m_adv_logo_icon" value="${escapeHtml(logo.logoType === 'icon' ? logo.logoValue : 'star')}">
                            <div id="m_adv_logo_icon_grid" style="display:grid; grid-template-columns:repeat(6, minmax(0, 1fr)); gap:8px; margin-top:8px; max-height:220px; overflow-y:auto; padding-right:6px;">
                                ${iconButtons}
                            </div>
                        </div>
                        <div id="m_adv_logo_upload_wrap" style="margin-top:10px;">
                            <label>Upload Custom Logo</label>
                            <input type="hidden" id="m_adv_logo_upload_data" value="${escapeHtml(logo.logoType === 'upload' ? logo.logoValue : '')}">
                            <input type="file" id="m_adv_logo_upload" accept="image/*" style="margin-top:8px;">
                            <div id="m_adv_logo_upload_preview" style="margin-top:8px; width:72px; height:72px; border:1px dashed #cbd5e1; border-radius:12px; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#f8fafc; color:#94a3b8;">${logo.logoType === 'upload' && logo.logoValue ? `<img src="${escapeHtml(logo.logoValue)}" alt="Logo preview" style="width:100%; height:100%; object-fit:cover;">` : '<i class="fas fa-image"></i>'}</div>
                        </div>`;
            modalTitle.innerText="Edit Advocacy";
        } else if(type==="achievement"){
            const ach=store.achievements[idx];
            fieldsHtml=`<label>Year</label><input type="text" id="m_year" value="${escapeHtml(ach.year || '')}">
                        <label>Title</label><input type="text" id="m_title" value="${escapeHtml(ach.title || '')}">
                        <label>Description</label><textarea id="m_desc" rows="3">${escapeHtml(ach.description || '')}</textarea>`;
            modalTitle.innerText="Edit Achievement";
        } else if(type==="event"){
            const event = store.events[idx] || {};
            const imageUrls = Array.isArray(event.imageUrls) ? event.imageUrls : [];
            const imageIds = Array.isArray(event.imageIds) ? event.imageIds : [];
            const coverImageUrl = event.coverImageUrl || imageUrls[0] || '';
            const imageCount = Number(event.imageCount || imageUrls.length || (coverImageUrl ? 1 : 0));
            fieldsHtml=`<label>Date</label><input type="date" id="m_date" value="${escapeHtml(event.eventDate || '')}">
                        <label>Title</label><input type="text" id="m_title" value="${escapeHtml(event.title || '')}">
                        <label>Location</label><input type="text" id="m_location" value="${escapeHtml(event.location || '')}">
                        <div style="margin-top:12px;">
                            <label>Event Images ${imageCount > 1 ? `(${imageCount})` : ''}</label>
                            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:8px;">
                                ${imageUrls.length
                                    ? imageUrls.map((url, imageIndex) => {
                                        const imageId = imageIds[imageIndex];
                                        return `
                                            <div style="position:relative; width:120px; height:80px; border-radius:10px; overflow:hidden; border:1px solid #e2e8f0; background:#fff;">
                                                <img src="${escapeHtml(url)}" alt="${escapeHtml(event.title || 'Event image')}" style="width:100%; height:100%; object-fit:cover; display:block;">
                                                ${imageId ? `<button type="button" onclick="deleteEventImage(${imageId})" aria-label="Delete image" style="position:absolute; top:6px; right:6px; width:24px; height:24px; border:none; border-radius:999px; background:rgba(220,38,38,0.95); color:#fff; font-size:16px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center;">&times;</button>` : ''}
                                            </div>
                                        `;
                                    }).join('')
                                    : '<div style="width:120px; height:80px; border-radius:10px; background:#f1f5f9; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:center; color:#94a3b8;"><i class="fas fa-image"></i></div>'}
                            </div>
                        </div>
                        <div style="margin-top:14px; display:flex; gap:10px; align-items:flex-start; flex-wrap:wrap;">
                            <input type="file" id="m_add_images" accept="image/*" multiple style="max-width:320px;">
                            <small id="m_add_images_help" style="color:#64748b; display:block;">Selected images will be uploaded when you save changes. You can upload up to 10 images total per event.</small>
                        </div>
                        <div id="m_add_images_preview" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;"><small style="color:#64748b;">No new images selected.</small></div>`;
            modalTitle.innerText="Edit Event";
        } else if(type==="event_new"){
            fieldsHtml=`<label>Event Date</label><input type="date" id="m_new_eventDate">
                        <label>Title</label><input type="text" id="m_new_title" placeholder="Event title">
                        <label>Location</label><input type="text" id="m_new_location" placeholder="Event location">
                        <label>Images (1-10)</label><input type="file" id="m_new_images" accept="image/*" multiple>
                        <div id="m_new_images_preview" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;"></div>`;
            modalTitle.innerText="Upload New Event";
        }
        modalFields.innerHTML=fieldsHtml;
        modal.dataset.type=type;
        modal.dataset.idx=idx;
        modal.classList.add("active");

        if (type === 'event') {
            const fileInput = document.getElementById('m_add_images');
            const event = store.events[idx] || {};
            const eventId = Number(event.id);

            window.resetPendingEditEventUploadState?.();
            window.renderPendingEditEventUploadPreview?.();

            fileInput?.addEventListener('change', () => {
                window.appendPendingEditEventUploadFiles?.(Array.from(fileInput.files || []));
                window.renderPendingEditEventUploadPreview?.();
            });

            if (fileInput) {
                fileInput.value = '';
            }
        }

        if (type === 'event_new') {
            const fileInput = document.getElementById('m_new_images');
            window.resetPendingNewEventUploadState?.();
            renderPendingNewEventUploadPreview();

            fileInput?.addEventListener('click', () => {
                fileInput.value = '';
            });

            fileInput?.addEventListener('change', () => {
                window.appendPendingNewEventUploadFiles?.(Array.from(fileInput.files || []));
                fileInput.value = '';
                renderPendingNewEventUploadPreview();
            });
        }

        if (type === 'organization') {
            bindOrganizationLogoModalHandlers();
        }

        if (type === 'career') {
            bindCareerLogoModalHandlers();
        }

        if (type === 'advocacy') {
            bindAdvocacyLogoModalHandlers();
        }
    }

    window.openEventUploadModal = () => openDynamicModal('event_new', -1);

    window.saveDynamicModal = async () => {
        const modal=document.getElementById("dynamicModal");
        const type=modal.dataset.type;
        const idx=parseInt(modal.dataset.idx);
        if(type==="education") store.education[idx]={yearRange:document.getElementById("m_yearRange").value,level:document.getElementById("m_level").value,school:document.getElementById("m_school").value,course:document.getElementById("m_course").value};
        else if(type==="career") {
            const period = document.getElementById("m_period")?.value || '';
            const title = document.getElementById("m_title")?.value || '';
            const org = document.getElementById("m_org")?.value || '';
            const logoType = document.getElementById('m_career_logo_type')?.value === 'upload' ? 'upload' : 'icon';
            const selectedIcon = (document.getElementById('m_career_logo_icon')?.value || 'briefcase').trim() || 'briefcase';
            const uploadedLogo = document.getElementById('m_career_logo_upload_data')?.value || '';

            if (logoType === 'upload' && !uploadedLogo) {
                showToast('Please upload a custom logo image', 'error');
                return;
            }

            store.career[idx] = {
                period, title, org,
                logoType,
                logoValue: logoType === 'upload' ? uploadedLogo : selectedIcon
            };
        }
        else if(type==="organization") {
            const name = document.getElementById("m_name")?.value || '';
            const role = document.getElementById("m_role")?.value || '';
            const logoType = document.getElementById('m_logo_type')?.value === 'upload' ? 'upload' : 'icon';
            const selectedIcon = (document.getElementById('m_logo_icon')?.value || 'globe').trim() || 'globe';
            const uploadedLogo = document.getElementById('m_logo_upload_data')?.value || '';

            if (logoType === 'upload' && !uploadedLogo) {
                showToast('Please upload a custom logo image', 'error');
                return;
            }

            store.organizations[idx] = {
                name,
                role,
                icon: logoType === 'icon' ? selectedIcon : '',
                logoType,
                logoValue: logoType === 'icon' ? selectedIcon : uploadedLogo
            };
        }
        else if(type==="committee") store.committees[idx]={period:document.getElementById("m_period").value,chairman:document.getElementById("m_chairman").value.split(',').map(s=>s.trim()),viceChair:document.getElementById("m_vice").value.split(',').map(s=>s.trim()),member:document.getElementById("m_member").value.split(',').map(s=>s.trim())};
        else if(type==="advocacy") {
            const title = document.getElementById("m_title")?.value || '';
            const description = document.getElementById("m_desc")?.value || '';
            const logoType = document.getElementById('m_adv_logo_type')?.value === 'upload' ? 'upload' : 'icon';
            const selectedIcon = (document.getElementById('m_adv_logo_icon')?.value || guessAdvocacyIconFromTitle(title)).trim() || 'star';
            const uploadedLogo = document.getElementById('m_adv_logo_upload_data')?.value || '';

            if (logoType === 'upload' && !uploadedLogo) {
                showToast('Please upload a custom logo image', 'error');
                return;
            }

            store.advocacies[idx] = {
                title,
                description,
                icon: logoType === 'icon' ? selectedIcon : '',
                logoType,
                logoValue: logoType === 'icon' ? selectedIcon : uploadedLogo
            };
        }
        else if(type==="achievement") store.achievements[idx]={year:document.getElementById("m_year").value,title:document.getElementById("m_title").value,description:document.getElementById("m_desc").value};
        else if(type==="event") {
            const event = store.events[idx] || {};
            const eventId = Number(event.id);
            const title = (document.getElementById('m_title')?.value || '').trim();
            const eventDate = document.getElementById('m_date')?.value || '';
            const location = (document.getElementById('m_location')?.value || '').trim();

            if (!Number.isInteger(eventId) || eventId <= 0) {
                showToast('Invalid event selected', 'error');
                return;
            }

            if (!title || !eventDate || !location) {
                showToast('Event title, date, and location are required', 'error');
                return;
            }

            const currentCount = Number(event.imageCount || (Array.isArray(event.imageUrls) ? event.imageUrls.length : 0) || (event.coverImageUrl ? 1 : 0));
            if (currentCount + window.pendingEditEventUploadFiles.length > 10) {
                showToast('10 images maximum only', 'error');
                return;
            }

            const fd = new FormData();
            fd.append('eventId', String(eventId));
            fd.append('title', title);
            fd.append('eventDate', eventDate);
            fd.append('location', location);
            window.pendingEditEventUploadFiles.forEach((file) => fd.append('images', file, file.name));

            try {
                await apiFetch('/api/events', { method: 'PUT', body: fd });
                window.resetPendingEditEventUploadState?.();
                await loadBootstrapData();
                renderAll();
                modal.classList.remove('active');
                showToast('Event updated successfully', 'success');
            } catch (error) {
                showToast(error.message || 'Failed to update event', 'error');
            }
            return;
        }
        else if(type==="event_new") {
            const title = (document.getElementById('m_new_title')?.value || '').trim();
            const eventDate = document.getElementById('m_new_eventDate')?.value || '';
            const location = (document.getElementById('m_new_location')?.value || '').trim();
            const fileInput = document.getElementById('m_new_images');
            const files = Array.from(window.pendingNewEventUploadFiles?.length ? window.pendingNewEventUploadFiles : (fileInput?.files || []));

            if (!window.pendingNewEventUploadFiles.length && files.length) {
                window.pendingNewEventUploadFiles = files.slice(0, 10);
                renderPendingNewEventUploadPreview();
            }

            if (!title || !eventDate || !location) {
                showToast('Event title, date, and location are required', 'error');
                return;
            }

            if (!files.length) {
                showToast('Please select at least one image', 'error');
                return;
            }

            if (files.length > 10) {
                showToast('10 images maximum only', 'error');
                return;
            }

            const fd = new FormData();
            fd.append('title', title);
            fd.append('eventDate', eventDate);
            fd.append('location', location);
            files.forEach((file) => fd.append('images', file, file.name));

            try {
                await apiFetch('/api/events', { method: 'POST', body: fd });
                window.resetPendingNewEventUploadState?.();
                modal.classList.remove('active');
                await loadBootstrapData();
                renderAll();
                showToast('Event uploaded successfully', 'success');
            } catch (error) {
                showToast(error.message || 'Failed to upload event', 'error');
            }
            return;
        }
        persistToStorage();
        renderAll();
        modal.classList.remove("active");
        showToast("Success: Item updated");
    };

    // Tab Logic
    function activateTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (btn) btn.classList.add('active');
        if(tabId === 'personal') document.getElementById('personalTab').classList.add('active');
        if(tabId === 'dynamicGroups') document.getElementById('dynamicGroupsTab').classList.add('active');
        if(tabId === 'committees') document.getElementById('committeesTab').classList.add('active');
        if(tabId === 'advocacies') document.getElementById('advocaciesTab').classList.add('active');
        if(tabId === 'achievements') document.getElementById('achievementsTab').classList.add('active');
        if(tabId === 'events') document.getElementById('eventsTab').classList.add('active');
    }

    // Load saved tab
    const savedTab = localStorage.getItem('adminActiveTab') || 'personal';
    activateTab(savedTab);

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            activateTab(tabId);
            localStorage.setItem('adminActiveTab', tabId);
        });
    });

    // Event listeners
    document.getElementById("addNewStatRowBtn")?.addEventListener("click", openAddStatModal);
    document.getElementById("confirmAddStatBtn")?.addEventListener("click", confirmAddStat);
    document.getElementById("cancelAddStatBtn")?.addEventListener("click", () => document.getElementById("addStatModal").classList.remove("active"));
    document.getElementById("newStatLogoType")?.addEventListener("change", updateNewStatLogoModalState);
    document.getElementById("newStatLogoUpload")?.addEventListener("change", updateNewStatLogoPreview);
    document.getElementById("newStatLogoIconGrid")?.addEventListener("click", (event) => {
        const button = event.target instanceof HTMLElement ? event.target.closest('.logo-icon-choice') : null;
        if (!(button instanceof HTMLElement)) return;
        const iconName = button.getAttribute('data-logo-icon');
        if (!iconName) return;
        setNewStatLogoIcon(iconName);
    });
    document.getElementById("modalCancelBtn")?.addEventListener("click", () => {
        window.resetPendingNewEventUploadState?.();
        window.resetPendingEditEventUploadState?.();
        document.getElementById("dynamicModal").classList.remove("active");
    });
    document.getElementById("modalSaveBtn")?.addEventListener("click", saveDynamicModal);
    document.getElementById("addEduBtn")?.addEventListener("click", () => { store.education.push({ yearRange:"Year", level:"Degree", school:"School", course:"" }); persistToStorage(); renderEducation(); });
    document.getElementById("addCareerBtn")?.addEventListener("click", () => { store.career.push({ period:"Period", title:"Title", org:"Org", logoType: "icon", logoValue: "briefcase" }); persistToStorage(); renderCareer(); });
    document.getElementById("addOrgBtn")?.addEventListener("click", () => {
        store.organizations.push({ name:"Name", role:"Role", icon:"globe", logoType:"icon", logoValue:"globe" });
        persistToStorage();
        renderOrganizations();
    });
    document.getElementById("addCommitteeBtn")?.addEventListener("click", () => { store.committees.push({ period:"Period", chairman:[], viceChair:[], member:[] }); persistToStorage(); renderCommittees(); });
    document.getElementById("addAdvocacyBtn")?.addEventListener("click", () => { store.advocacies.push({ title:"Title", description:"Desc", icon:"star", logoType: "icon", logoValue: "star" }); persistToStorage(); renderAdvocacies(); });
    document.getElementById("addAchievementBtn")?.addEventListener("click", () => { store.achievements.push({ year:"Year", title:"Title", description:"Desc" }); persistToStorage(); renderAchievements(); });
    document.getElementById("addEventBtn")?.addEventListener("click", openEventUploadModal);

    // Bootstrap run
    loadFromStorage();

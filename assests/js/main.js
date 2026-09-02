/**
 * VivaDecor Luxury Interior Design Studio
 * Core Interactive Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    initLiveStudioStatus();
    initNavbarScroll();
    initAnimatedCounters();
    initCostEstimator();
    initBeforeAfterSlider();
    initPortfolioFilters();
    initProjectModals();
    initFormHandlers();
    initBackToTop();
    initAccordionScroll();
});

/* -------------------------------------------------------------
 * 1. Live Studio Hours & Real-Time Status Badge
 * ------------------------------------------------------------- */
function initLiveStudioStatus() {
    const statusBadges = document.querySelectorAll('.live-studio-status');
    const timeElements = document.querySelectorAll('.studio-live-time');
    
    function updateStatus() {
        // Los Angeles / Beverly Hills Time (PST/PDT)
        const now = new Date();
        const options = { timeZone: 'America/Los_Angeles', hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' };
        const laTimeStr = now.toLocaleTimeString('en-US', options);
        
        // Get day and hour in PST
        const dayFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short' });
        const hourFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hour12: false });
        const currentDay = dayFormatter.format(now); // "Mon", "Tue", etc.
        const currentHour = parseInt(hourFormatter.format(now), 10);
        
        let isOpen = false;
        let hoursNote = '';
        
        if (currentDay === 'Sun') {
            isOpen = false;
            hoursNote = 'Closed Today (By Appointment Only)';
        } else if (currentDay === 'Sat') {
            if (currentHour >= 10 && currentHour < 17) {
                isOpen = true;
                hoursNote = 'Open Today until 5:00 PM PST';
            } else {
                isOpen = false;
                hoursNote = 'Closed • Opens Mon at 9:00 AM PST';
            }
        } else {
            // Mon - Fri (9:00 AM - 7:00 PM)
            if (currentHour >= 9 && currentHour < 19) {
                isOpen = true;
                hoursNote = 'Open Today until 7:00 PM PST';
            } else {
                isOpen = false;
                hoursNote = 'Closed • Opens Tomorrow at 9:00 AM PST';
            }
        }
        
        statusBadges.forEach(badge => {
            if (isOpen) {
                badge.innerHTML = `<span class="status-indicator open"></span> <span class="status-text">Studio Open Now</span> <span class="status-hours">(${hoursNote})</span>`;
                badge.classList.add('status-open');
                badge.classList.remove('status-closed');
            } else {
                badge.innerHTML = `<span class="status-indicator closed"></span> <span class="status-text">Studio Currently Closed</span> <span class="status-hours">(${hoursNote})</span>`;
                badge.classList.add('status-closed');
                badge.classList.remove('status-open');
            }
        });
        
        timeElements.forEach(el => {
            el.textContent = `${laTimeStr} (Beverly Hills, CA)`;
        });
    }
    
    updateStatus();
    setInterval(updateStatus, 10000);
}

/* -------------------------------------------------------------
 * 2. Sticky Navbar, Scrollspy & Mobile Navigation
 * ------------------------------------------------------------- */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const sections = document.querySelectorAll('main > div[id], header[id], section[id]');
    const navCollapse = document.getElementById('navbarNavAltMarkup');
    
    // Sticky Glass Effect on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Active Scrollspy
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Smooth scrolling & close mobile menu
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerOffset = 90;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close bootstrap mobile menu if open
                    if (navCollapse && navCollapse.classList.contains('show')) {
                        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                        if (bsCollapse) bsCollapse.hide();
                    }
                }
            }
        });
    });
}

/* -------------------------------------------------------------
 * 3. Animated Number Counters
 * ------------------------------------------------------------- */
function initAnimatedCounters() {
    const counters = document.querySelectorAll('.counter-value');
    let animated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                counters.forEach(counter => {
                    const target = parseFloat(counter.getAttribute('data-target'));
                    const isDecimal = target % 1 !== 0;
                    const duration = 2000;
                    const stepTime = 20;
                    const totalSteps = duration / stepTime;
                    const stepIncrement = target / totalSteps;
                    let current = 0;
                    
                    const timer = setInterval(() => {
                        current += stepIncrement;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        if (isDecimal) {
                            counter.textContent = current.toFixed(1);
                        } else {
                            counter.textContent = Math.floor(current);
                        }
                    }, stepTime);
                });
            }
        });
    }, { threshold: 0.3 });
    
    const counterSection = document.querySelector('.s-1-lower');
    if (counterSection) observer.observe(counterSection);
}

/* -------------------------------------------------------------
 * 4. Interactive Real-Time Interior Cost Estimator
 * ------------------------------------------------------------- */
function initCostEstimator() {
    const roomPills = document.querySelectorAll('.room-pill');
    const areaSlider = document.getElementById('areaSlider');
    const areaValueDisplay = document.getElementById('areaValue');
    const tierOptions = document.querySelectorAll('.tier-card');
    
    // Outputs
    const totalEstimateDisplay = document.getElementById('totalEstimate');
    const timelineDisplay = document.getElementById('estimatedTimeline');
    const breakdownDesign = document.getElementById('breakdownDesign');
    const breakdownMillwork = document.getElementById('breakdownMillwork');
    const breakdownLighting = document.getElementById('breakdownLighting');
    const breakdownManagement = document.getElementById('breakdownManagement');
    const bookWithEstimateBtn = document.getElementById('bookWithEstimateBtn');
    
    if (!areaSlider || !totalEstimateDisplay) return;
    
    // State
    let selectedRoomRate = 22; // Default Living Room ($/sqft)
    let selectedRoomName = 'Modern Living Room';
    let selectedArea = parseInt(areaSlider.value, 10) || 650;
    let selectedTierMultiplier = 1.0; // Signature Luxury
    let selectedTierName = 'Signature Luxury';
    
    function calculateEstimate() {
        const baseCost = selectedArea * selectedRoomRate;
        const total = Math.round(baseCost * selectedTierMultiplier);
        
        // Breakdown calculations
        const designFee = Math.round(total * 0.18);
        const millworkFurniture = Math.round(total * 0.48);
        const lightingAutomation = Math.round(total * 0.22);
        const managementInstallation = total - (designFee + millworkFurniture + lightingAutomation);
        
        // Dynamic Timeline calculation
        let weeksMin = 4;
        let weeksMax = 7;
        if (selectedArea > 1500) {
            weeksMin = 8;
            weeksMax = 12;
        } else if (selectedArea > 800) {
            weeksMin = 6;
            weeksMax = 9;
        }
        if (selectedTierMultiplier > 1.4) {
            weeksMin += 2;
            weeksMax += 3;
        }
        
        // Update DOM
        totalEstimateDisplay.textContent = `$${total.toLocaleString('en-US')}`;
        if (timelineDisplay) timelineDisplay.textContent = `${weeksMin} - ${weeksMax} Weeks`;
        if (breakdownDesign) breakdownDesign.textContent = `$${designFee.toLocaleString('en-US')}`;
        if (breakdownMillwork) breakdownMillwork.textContent = `$${millworkFurniture.toLocaleString('en-US')}`;
        if (breakdownLighting) breakdownLighting.textContent = `$${lightingAutomation.toLocaleString('en-US')}`;
        if (breakdownManagement) breakdownManagement.textContent = `$${managementInstallation.toLocaleString('en-US')}`;
        
        // Pre-fill booking button data attributes
        if (bookWithEstimateBtn) {
            bookWithEstimateBtn.setAttribute('data-room', selectedRoomName);
            bookWithEstimateBtn.setAttribute('data-area', `${selectedArea} sq.ft`);
            bookWithEstimateBtn.setAttribute('data-tier', selectedTierName);
            bookWithEstimateBtn.setAttribute('data-estimate', `$${total.toLocaleString('en-US')}`);
        }
    }
    
    // Room selection
    roomPills.forEach(pill => {
        pill.addEventListener('click', () => {
            roomPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            selectedRoomRate = parseFloat(pill.getAttribute('data-rate')) || 22;
            selectedRoomName = pill.getAttribute('data-room') || 'Living Room';
            calculateEstimate();
        });
    });
    
    // Area range slider
    areaSlider.addEventListener('input', (e) => {
        selectedArea = parseInt(e.target.value, 10);
        if (areaValueDisplay) areaValueDisplay.textContent = `${selectedArea.toLocaleString()} sq.ft`;
        calculateEstimate();
    });
    
    // Quality Tier selection
    tierOptions.forEach(tier => {
        tier.addEventListener('click', () => {
            tierOptions.forEach(t => t.classList.remove('active'));
            tier.classList.add('active');
            selectedTierMultiplier = parseFloat(tier.getAttribute('data-multiplier')) || 1.0;
            selectedTierName = tier.getAttribute('data-tier') || 'Signature Luxury';
            calculateEstimate();
        });
    });
    
    // Book with estimate button click
    if (bookWithEstimateBtn) {
        bookWithEstimateBtn.addEventListener('click', () => {
            openConsultationModalWithEstimate({
                room: selectedRoomName,
                area: `${selectedArea} sq.ft`,
                tier: selectedTierName,
                estimate: totalEstimateDisplay.textContent
            });
        });
    }
    
    // Initial calculation
    calculateEstimate();
}

/* -------------------------------------------------------------
 * 5. Interactive Draggable Before / After Comparison Slider
 * ------------------------------------------------------------- */
function initBeforeAfterSlider() {
    const container = document.querySelector('.before-after-container');
    const afterOverlay = document.querySelector('.before-after-overlay');
    const handle = document.querySelector('.before-after-handle');
    
    if (!container || !afterOverlay || !handle) return;
    
    let isDragging = false;
    
    function setPosition(x) {
        const rect = container.getBoundingClientRect();
        let offsetX = x - rect.left;
        if (offsetX < 0) offsetX = 0;
        if (offsetX > rect.width) offsetX = rect.width;
        
        const percentage = (offsetX / rect.width) * 100;
        afterOverlay.style.width = `${percentage}%`;
        handle.style.left = `${percentage}%`;
    }
    
    function onPointerDown(e) {
        isDragging = true;
        setPosition(e.pageX || (e.touches && e.touches[0].pageX));
    }
    
    function onPointerMove(e) {
        if (!isDragging) return;
        setPosition(e.pageX || (e.touches && e.touches[0].pageX));
    }
    
    function onPointerUp() {
        isDragging = false;
    }
    
    handle.addEventListener('mousedown', onPointerDown);
    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    
    handle.addEventListener('touchstart', onPointerDown, { passive: true });
    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
}

/* -------------------------------------------------------------
 * 6. Portfolio Category Filter & Search
 * ------------------------------------------------------------- */
function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.portfolio-filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-item');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            portfolioCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 250);
                }
            });
        });
    });
}

/* -------------------------------------------------------------
 * 7. Project Detail Modal Data & Triggers
 * ------------------------------------------------------------- */
const projectsDatabase = {
    'penthouse-beverly': {
        title: 'Beverly Hills Sky Penthouse',
        category: 'Living & Architecture',
        area: '4,850 sq.ft',
        location: 'Beverly Hills, CA',
        timeline: '10 Weeks',
        budget: '$320,000',
        designer: 'Julian Vance & Elena Rostova',
        description: 'Complete bespoke renovation of a two-story panoramic penthouse. Featuring double-height fluted walnut architectural paneling, Calacatta Monet bookmatched marble fireplaces, motorized Japanese architectural acoustic drapery, and integrated Lutron HomeWorks smart lighting.',
        image: 'assests/images/images/portfolio-1.jpg',
        tags: ['Minimalist Luxury', 'Smart Lighting', 'Custom Millwork', 'Marble Fireplace']
    },
    'minimalist-kitchen': {
        title: 'Bel-Air Monolithic Chef Kitchen',
        category: 'Kitchen & Dining',
        area: '820 sq.ft',
        location: 'Bel-Air Crest, CA',
        timeline: '6 Weeks',
        budget: '$145,000',
        designer: 'Marcus Sterling',
        description: 'Clean architectural lines featuring a 14-foot seamless waterfall island carved from honed Calacatta Viola marble, matte fumed oak cabinetry, invisible Gaggenau induction cooktops, and custom brushed brass architectural hardware.',
        image: 'assests/images/images/portfolio-2.jpg',
        tags: ['Waterfall Marble', 'Fumed Oak', 'Gaggenau', 'Concealed Storage']
    },
    'master-sanctuary': {
        title: 'Malibu Coastal Master Suite',
        category: 'Master Suites',
        area: '1,200 sq.ft',
        location: 'Malibu Beach, CA',
        timeline: '7 Weeks',
        budget: '$180,000',
        designer: 'Sophia Lin',
        description: 'A serene sanctuary embracing organic minimalism with floor-to-ceiling acoustic fluted oak headboard wall, cashmere bouclé textiles, concealed circadian ambient illumination, and private ocean-view meditation lounge.',
        image: 'assests/images/images/portfolio-3.jpg',
        tags: ['Acoustic Paneling', 'Circadian Light', 'Cashmere Textiles', 'Bouclé Lounge']
    },
    'executive-office': {
        title: 'Century City Executive Suite',
        category: 'Commercial Office',
        area: '3,100 sq.ft',
        location: 'Century City, CA',
        timeline: '8 Weeks',
        budget: '$260,000',
        designer: 'Julian Vance',
        description: 'State-of-the-art boardroom and executive offices designed for high-profile venture partners. Includes acoustic glass partitions, custom solid walnut conference table with embedded wireless charging, and dynamic lighting presets.',
        image: 'assests/images/images/Mask group.png',
        tags: ['Acoustic Glass', 'Walnut Millwork', 'Executive Suite', 'Ergonomic Luxury']
    }
};

function initProjectModals() {
    const triggerButtons = document.querySelectorAll('[data-project-id]');
    const modalElement = document.getElementById('projectDetailModal');
    if (!modalElement) return;
    
    triggerButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = btn.getAttribute('data-project-id');
            const data = projectsDatabase[projectId];
            if (!data) return;
            
            // Populate modal fields
            document.getElementById('modalProjectTitle').textContent = data.title;
            document.getElementById('modalProjectCategory').textContent = data.category;
            document.getElementById('modalProjectArea').textContent = data.area;
            document.getElementById('modalProjectLocation').textContent = data.location;
            document.getElementById('modalProjectTimeline').textContent = data.timeline;
            document.getElementById('modalProjectBudget').textContent = data.budget;
            document.getElementById('modalProjectDesigner').textContent = data.designer;
            document.getElementById('modalProjectDescription').textContent = data.description;
            document.getElementById('modalProjectImage').src = data.image;
            
            // Populate tags
            const tagsContainer = document.getElementById('modalProjectTags');
            tagsContainer.innerHTML = '';
            data.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'project-badge';
                span.textContent = tag;
                tagsContainer.appendChild(span);
            });
            
            // Open modal via bootstrap
            const bsModal = new bootstrap.Modal(modalElement);
            bsModal.show();
        });
    });
}

/* -------------------------------------------------------------
 * 8. Open Consultation Modal Pre-filled with Estimate
 * ------------------------------------------------------------- */
function openConsultationModalWithEstimate(estimateData) {
    const consultationModalEl = document.getElementById('consultationModal');
    if (!consultationModalEl) return;
    
    // Fill pre-fill summary
    const summaryBox = document.getElementById('estimateSummaryBox');
    if (summaryBox && estimateData) {
        summaryBox.style.display = 'block';
        document.getElementById('summaryRoom').textContent = estimateData.room;
        document.getElementById('summaryArea').textContent = estimateData.area;
        document.getElementById('summaryTier').textContent = estimateData.tier;
        document.getElementById('summaryCost').textContent = estimateData.estimate;
        
        // Also populate hidden/input field
        const notesField = document.getElementById('consultationNotes');
        if (notesField) {
            notesField.value = `[Pre-selected Estimate: ${estimateData.room}, ${estimateData.area}, ${estimateData.tier} (${estimateData.estimate})]`;
        }
    }
    
    const bsModal = new bootstrap.Modal(consultationModalEl);
    bsModal.show();
}

/* -------------------------------------------------------------
 * 9. Form Handlers & Toast Notification Engine
 * ------------------------------------------------------------- */
function initFormHandlers() {
    // 1. Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input[type="email"]');
            if (!input || !input.value.trim() || !input.value.includes('@')) {
                showToast('Please enter a valid email address.', 'warning');
                return;
            }
            const email = input.value.trim();
            input.value = '';
            showToast(`✨ Welcome to VivaDecor Privé! A confirmation lookbook has been sent to ${email}.`, 'success');
        });
    }
    
    // 2. Consultation Booking Form
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('consultName').value.trim();
            const phone = document.getElementById('consultPhone').value.trim();
            const date = document.getElementById('consultDate').value;
            
            if (!name || !phone || !date) {
                showToast('Please fill in your name, contact phone, and preferred date.', 'warning');
                return;
            }
            
            // Close modal
            const modalEl = document.getElementById('consultationModal');
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
            
            consultationForm.reset();
            const summaryBox = document.getElementById('estimateSummaryBox');
            if (summaryBox) summaryBox.style.display = 'none';
            
            showToast(`🎉 Thank you, ${name}! Your consultation for ${date} has been reserved. Our senior architect will call ${phone} shortly.`, 'success', 6000);
        });
    }
    
    // 3. Client Sign Up / Portal Form
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value.trim();
            const modalEl = document.getElementById('authModal');
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
            authForm.reset();
            showToast(`🔐 Welcome to VivaDecor Client Portal (${email}). Project dashboard loaded.`, 'success');
        });
    }
    
    // 4. Quick Contact Form in Contact Section
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            
            if (!name || !email || !message) {
                showToast('Please fill out all required fields.', 'warning');
                return;
            }
            
            contactForm.reset();
            showToast(`✉️ Inquiry received! Thank you, ${name}. Our Beverly Hills team will respond within 2 hours.`, 'success', 5000);
        });
    }
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info', duration = 4500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-4';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    const toastEl = document.createElement('div');
    toastEl.className = `custom-toast toast-type-${type}`;
    
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    
    toastEl.innerHTML = `
        <div class="toast-content">
            <i class="fa-solid ${icon}"></i>
            <div class="toast-text">${message}</div>
        </div>
        <button type="button" class="toast-close-btn">&times;</button>
    `;
    
    container.appendChild(toastEl);
    
    // Animate in
    setTimeout(() => {
        toastEl.classList.add('show');
    }, 20);
    
    // Close button
    const closeBtn = toastEl.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
        removeToast(toastEl);
    });
    
    // Auto dismiss
    setTimeout(() => {
        removeToast(toastEl);
    }, duration);
}

function removeToast(toastEl) {
    toastEl.classList.remove('show');
    setTimeout(() => {
        if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
    }, 300);
}

/* -------------------------------------------------------------
 * 10. Floating Back to Top Button
 * ------------------------------------------------------------- */
function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* -------------------------------------------------------------
 * 11. Accordion Scroll Polish
 * ------------------------------------------------------------- */
function initAccordionScroll() {
    const accordionButtons = document.querySelectorAll('.s-3-accordian .accordion-button');
    accordionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Give smooth feel
        });
    });
}

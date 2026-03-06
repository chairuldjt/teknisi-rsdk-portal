/* ============================================
   TEKNISI RSDK PORTAL — IT Support Edition
   Search, Filter, Theme Toggle, Canvas Animation
   ============================================ */

(function () {
    'use strict';

    // ========== DOM Elements ==========
    const searchInput = document.getElementById('search-input');
    const serviceCards = document.querySelectorAll('.service-card');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const noResults = document.getElementById('no-results');
    const header = document.getElementById('header');
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    // ========== State ==========
    let activeCategory = 'all';
    let particles = [];
    const particleCount = 150; // High density
    const connectionDistance = 220; // Wide reach
    let width, height;

    // ========== Theme Handling ==========
    function getPreferredTheme() {
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update particle colors based on theme if needed
        if (theme === 'light') {
            updateParticleColor('rgba(99, 102, 241, 0.2)');
        } else {
            updateParticleColor('rgba(99, 102, 241, 0.3)');
        }
    }

    function updateParticleColor(color) {
        particles.forEach(p => p.color = color);
    }

    if (themeToggle) {
        setTheme(getPreferredTheme());
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            setTheme(next);
        });
    }

    // ========== Canvas Animation (Vector Background) ==========
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2.5 + 1.5; // Bigger particles
            this.color = 'rgba(99, 102, 241, 0.6)'; // More solid
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        if (canvas) {
            canvas.width = width;
            canvas.height = height;
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.update();
            p1.draw();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    const opacity = (1 - (dist / connectionDistance)) * 0.5; // Stronger visibility
                    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    if (canvas) {
        window.addEventListener('resize', resize);
        resize();
        initParticles();
        animate();
    }

    // ========== Search & Filter ==========
    function filterCards() {
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        serviceCards.forEach((card) => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const desc = card.querySelector('.card-desc').textContent.toLowerCase();
            const category = card.dataset.category;

            const matchesSearch = query === '' || title.includes(query) || desc.includes(query);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;

            if (matchesSearch && matchesCategory) {
                card.classList.remove('card-hidden');
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.classList.add('card-hidden');
                card.style.display = 'none';
            }
        });

        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                searchInput.blur();
                filterCards();
            }
        });
    }

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.category;
            filterCards();
        });
    });

    // ========== Header Scroll ==========
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (header) {
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }, { passive: true });

    // ========== Card Hover Follow ==========
    serviceCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // ========== Init ==========
    function init() {
        // Dynamic greeting
        const hour = new Date().getHours();
        let greeting;
        if (hour < 12) greeting = 'Selamat Pagi';
        else if (hour < 18) greeting = 'Selamat Siang';
        else greeting = 'Selamat Malam';

        // Fetch Quote from API
        fetchQuote();
    }

    async function fetchQuote() {
        const descEl = document.getElementById('hero-desc');
        if (!descEl) return;

        try {
            // Using dummyjson as a reliable source for quotes
            const response = await fetch('https://dummyjson.com/quotes/random');
            if (!response.ok) throw new Error('API Error');

            const data = await response.json();

            // Add a slight delay and fade effect
            descEl.style.opacity = '0';
            setTimeout(() => {
                descEl.textContent = `"${data.quote}" — ${data.author}`;
                descEl.style.transition = 'opacity 0.8s ease';
                descEl.style.opacity = '1';
            }, 500);

        } catch (error) {
            console.error('Quote Fetch Error:', error);
            // Fallback quote if API fails
            descEl.textContent = "Winter is coming... but our systems stay warm and running.";
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

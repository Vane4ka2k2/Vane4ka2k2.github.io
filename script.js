document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* ==========================================================================
       1. Mobile Menu Toggle
       ========================================================================== */
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', () => {
            mobileNavToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });

        // Close menu when link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavToggle.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });
    }

    /* ==========================================================================
       2. Dark / Light Theme Toggle
       ========================================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check system preference or localStorage
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        htmlElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    /* ==========================================================================
       3. Canvas Background (Audio Wave & Network Visualizer)
       ========================================================================== */
    const canvas = document.getElementById('canvas-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Resize Canvas
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Particles & Waves Config
        const particles = [];
        const particleCount = Math.min(40, Math.floor(window.innerWidth / 40));
        const waveCount = 3;
        let wavePhase = 0;

        // Populate particles (representing networks/nodes)
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 1
            });
        }

        // Animation Loop
        function animate() {
            const isDark = htmlElement.getAttribute('data-theme') === 'dark';
            
            // Clear screen with custom opacity for motion blur trail
            ctx.fillStyle = isDark ? 'rgba(7, 10, 19, 0.15)' : 'rgba(241, 245, 249, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw audio-inspired waves at the bottom half
            wavePhase += 0.005;
            for (let w = 0; w < waveCount; w++) {
                ctx.beginPath();
                ctx.lineWidth = 1 + w * 0.5;
                
                // Color configuration based on theme
                let waveColor;
                if (isDark) {
                    // Indigo to Cyan gradients in dark mode
                    waveColor = w === 0 
                        ? 'rgba(79, 70, 229, 0.12)' 
                        : w === 1 ? 'rgba(6, 182, 212, 0.1)' : 'rgba(99, 102, 241, 0.08)';
                } else {
                    // Soft blue/slate colors in light mode
                    waveColor = w === 0 
                        ? 'rgba(79, 70, 229, 0.06)' 
                        : w === 1 ? 'rgba(8, 145, 178, 0.05)' : 'rgba(99, 102, 241, 0.04)';
                }
                
                ctx.strokeStyle = waveColor;
                
                // Wave parameters
                const amplitude = 40 + w * 15;
                const frequency = 0.0015 - w * 0.0003;
                const verticalOffset = canvas.height * 0.65 + w * 30;

                for (let x = 0; x < canvas.width; x += 5) {
                    const y = Math.sin(x * frequency + wavePhase + (w * Math.PI / 4)) * amplitude + verticalOffset;
                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            // Draw network-inspired particles
            particles.forEach((p, idx) => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Screen boundaries collision
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Color configuration based on theme
                ctx.fillStyle = isDark ? 'rgba(6, 182, 212, 0.25)' : 'rgba(8, 145, 178, 0.15)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Draw connecting lines between close particles
                for (let j = idx + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 120) {
                        const alpha = (1 - dist / 120) * (isDark ? 0.08 : 0.05);
                        ctx.strokeStyle = isDark ? `rgba(79, 70, 229, ${alpha})` : `rgba(79, 70, 229, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        }

        animate();
    }

    /* ==========================================================================
       4. Projects Section Filter Logic
       ========================================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length && projectCards.length) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button state
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    
                    if (filterValue === 'all' || category === filterValue) {
                        card.style.display = 'flex';
                        // Trigger fade in
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.transition = 'all 0.4s ease';
                            card.style.opacity = '1';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    /* ==========================================================================
       5. Scroll Spy Navigation Highlight
       ========================================================================== */
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       6. Contact Form Validation & Submission
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const message = document.getElementById('form-message').value.trim();
            const submitBtn = document.getElementById('form-submit-btn');

            if (!name || !email || !message) {
                showStatus('Пожалуйста, заполните все поля.', 'error');
                return;
            }

            // Disable button during submission
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Отправка...';
            showStatus('Отправка сообщения...', '');

            // Real API Call via fetch to FormSubmit
            const actionUrl = contactForm.getAttribute('action');
            
            fetch(actionUrl, {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message,
                    _subject: "Новое сообщение с сайта-визитки!"
                })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Ошибка сети при отправке.');
                }
            })
            .then(data => {
                showStatus('Спасибо! Ваше сообщение успешно отправлено.', 'success');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Отправить сообщение <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>';
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    formStatus.style.opacity = '0';
                    setTimeout(() => {
                        formStatus.className = 'form-status';
                        formStatus.innerHTML = '';
                        formStatus.style.opacity = '1';
                    }, 300);
                }, 5000);
            })
            .catch(error => {
                showStatus('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Отправить сообщение <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>';
            });
        });

        function showStatus(text, className) {
            formStatus.className = `form-status ${className}`;
            formStatus.innerHTML = text;
        }
    }
});

/**
 * CVC Guindastes - Script Principal Premium (GSAP & ScrollTrigger)
 * Lógica SPA, Animações GSAP, Cursor Customizado, Efeitos Magnéticos, 3D Tilt, Galeria Lightbox e Mapas.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Remove a classe de loading imediatamente para evitar que o site fique travado
    document.body.classList.remove('gsap-loading');

    // --- Configurações Gerais ---
    const CONFIG = {
        whatsappNumber: '5511999999999',
        mapCenter: [-23.6552, -46.5312],
        mapZoom: 14
    };

    // --- Elementos do DOM ---
    const header = document.querySelector('.main-header');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const cursorDot = document.getElementById('cursor-dot');
    const cursorCircle = document.getElementById('cursor-circle');

    // --- Verificação de Segurança (Resiliência / Modo Offline) ---
    const hasGSAP = typeof gsap !== 'undefined';
    const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
    const isGsapActive = hasGSAP && hasScrollTrigger;

    if (!isGsapActive) {
        console.warn("GSAP ou ScrollTrigger não detectados. Ativando modo de compatibilidade e exibindo cursor padrão.");
        
        // Força o cursor padrão do sistema e a visibilidade de elementos GSAP
        document.body.style.cursor = 'default';
        const fallbackStyle = document.createElement('style');
        fallbackStyle.innerHTML = `
            * { cursor: auto !important; }
            .reveal-gsap, .reveal-gsap-split, .title-line, .page-section { opacity: 1 !important; transform: none !important; }
            .custom-cursor-dot, .custom-cursor-circle, .glow-orb, .tech-grid-overlay { display: none !important; }
            .page-section { display: none; }
            .page-section.active { display: block; }
        `;
        document.head.appendChild(fallbackStyle);
        
        // Inicializa roteamento estático compatível
        initStaticRouter();
        return;
    }

    // Registra os plugins do GSAP se estiverem disponíveis
    gsap.registerPlugin(ScrollTrigger);
    
    let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let ringPos = { x: mousePos.x, y: mousePos.y };
    const lerpSpeed = 0.15; // Velocidade de lag do anel externo
    let cursorVisible = false;

    // Inicialmente posiciona no centro mas deixa oculto via JS também
    gsap.set([cursorDot, cursorCircle], { xPercent: -50, yPercent: -50 });

    // Atualiza a posição do mouse e do ponto central imediatamente
    window.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
        
        // Ponto central segue o mouse de forma imediata e exata
        gsap.set(cursorDot, { x: e.clientX, y: e.clientY });
        
        // Faz o cursor aparecer suavemente na primeira movimentação do mouse
        if (!cursorVisible) {
            gsap.to([cursorDot, cursorCircle], { opacity: 1, duration: 0.3, overwrite: 'auto' });
            cursorVisible = true;
        }
    });

    // Loop de renderização com GSAP Ticker para o efeito lag elástico do círculo externo
    gsap.ticker.add(() => {
        ringPos.x += (mousePos.x - ringPos.x) * lerpSpeed;
        ringPos.y += (mousePos.y - ringPos.y) * lerpSpeed;
        
        gsap.set(cursorCircle, { x: ringPos.x, y: ringPos.y });
    });

    // Efeitos de Hover do Cursor
    const setupCursorHovers = () => {
        const hoverables = document.querySelectorAll('a, button, select, input, textarea, .tilt-card, .mobile-nav-toggle, .gallery-item');
        
        hoverables.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursorCircle.classList.add('hovering');
                // Se o elemento estiver sobre fundo escuro, usa o anel branco para contraste premium
                if (element.closest('.bg-dark') || element.closest('.bg-gradient-dark') || element.closest('.hero') || element.closest('.page-header') || element.closest('.lightbox-modal')) {
                    cursorCircle.classList.add('hovering-white');
                }
            });
            
            element.addEventListener('mouseleave', () => {
                cursorCircle.classList.remove('hovering', 'hovering-white');
            });
        });
    };

    // Efeito Click do Cursor
    window.addEventListener('mousedown', () => {
        cursorCircle.classList.add('click');
    });
    window.addEventListener('mouseup', () => {
        cursorCircle.classList.remove('click');
    });

    setupCursorHovers();

    // --- Efeito Magnético nos Elementos (.magnetic) ---
    const setupMagneticElements = () => {
        const magneticItems = document.querySelectorAll('.magnetic');
        
        magneticItems.forEach(item => {
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const itemCenterY = rect.top + rect.height / 2;
                
                // Distância do mouse ao centro do elemento
                const distanceX = e.clientX - itemCenterX;
                const distanceY = e.clientY - itemCenterY;
                
                // Força de atração configurada via atributo data-strength
                const strength = parseFloat(item.getAttribute('data-strength')) || 10;
                
                gsap.to(item, {
                    x: distanceX / strength,
                    y: distanceY / strength,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
            
            item.addEventListener('mouseleave', () => {
                // Efeito mola (snap back elástico) ao sair do raio de atração
                gsap.to(item, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: 'elastic.out(1.1, 0.4)'
                });
            });
        });
    };

    setupMagneticElements();

    // --- Efeito 3D Tilt nos Cards (.tilt-card) ---
    const setup3DTiltCards = () => {
        const tiltCards = document.querySelectorAll('.tilt-card');
        
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const width = rect.width;
                const height = rect.height;
                
                // Posição normalizada do mouse (entre -0.5 e 0.5)
                const relativeX = (e.clientX - rect.left) / width - 0.5;
                const relativeY = (e.clientY - rect.top) / height - 0.5;
                
                // Ângulos máximos de rotação
                const maxRotation = 14;
                
                gsap.to(card, {
                    rotateX: -relativeY * maxRotation,
                    rotateY: relativeX * maxRotation,
                    transformPerspective: 1000,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.6,
                    ease: 'power2.out'
                });
            });
        });
    };

    setup3DTiltCards();


    // --- Animações de Entrada da Home (Hero Reveal) ---
    const runHeroEntrance = () => {
        const heroSection = document.getElementById('home');
        if (!heroSection || !heroSection.classList.contains('active')) return;

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Efeito de zoom out suave na imagem de fundo do Hero
        tl.fromTo('.hero-img', 
            { scale: 1.25 }, 
            { scale: 1.0, duration: 2.2, ease: 'power3.inOut' }
        );

        // Revela o badge superior
        tl.fromTo('.hero-badge',
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.8 },
            '-=1.4'
        );

        // Prepara título do Hero para reveal por palavra
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle && !heroTitle.classList.contains('split-done')) {
            const rawText = heroTitle.innerHTML;
            const lines = heroTitle.innerHTML.split('<br>');
            heroTitle.innerHTML = lines.map(line => {
                return `<div class="title-line-mask" style="overflow:hidden; display:block;">
                    <span class="title-line" style="display:inline-block;">${line}</span>
                </div>`;
            }).join('');
            heroTitle.classList.add('split-done');
        }

        // Anima as linhas do título subindo usando fromTo robusto
        tl.fromTo('.title-line', 
            { yPercent: 100, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.15 },
            '-=1.1'
        );

        // Revela o subtítulo
        tl.fromTo('.hero-subtitle',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8 },
            '-=0.75'
        );

        // Revela as ações (botões) do Hero
        tl.fromTo('.hero-actions .btn',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 },
            '-=0.6'
        );

        // Revela o indicador de rolagem no rodapé do hero
        tl.fromTo('.hero-scroll-indicator',
            { opacity: 0, y: -10 },
            { opacity: 0.7, y: 0, duration: 0.6 },
            '-=0.3'
        );
    };


    // --- Animações de Scroll com ScrollTrigger ---
    const initScrollAnimations = () => {
        // Zera gatilhos antigos
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());

        // Seção Home ativa
        if (document.getElementById('home').classList.contains('active')) {
            
            // Revela Cabeçalho dos Diferenciais
            gsap.from('.differentials-section .gs-reveal-header', {
                opacity: 0,
                y: 50,
                duration: 0.8,
                scrollTrigger: {
                    trigger: '.differentials-section',
                    start: 'top 80%'
                }
            });

            // Revela Cards dos Diferenciais com Stagger
            gsap.from('.differentials-section .gs-reveal-card', {
                opacity: 0,
                y: 60,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.differentials-section',
                    start: 'top 65%'
                }
            });

            // Parallax na Imagem "Sobre Nós"
            gsap.to('.parallax-img', {
                yPercent: -15,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.about-section',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });

            // Revela Elementos da Seção "Sobre Nós"
            gsap.from('.about-section .gs-reveal-left', {
                opacity: 0,
                x: -60,
                duration: 1.0,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.about-section',
                    start: 'top 75%'
                }
            });

            gsap.from('.about-section .gs-reveal-right', {
                opacity: 0,
                x: 60,
                duration: 1.0,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.about-section',
                    start: 'top 75%'
                }
            });

            // Revela Galeria de Projetos
            gsap.from('.gallery-section .gs-reveal-header', {
                opacity: 0,
                y: 40,
                duration: 0.8,
                scrollTrigger: {
                    trigger: '.gallery-section',
                    start: 'top 80%'
                }
            });

            gsap.from('.gallery-section .gs-reveal-gallery-item', {
                opacity: 0,
                y: 50,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.gallery-grid',
                    start: 'top 75%'
                }
            });

            // Contadores Animados via GSAP ScrollTrigger
            const counters = document.querySelectorAll('.counter-number');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'), 10);
                const countObj = { val: 0 };
                
                gsap.to(countObj, {
                    val: target,
                    duration: 2.0,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '.numbers-section',
                        start: 'top 85%',
                        once: true
                    },
                    onUpdate: () => {
                        counter.textContent = Math.ceil(countObj.val);
                    }
                });
            });

            // Revela Cabeçalho do Google My Business
            gsap.from('.testimonials-section .gs-reveal-gmb-header', {
                opacity: 0,
                y: 40,
                duration: 0.8,
                scrollTrigger: {
                    trigger: '.testimonials-section',
                    start: 'top 80%'
                }
            });

            // Revela Depoimentos
            gsap.from('.testimonials-section .gs-reveal-testimonial', {
                opacity: 0,
                y: 50,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.testimonials-grid',
                    start: 'top 75%'
                }
            });

            // Botão Ver Mais GMB
            gsap.from('.testimonials-section .gs-reveal-gmb-btn', {
                opacity: 0,
                y: 20,
                duration: 0.6,
                scrollTrigger: {
                    trigger: '.gmb-action-container',
                    start: 'top 85%'
                }
            });

            // Animação de Entrada do CTA da Home
            gsap.from('.cta-section .gs-reveal-cta', {
                opacity: 0,
                scale: 0.95,
                y: 30,
                duration: 0.8,
                scrollTrigger: {
                    trigger: '.cta-section',
                    start: 'top 80%'
                }
            });
        }

        // Seção Serviços ativa
        if (document.getElementById('servicos').classList.contains('active')) {
            gsap.from('#servicos .gs-reveal-header', {
                opacity: 0,
                y: 40,
                duration: 0.8,
                ease: 'power3.out'
            });

            gsap.from('#servicos .gs-reveal-service', {
                opacity: 0,
                y: 50,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.services-grid',
                    start: 'top 75%'
                }
            });

            gsap.from('#servicos .gs-reveal-service-btn', {
                opacity: 0,
                y: 30,
                duration: 0.8,
                scrollTrigger: {
                    trigger: '.services-action-container',
                    start: 'top 85%'
                }
            });
        }

        // Seção Contato ativa
        if (document.getElementById('contato').classList.contains('active')) {
            gsap.from('#contato .gs-reveal-header', {
                opacity: 0,
                y: 40,
                duration: 0.8,
                ease: 'power3.out'
            });

            gsap.from('#contato .gs-reveal-contact-form', {
                opacity: 0,
                x: -50,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.contact-section',
                    start: 'top 75%'
                }
            });

            gsap.from('#contato .gs-reveal-contact-info', {
                opacity: 0,
                x: 50,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.contact-section',
                    start: 'top 75%'
                }
            });
        }

        // RECALCULA E ATUALIZA TODOS OS GATILHOS DO SCROLLTRIGGER APÓS A CRIAÇÃO
        ScrollTrigger.refresh();
    };


    // --- Galeria Lightbox (Custom JavaScript + GSAP) ---
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    let galleryItems = [];
    let currentImageIndex = 0;

    function initLightbox() {
        galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                currentImageIndex = index;
                openLightbox(item);
            });
        });

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', () => navigateLightbox(1));
        }

        // Fechar ao clicar no background
        if (lightboxModal) {
            lightboxModal.addEventListener('click', (e) => {
                if (e.target === lightboxModal || e.target.classList.contains('lightbox-content')) {
                    closeLightbox();
                }
            });
        }

        // Controle por teclado
        window.addEventListener('keydown', (e) => {
            if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
            
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        });
    }

    function openLightbox(item) {
        if (!lightboxModal) return;

        const imgSrc = item.getAttribute('data-src');
        const imgTitle = item.getAttribute('data-title');
        const imgDesc = item.getAttribute('data-desc');

        // Configura conteúdo
        lightboxImg.src = imgSrc;
        lightboxImg.alt = imgTitle;
        lightboxTitle.textContent = imgTitle;
        lightboxDesc.textContent = imgDesc;

        // Ativa modal
        lightboxModal.classList.add('active');

        // Animação GSAP de entrada do modal
        gsap.killTweensOf([lightboxImg, '.lightbox-caption']);
        
        gsap.fromTo(lightboxImg, 
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 }
        );

        gsap.fromTo('.lightbox-caption',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.3 }
        );
    }

    function closeLightbox() {
        if (!lightboxModal) return;

        // Animação GSAP de saída do modal
        gsap.to([lightboxImg, '.lightbox-caption'], {
            opacity: 0,
            y: 10,
            scale: 0.98,
            duration: 0.3,
            ease: 'power2.inOut',
            onComplete: () => {
                lightboxModal.classList.remove('active');
            }
        });
    }

    function navigateLightbox(direction) {
        currentImageIndex += direction;
        
        // Loop infinito na galeria
        if (currentImageIndex < 0) currentImageIndex = galleryItems.length - 1;
        if (currentImageIndex >= galleryItems.length) currentImageIndex = 0;

        const nextItem = galleryItems[currentImageIndex];
        const nextSrc = nextItem.getAttribute('data-src');
        const nextTitle = nextItem.getAttribute('data-title');
        const nextDesc = nextItem.getAttribute('data-desc');

        // Animação de transição (Slide/Fade rápido)
        gsap.timeline()
            .to([lightboxImg, '.lightbox-caption'], {
                opacity: 0,
                x: direction * -30,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                    // Troca imagens
                    lightboxImg.src = nextSrc;
                    lightboxImg.alt = nextTitle;
                    lightboxTitle.textContent = nextTitle;
                    lightboxDesc.textContent = nextDesc;
                    
                    // Reseta posição e faz fade-in do outro lado
                    gsap.set([lightboxImg, '.lightbox-caption'], { x: direction * 30 });
                }
            })
            .to([lightboxImg, '.lightbox-caption'], {
                opacity: 1,
                x: 0,
                duration: 0.35,
                ease: 'power3.out'
            });
    }

    initLightbox();


    // --- Roteador SPA com Transições Fluídas do GSAP ---
    const routes = {
        '#/home': 'home',
        '#/servicos': 'servicos',
        '#/contato': 'contato'
    };

    let mapInitialized = false;
    let leafletMap = null;
    let isFirstLoad = true;

    const sections = document.querySelectorAll('.page-section');

    function router() {
        const hash = window.location.hash || '#/home';
        const pageId = routes[hash] || 'home';
        
        if (!routes[hash]) {
            window.location.hash = '#/home';
            return;
        }

        const currentSection = document.querySelector('.page-section.active');
        const targetSection = document.getElementById(pageId);

        // Se for a primeira carga, inicializa tudo explicitamente
        if (isFirstLoad) {
            isFirstLoad = false;
            
            sections.forEach(section => {
                if (section.id === pageId) {
                    section.classList.add('active');
                    section.style.display = 'block';
                    gsap.set(section, { opacity: 1, y: 0 });
                } else {
                    section.classList.remove('active');
                    section.style.display = 'none';
                    gsap.set(section, { opacity: 0 });
                }
            });

            // Roda as animações adequadas
            if (pageId === 'home') runHeroEntrance();
            initScrollAnimations();
            setupCursorHovers();
            setupMagneticElements();
            setup3DTiltCards();
            initLightbox();
            
            if (pageId === 'contato') setTimeout(initOrRefreshMap, 100);
            return;
        }

        // Se clicar no link da mesma página, faz nada
        if (currentSection === targetSection) return;

        // Timeline de transição SPA com GSAP
        const transitionTimeline = gsap.timeline({
            onStart: () => {
                document.body.style.pointerEvents = 'none';
            },
            onComplete: () => {
                document.body.style.pointerEvents = 'all';
                setupCursorHovers();
                setupMagneticElements();
                setup3DTiltCards();
                initLightbox(); // Atualiza após transição
            }
        });

        // 1. Desaparece com a página atual
        transitionTimeline.to(currentSection, {
            opacity: 0,
            y: -20,
            duration: 0.35,
            ease: 'power2.inOut',
            onComplete: () => {
                currentSection.classList.remove('active');
                currentSection.style.display = 'none';
            }
        });

        // 2. Prepara e ativa a página destino
        transitionTimeline.set(targetSection, {
            display: 'block',
            opacity: 0,
            y: 30
        });

        // Rola instantaneamente para o topo
        transitionTimeline.add(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
        });

        // 3. Aparece com a nova página
        transitionTimeline.to(targetSection, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: 'power3.out',
            onStart: () => {
                targetSection.classList.add('active');
                
                // Reinicializa/atualiza o ScrollTrigger para a nova aba
                ScrollTrigger.refresh();
                initScrollAnimations();

                // Roda animação do Hero se voltar para home
                if (pageId === 'home') runHeroEntrance();
                
                // Inicializa mapa se for contato
                if (pageId === 'contato') {
                    setTimeout(initOrRefreshMap, 100);
                }
            }
        });

        // Atualiza a classe ativa na navegação
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPage = link.getAttribute('data-page');
            if (linkPage === pageId) {
                link.classList.add('active');
            }
        });
    }

    // Eventos do Roteador
    window.addEventListener('hashchange', router);
    window.addEventListener('load', router);


    // --- Controle do Menu Mobile ---
    function toggleMobileMenu() {
        const isOpen = navMenu.classList.contains('open');
        if (isOpen) {
            navMenu.classList.remove('open');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
            gsap.to('.nav-menu', { y: '-120%', opacity: 0, duration: 0.4, ease: 'power2.inOut' });
        } else {
            navMenu.classList.add('open');
            mobileNavToggle.setAttribute('aria-expanded', 'true');
            gsap.fromTo('.nav-menu', 
                { y: '-120%', opacity: 0 },
                { y: '0%', opacity: 1, duration: 0.5, ease: 'power3.out' }
            );
        }
    }

    mobileNavToggle.addEventListener('click', toggleMobileMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // Rolagem no Header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // --- Validação do Formulário e Integração WhatsApp ---
    const contactForm = document.getElementById('contact-form');
    const successContainer = document.getElementById('form-success');
    const btnResetForm = document.getElementById('btn-reset-form');
    const submitBtn = contactForm ? contactForm.querySelector('.btn-submit') : null;
    const spinner = submitBtn ? submitBtn.querySelector('.spinner') : null;
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validateForm()) {
                submitBtn.disabled = true;
                spinner.classList.remove('hidden');
                btnText.style.opacity = '0.3';
                
                setTimeout(() => {
                    submitBtn.disabled = false;
                    spinner.classList.add('hidden');
                    btnText.style.opacity = '1';
                    
                    // Animação de transição para o Sucesso com GSAP
                    gsap.to(contactForm, {
                        opacity: 0,
                        y: -10,
                        duration: 0.3,
                        onComplete: () => {
                            contactForm.style.display = 'none';
                            successContainer.classList.remove('hidden');
                            
                            gsap.fromTo(successContainer,
                                { opacity: 0, y: 15 },
                                { opacity: 1, y: 0, duration: 0.4 }
                            );
                            
                            triggerWhatsAppRedirect();
                        }
                    });
                    
                }, 1500);
            }
        });
    }

    if (btnResetForm) {
        btnResetForm.addEventListener('click', () => {
            contactForm.reset();
            contactForm.style.display = 'grid';
            gsap.set(contactForm, { opacity: 1, y: 0 });
            successContainer.classList.add('hidden');
        });
    }

    function validateForm() {
        let isValid = true;
        const inputs = contactForm.querySelectorAll('[required]');
        
        inputs.forEach(input => {
            const formGroup = input.closest('.form-group');
            formGroup.classList.remove('error');
            
            if (!input.value.trim()) {
                formGroup.classList.add('error');
                isValid = false;
            } else if (input.type === 'email' && !validateEmail(input.value)) {
                formGroup.classList.add('error');
                isValid = false;
            } else if (input.type === 'tel' && input.value.trim().length < 8) {
                formGroup.classList.add('error');
                isValid = false;
            }
        });
        
        return isValid;
    }

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }

    function triggerWhatsAppRedirect() {
        const name = document.getElementById('name').value.trim();
        const company = document.getElementById('company').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const serviceType = document.getElementById('service_type').value;
        const message = document.getElementById('message').value.trim();

        let text = `*Nova Solicitação de Orçamento - CVC Guindastes*\n\n`;
        text += `*Nome:* ${name}\n`;
        text += `*Empresa:* ${company}\n`;
        text += `*Telefone:* ${phone}\n`;
        text += `*E-mail:* ${email}\n`;
        text += `*Serviço:* ${serviceType}\n`;
        if (message) {
            text += `*Mensagem:* ${message}\n`;
        }

        const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }


    // --- Inicialização do Mapa Leaflet ---
    function initOrRefreshMap() {
        const mapElement = document.getElementById('leaflet-map');
        if (!mapElement) return;

        if (!mapInitialized) {
            leafletMap = L.map('leaflet-map', {
                center: CONFIG.mapCenter,
                zoom: CONFIG.mapZoom,
                scrollWheelZoom: false
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(leafletMap);

            const orangeIcon = L.divIcon({
                html: `<div style="
                    background-color: var(--primary-color);
                    width: 14px;
                    height: 14px;
                    border: 3px solid #FFF;
                    border-radius: 50%;
                    box-shadow: 0 0 15px var(--primary-color);
                "></div>`,
                className: 'custom-map-marker',
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });

            const marker = L.marker(CONFIG.mapCenter, { icon: orangeIcon }).addTo(leafletMap);
            
            marker.bindPopup(`
                <div style="font-family: var(--font-body); padding: 5px;">
                    <h5 style="color: var(--primary-color); font-family: var(--font-title); margin: 0 0 5px 0; font-size: 1.05rem; font-weight: 700;">CVC Guindastes</h5>
                    <p style="margin: 0; font-size: 0.85rem; color: #555; line-height: 1.4;">
                        Sede Operacional & Frota<br>
                        Distrito Industrial, São Paulo - SP
                    </p>
                </div>
            `, {
                closeButton: false,
                offset: [0, -5]
            }).openPopup();

            mapInitialized = true;
        } else {
            leafletMap.invalidateSize();
            leafletMap.setView(CONFIG.mapCenter, CONFIG.mapZoom);
        }
    }

    // --- Roteador Estático de Fallback (Caso GSAP falhe) ---
    function initStaticRouter() {
        const routes = {
            '#/home': 'home',
            '#/servicos': 'servicos',
            '#/contato': 'contato'
        };
        const localSections = document.querySelectorAll('.page-section');
        const localNavLinks = document.querySelectorAll('.nav-link');

        function staticRouter() {
            const hash = window.location.hash || '#/home';
            const pageId = routes[hash] || 'home';
            
            localSections.forEach(section => {
                if (section.id === pageId) {
                    section.classList.add('active');
                    section.style.display = 'block';
                    section.style.opacity = '1';
                } else {
                    section.classList.remove('active');
                    section.style.display = 'none';
                    section.style.opacity = '0';
                }
            });

            localNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === pageId) {
                    link.classList.add('active');
                }
            });

            window.scrollTo({ top: 0, behavior: 'instant' });
            
            if (pageId === 'contato') {
                if (typeof L !== 'undefined') {
                    setTimeout(initOrRefreshMap, 100);
                }
            }
        }

        window.addEventListener('hashchange', staticRouter);
        window.addEventListener('load', staticRouter);
        staticRouter();
    }
});

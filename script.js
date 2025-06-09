document.addEventListener('DOMContentLoaded', () => {
    
    let allProjects = [];
    let allCertificates = [];
    let currentProjectPage = 0;
    const projectsPerPage = 3;

    // --- Helper function to categorize certificates ---
    function getCertificateCategory(certificate) {
        const titleLower = certificate.title.toLowerCase();
        const skillsLower = certificate.skills.map(s => s.toLowerCase());
        const descriptionLower = certificate.description.toLowerCase();

        if (titleLower.includes("business intelligence") || titleLower.includes("power bi") || skillsLower.includes("power bi") || skillsLower.includes("análisis de datos") || skillsLower.includes("dax") || skillsLower.includes("visualización de datos") || descriptionLower.includes("business intelligence")) {
            return "Business Intelligence & Data Analysis";
        }
        if (titleLower.includes("sql") || skillsLower.includes("sql") || skillsLower.includes("bases de datos")) {
             return "Database Management & SQL";
        }
        if (titleLower.includes("ciencias de datos") || titleLower.includes("python") || skillsLower.includes("python") || skillsLower.includes("machine learning") || titleLower.includes("ingeniería de datos")) {
            return "Data Science & Programming";
        }
        if (titleLower.includes("excel") || skillsLower.includes("excel") || skillsLower.includes("tablas dinámicas")) {
            return "Excel & Office Productivity";
        }
        if (titleLower.includes("agile") || titleLower.includes("scrum") || titleLower.includes("pmi") || titleLower.includes("gestión de proyectos") || titleLower.includes("trello") || titleLower.includes("project managemen")) {
            return "Project Management & Agile";
        }
        if (titleLower.includes("frontend") || titleLower.includes("algoritmos") || titleLower.includes("ingeniería de software") || skillsLower.includes("html") || skillsLower.includes("css") || skillsLower.includes("javascript")) {
            return "Software Development & Fundamentals";
        }
        if (titleLower.includes("liderazgo") || skillsLower.includes("liderazgo") || skillsLower.includes("trabajo en equipo")) {
            return "Leadership & Soft Skills";
        }
        return "Other Certifications"; // Fallback category
    }


    // --- Fetch Data ---
    async function loadData() {
        try {
            const response = await fetch('./data.json'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allProjects = data.projects;
            allCertificates = data.certificates;
            
            renderProjects();
            renderProjectNavigation();
            renderCertificates(); 
            setupEventListeners(); // This will now include the updated form logic
            initAnimations();
        } catch (error) {
            console.error("No se pudo cargar el archivo data.json:", error);
            const projectsContainer = document.getElementById('projects-gallery');
            if (projectsContainer) projectsContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">Error al cargar los proyectos. Asegúrate de que data.json exista y sea accesible.</p>';
            const certificatesContainer = document.getElementById('certificates-accordion');
            if (certificatesContainer) certificatesContainer.innerHTML = '<p class="text-center text-red-500">Error al cargar las certificaciones.</p>';
        }
    }

    // --- Render Functions ---
    function renderProjects() {
        const gallery = document.getElementById('projects-gallery');
        if (!gallery) return;
        gallery.innerHTML = '';
        const startIndex = currentProjectPage * projectsPerPage;
        const endIndex = startIndex + projectsPerPage;
        const projectsToDisplay = allProjects.slice(startIndex, endIndex);

        if (projectsToDisplay.length === 0 && currentProjectPage > 0 && allProjects.length > 0) {
             currentProjectPage--;
             renderProjects();
             return;
        }
         if (projectsToDisplay.length === 0 && allProjects.length === 0) {
            gallery.innerHTML = '<p class="text-center text-gray-400 col-span-full">No hay proyectos para mostrar.</p>';
            return;
        }

        projectsToDisplay.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card bg-card rounded-lg shadow-lg overflow-hidden animate-in flex flex-col';
            
            let buttonsHTML = `
                <a href="${project.link}" target="_blank" class="inline-block bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-cyan-700 transition transform hover:scale-105">
                   🚀 Ver Demo
                </a>`;
            if (project.codeLink) {
                buttonsHTML += `
                <a href="${project.codeLink}" target="_blank" class="ml-2 inline-block bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-700 transition transform hover:scale-105">
                   <i class="fab fa-github"></i> Ver Código
                </a>`;
            }

            card.innerHTML = `
                <div class="project-image-container cursor-pointer project-image-trigger" data-img-src="${project.img}">
                    <img src="${project.img}" alt="Imagen del proyecto ${project.title}" class="project-actual-image">
                </div>
                <div class="p-6 flex flex-col flex-grow"> 
                    <h3 class="text-xl font-bold mb-2 text-white">${project.title}</h3>
                    <p class="text-gray-400 text-sm mb-4 h-20 overflow-y-auto flex-grow">${project.desc || "Descripción no disponible."}</p> 
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${project.tech.map(t => `<span class="bg-gray-700 text-cyan-300 text-xs font-medium px-2.5 py-0.5 rounded-full">${t}</span>`).join('')}
                    </div>
                    <div class="mt-auto">
                       ${buttonsHTML}
                    </div>
                </div>
            `;
            gallery.appendChild(card);
        });
        
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--x', `${e.clientX - rect.left}px`);
                card.style.setProperty('--y', `${e.clientY - rect.top}px`);
            });
        });
        
        document.querySelectorAll('.project-image-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                openModal(trigger.dataset.imgSrc);
            });
        });
    }

    function renderProjectNavigation() {
        const navigation = document.getElementById('projects-navigation');
        if(!navigation) return;
        navigation.innerHTML = '';
        const totalPages = Math.ceil(allProjects.length / projectsPerPage);
        
        if (totalPages <= 1) return;

        const prevButton = document.createElement('button');
        prevButton.innerHTML = `<i class="fas fa-arrow-left"></i> Anterior`;
        prevButton.className = 'bg-gray-700 px-4 py-2 rounded-md hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition';
        prevButton.disabled = currentProjectPage === 0;
        prevButton.addEventListener('click', () => {
            if (currentProjectPage > 0) {
                currentProjectPage--;
                renderProjects();
                updateNavButtons();
            }
        });

        const nextButton = document.createElement('button');
        nextButton.innerHTML = `Siguiente <i class="fas fa-arrow-right"></i>`;
        nextButton.className = 'bg-gray-700 px-4 py-2 rounded-md hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition';
        nextButton.disabled = currentProjectPage >= totalPages - 1;
        nextButton.addEventListener('click', () => {
            if (currentProjectPage < totalPages - 1) {
                currentProjectPage++;
                renderProjects();
                updateNavButtons();
            }
        });

        const pageIndicator = document.createElement('span');
        pageIndicator.id = 'page-indicator';
        pageIndicator.className = 'text-gray-400';
        pageIndicator.textContent = `Página ${currentProjectPage + 1} de ${totalPages}`;
        
        navigation.appendChild(prevButton);
        navigation.appendChild(pageIndicator);
        navigation.appendChild(nextButton);
    }

    function updateNavButtons() {
        const totalPages = Math.ceil(allProjects.length / projectsPerPage);
        const prevButton = document.querySelector('#projects-navigation button:first-child');
        const nextButton = document.querySelector('#projects-navigation button:last-child');
        const pageIndicator = document.getElementById('page-indicator');

        if (prevButton) prevButton.disabled = currentProjectPage === 0;
        if (nextButton) nextButton.disabled = currentProjectPage >= totalPages - 1;
        if (pageIndicator) pageIndicator.textContent = `Página ${currentProjectPage + 1} de ${totalPages}`;
    }

    function renderCertificates() {
        const accordionContainer = document.getElementById('certificates-accordion');
        if (!accordionContainer) return;
        accordionContainer.innerHTML = '';

        if (allCertificates.length === 0) {
            accordionContainer.innerHTML = '<p class="text-center text-gray-400">No hay certificaciones para mostrar.</p>';
            return;
        }

        const categorizedCertificates = allCertificates.reduce((acc, cert) => {
            const category = getCertificateCategory(cert);
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(cert);
            return acc;
        }, {});

        const categoryOrder = [ 
            "Business Intelligence & Data Analysis",
            "Database Management & SQL",
            "Data Science & Programming",
            "Excel & Office Productivity",
            "Project Management & Agile",
            "Software Development & Fundamentals",
            "Leadership & Soft Skills",
            "Other Certifications"
        ];
        
        let isFirstRenderedCategory = true; 

        categoryOrder.forEach(categoryName => {
            const certificatesInCategory = categorizedCertificates[categoryName];
            if (certificatesInCategory && certificatesInCategory.length > 0) {
                const categoryWrapper = document.createElement('div');
                categoryWrapper.className = 'certificate-category-header';

                const categoryToggleBtn = document.createElement('button');
                categoryToggleBtn.className = 'certificate-category-toggle';
                categoryToggleBtn.innerHTML = `
                    <span>${categoryName} (${certificatesInCategory.length})</span>
                    <i class="fas fa-chevron-down transition-transform duration-300 transform"></i>
                `;

                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'certificate-items-container';

                certificatesInCategory.forEach(cert => {
                    const itemCard = document.createElement('div');
                    itemCard.className = 'certificate-item-card'; 
                    itemCard.innerHTML = `
                        <div class="p-5"> 
                            <h4 class="font-semibold text-lg mb-1 text-white">${cert.title}</h4>
                            <p class="text-sm text-gray-500 mb-3">${cert.institution} - ${cert.date} | ${cert.duration}</p>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                <div class="md:col-span-2">
                                    <p class="text-gray-400 text-sm mb-3">${cert.description}</p>
                                    <div class="flex flex-wrap gap-2">
                                        ${cert.skills.map(skill => `<span class="bg-gray-700 text-cyan-300 text-xs font-medium px-2.5 py-0.5 rounded-full">${skill}</span>`).join('')}
                                    </div>
                                </div>
                                <div class="md:col-span-1 flex items-center justify-center md:justify-end">
                                    <img src="${cert.image}" alt="Certificado ${cert.title}" class="w-full h-auto max-w-[150px] md:max-w-xs rounded-md shadow-lg cursor-pointer certificate-image" data-img-src="${cert.image}"/>
                                </div>
                            </div>
                        </div>
                    `;
                    itemsContainer.appendChild(itemCard);
                });

                categoryWrapper.appendChild(categoryToggleBtn);
                categoryWrapper.appendChild(itemsContainer);
                accordionContainer.appendChild(categoryWrapper);

                categoryToggleBtn.addEventListener('click', () => {
                    const icon = categoryToggleBtn.querySelector('.fa-chevron-down');
                    const allItemContainers = accordionContainer.querySelectorAll('.certificate-items-container');
                    const allIcons = accordionContainer.querySelectorAll('.certificate-category-toggle .fa-chevron-down');
                    
                    const isOpening = !itemsContainer.style.maxHeight || itemsContainer.style.maxHeight === "0px";

                    allItemContainers.forEach(container => {
                        if (container !== itemsContainer) {
                            container.style.maxHeight = null;
                        }
                    });
                    allIcons.forEach(ico => {
                        if (ico !== icon) {
                            ico.classList.remove('rotate-180');
                        }
                    });

                    if (isOpening) {
                        itemsContainer.style.maxHeight = itemsContainer.scrollHeight + "px";
                        icon.classList.add('rotate-180');
                    } else {
                        itemsContainer.style.maxHeight = null;
                        icon.classList.remove('rotate-180');
                    }
                });

                if (isFirstRenderedCategory) {
                    itemsContainer.style.maxHeight = itemsContainer.scrollHeight + "px";
                    categoryToggleBtn.querySelector('.fa-chevron-down').classList.add('rotate-180');
                    isFirstRenderedCategory = false; 
                }
            }
        });

        document.querySelectorAll('.certificate-image').forEach(img => {
            img.addEventListener('click', (e) => {
                openModal(e.target.dataset.imgSrc);
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 150,
                        spread: 90,
                        origin: { y: 0.6 },
                        zIndex: 10000 
                    });
                }
            });
        });
    }
    
    // --- UPDATED setupEventListeners function ---
    function setupEventListeners() {
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
        
        document.querySelectorAll('#mobile-menu a, nav a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                     mobileMenu.classList.add('hidden');
                }
                const targetId = link.getAttribute('href');
                if (targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        const modal = document.getElementById('image-modal');
        const closeModalBtn = document.getElementById('modal-close-btn');
        if (modal && closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
        
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                 alert('Navega por las secciones usando el menú. Haz clic en las imágenes de proyectos y certificados para verlos en grande. ¡Disfruta la experiencia!');
            });
        }
        
        window.addEventListener('scroll', () => {
            const header = document.getElementById('main-header');
            if (header) {
                if (window.scrollY > 50) {
                    header.classList.add('py-2', 'bg-black/70');
                    header.classList.remove('py-3');
                } else {
                    header.classList.remove('py-2', 'bg-black/70');
                    header.classList.add('py-3');
                }
            }
        });

        const currentYearEl = document.getElementById('current-year');
        if(currentYearEl) currentYearEl.textContent = new Date().getFullYear();

        // --- Contact Form Logic with Validation and Mailto ---
        const contactForm = document.getElementById('contact-form');
        const formStatus = document.getElementById('form-status'); 

        const nameError = document.getElementById('name-error');
        const emailError = document.getElementById('email-error');
        const messageError = document.getElementById('message-error');

        if (contactForm) {
            contactForm.removeAttribute('action'); 
            contactForm.removeAttribute('method');

            contactForm.addEventListener('submit', function(event) {
                event.preventDefault(); 

                if(nameError) nameError.classList.add('hidden');
                if(emailError) emailError.classList.add('hidden');
                if(messageError) messageError.classList.add('hidden');
                if(formStatus) {
                    formStatus.textContent = '';
                    formStatus.classList.remove('text-green-500', 'text-red-500');
                }

                const nameInput = document.getElementById('name');
                const emailInput = document.getElementById('email');
                const messageInput = document.getElementById('message');

                const name = nameInput ? nameInput.value.trim() : '';
                const email = emailInput ? emailInput.value.trim() : '';
                const message = messageInput ? messageInput.value.trim() : '';
                let isValid = true;

                if (name === "" && nameError) {
                    nameError.textContent = "El nombre es obligatorio.";
                    nameError.classList.remove('hidden');
                    isValid = false;
                }
                if ((email === "" || !validateEmail(email)) && emailError) {
                    emailError.textContent = email === "" ? "El email es obligatorio." : "Introduce un email válido.";
                    emailError.classList.remove('hidden');
                    isValid = false;
                }
                if (message === "" && messageError) {
                    messageError.textContent = "El mensaje es obligatorio.";
                    messageError.classList.remove('hidden');
                    isValid = false;
                }

                if (isValid) {
                    const recipientEmail = "darielpena2000@gmail.com"; // YOUR TARGET EMAIL ADDRESS
                    const subject = `Contacto desde Portafolio Web - ${name}`;
                    const body = `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`;

                    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    const mailWindow = window.open(mailtoLink, '_blank');

                    if (mailWindow || navigator.userAgent.toLowerCase().indexOf('firefox') > -1) { 
                        if(formStatus) {
                            formStatus.textContent = "Preparando tu cliente de correo... Por favor, envía el email desde allí.";
                            formStatus.classList.add('text-green-500');
                        }
                        contactForm.reset(); 
                    } else {
                        if(formStatus) {
                            formStatus.textContent = "No se pudo abrir tu cliente de correo. Por favor, copia los detalles y envía manualmente.";
                            formStatus.classList.add('text-red-500');
                            console.warn("Mailto link (copia manualmente):", mailtoLink);
                        }
                    }
                } else {
                     if(formStatus) {
                        formStatus.textContent = "Por favor, corrige los errores en el formulario.";
                        formStatus.classList.add('text-red-500');
                    }
                }
            });
        }
    }
    // --- END of UPDATED setupEventListeners function ---
    
    function openModal(src) {
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        if (modal && modalImage) {
            modalImage.src = src;
            modal.classList.remove('invisible', 'opacity-0');
            modal.querySelector('.modal-content').classList.remove('scale-95');
            document.body.style.overflow = 'hidden'; 
        }
    }

    function closeModal() {
        const modal = document.getElementById('image-modal');
        if (modal) {
            modal.classList.add('invisible', 'opacity-0');
            modal.querySelector('.modal-content').classList.add('scale-95');
            document.body.style.overflow = ''; 
        }
    }

    // --- Helper function for email validation ---
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function initAnimations() {
        const skillsChartCanvas = document.getElementById('skillsChart');
        if (skillsChartCanvas && typeof Chart !== 'undefined') {
            const ctx = skillsChartCanvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(0, 170, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 0, 200, 0.6)');

            new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Power BI', 'SQL', 'Python (Pandas)', 'Excel Avanzado', 'Modelado de Datos', 'Visualización', 'Gestión Proyectos', 'BI Estratégico'],
                    datasets: [{
                        label: 'Nivel de Habilidad',
                        data: [95, 90, 85, 98, 92, 97, 88, 90],
                        backgroundColor: gradient,
                        borderColor: 'rgba(0, 170, 255, 1)',
                        pointBackgroundColor: '#fff',
                        pointBorderColor: 'rgba(0, 170, 255, 1)',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(0, 170, 255, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                            grid: { color: 'rgba(255, 255, 255, 0.2)' },
                            pointLabels: {
                                color: '#c9d1d9',
                                font: { size: 12 }
                            },
                            ticks: {
                                color: '#c9d1d9',
                                backdropColor: 'transparent',
                                stepSize: 20,
                                font: { size: 10 }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: { color: '#c9d1d9' }
                        }
                    }
                }
            });
        }

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.utils.toArray('.animate-in').forEach(elem => {
                gsap.fromTo(elem, 
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        scrollTrigger: {
                            trigger: elem,
                            start: 'top 90%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            });
        }
    }
    
    loadData();
});
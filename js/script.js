//dame el element ready pero en vanilla js
document.addEventListener("DOMContentLoaded", function() {

    const hamburgerButton = document.querySelector('.hamburger-button');
    const closeButton = document.querySelector('.close-menu-button');
    const mobileMenu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelectorAll('#mobile-menu nav a'); // Enlaces y botón Resume

    const openMenu = () => {
        if (mobileMenu.hidden) { // Solo abre si está cerrado
            hamburgerButton.setAttribute('aria-expanded', 'true');
            // hamburgerButton.classList.add('is-active'); // Ya no es necesario para la 'X'

            mobileMenu.hidden = false;
            // Forzar reflow para asegurar que la transición funcione al quitar 'hidden'
            // void mobileMenu.offsetWidth; // Descomentar si la animación no funciona bien
            mobileMenu.classList.add('is-open');

            document.body.classList.add('menu-open');
            // Enfocar el botón de cerrar o el menú para accesibilidad
            closeButton.focus();
        }
    };

    const closeMenu = () => {
        if (!mobileMenu.hidden) { // Solo cierra si está abierto
            hamburgerButton.setAttribute('aria-expanded', 'false');
            // hamburgerButton.classList.remove('is-active'); // Ya no es necesario

            mobileMenu.classList.remove('is-open');
            // Espera que termine la transición antes de ocultar con 'hidden'
             mobileMenu.addEventListener('transitionend', () => {
                 mobileMenu.hidden = true;
             }, { once: true }); // Asegura que el listener se ejecute solo una vez

            document.body.classList.remove('menu-open');
            // Devolver foco al botón que abrió el menú
             hamburgerButton.focus();
        }
    };

    // --- Event Listeners ---

    // Botón Hamburguesa: Solo abre
    hamburgerButton.addEventListener('click', openMenu);

    // Botón Cerrar ('X'): Solo cierra
    closeButton.addEventListener('click', closeMenu);

    // Enlaces dentro del menú: Cierran el menú
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Tecla Escape: Cierra el menú
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.hidden) {
            closeMenu();
        }
    });

    // Selecciona todas las secciones
    const sections = document.querySelectorAll('section');

    // Configura el Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Agrega la clase para hacer visible la sección
                entry.target.classList.add('section-visible');
                // Deja de observar la sección una vez que es visible
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // El porcentaje de visibilidad necesario para activar
    });

    // Aplica el observer a cada sección
    sections.forEach(section => {
        section.classList.add('section-hidden'); // Asegúrate de que estén ocultas inicialmente
        observer.observe(section);
    });

    // Selecciona el header y los aside
    const elementsToObserve = document.querySelectorAll('header, aside');

    // Configura el Intersection Observer
    const observerElements = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Agrega la clase para hacer visible el elemento
                entry.target.classList.add('visible');
                // Deja de observar el elemento una vez que es visible
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // El porcentaje de visibilidad necesario para activar
    });

    // Aplica el observer a cada elemento
    elementsToObserve.forEach(element => {
        element.classList.add('hidden'); // Asegúrate de que estén ocultos inicialmente
        observerElements.observe(element);
    });

    const tabs = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.tab-panel');
    const tabList = document.querySelector('.tab-list');
    const highlight = document.querySelector('.tab-highlight'); // Selecciona la barra

    // Función para mover el highlight (si existe)
    const moveHighlight = (activeIndex) => {
        if (highlight) {
            const tabHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tab-height') || '42px');
            highlight.style.transform = `translateY(${activeIndex * tabHeight}px)`;
        }
    };

    // Mueve el highlight a la posición inicial activa
    const initialActiveIndex = Array.from(tabs).findIndex(tab => tab.classList.contains('active'));
    if (initialActiveIndex !== -1) {
        moveHighlight(initialActiveIndex);
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // 1. Desactivar todos los tabs y paneles
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
                t.setAttribute('tabindex', '-1'); // No enfocable por defecto
            });
            panels.forEach(p => {
                p.classList.remove('active');
                p.hidden = true;
            });

            // 2. Activar el tab clickeado y su panel correspondiente
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            tab.setAttribute('tabindex', '0'); // Enfocable
            const panelId = tab.getAttribute('aria-controls');
            const correspondingPanel = document.getElementById(panelId);
            if (correspondingPanel) {
                correspondingPanel.classList.add('active');
                correspondingPanel.hidden = false;
            }

             // 3. Mover el highlight
             moveHighlight(index);

             tab.focus(); // Opcional: Mover el foco al tab activo
        });

         // Permitir navegación con teclado (básico)
         tab.addEventListener('keydown', (e) => {
             let newIndex = index;
             if (e.key === 'ArrowDown') {
                 newIndex = (index + 1) % tabs.length;
             } else if (e.key === 'ArrowUp') {
                 newIndex = (index - 1 + tabs.length) % tabs.length;
             }

             if (newIndex !== index) {
                 tabs[newIndex].focus(); // Mueve el foco, el click handler se activará si presionan Enter/Space
                 // Podríamos activar directamente el tab aquí también
                 // tabs[newIndex].click();
             }
         });

    });

});
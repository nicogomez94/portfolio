document.addEventListener("DOMContentLoaded", function() {

    const hamburgerButton = document.querySelector('.hamburger-button');
    const closeButton = document.querySelector('.close-menu-button');
    const mobileMenu = document.querySelector('#mobile-menu');
    const menuLinks = document.querySelectorAll('#mobile-menu nav a');

    const openMenu = () => {
        if (mobileMenu.hidden) {
            hamburgerButton.setAttribute('aria-expanded', 'true');
            mobileMenu.hidden = false;
            mobileMenu.classList.add('is-open');
            document.body.classList.add('menu-open');
            closeButton.focus();
        }
    };

    const closeMenu = () => {
        if (!mobileMenu.hidden) {
            hamburgerButton.setAttribute('aria-expanded', 'false');
            mobileMenu.classList.remove('is-open');
            mobileMenu.addEventListener('transitionend', () => {
                mobileMenu.hidden = true;
            }, { once: true });
            document.body.classList.remove('menu-open');
            hamburgerButton.focus();
        }
    };

    hamburgerButton.addEventListener('click', openMenu);
    closeButton.addEventListener('click', closeMenu);
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.hidden) {
            closeMenu();
        }
    });

    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        section.classList.add('section-hidden');
        observer.observe(section);
    });

    const elementsToObserve = document.querySelectorAll('header, aside');
    const observerElements = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    elementsToObserve.forEach(element => {
        element.classList.add('hidden');
        observerElements.observe(element);
    });

    const tabs = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.tab-panel');
    const tabList = document.querySelector('.tab-list');
    const highlight = document.querySelector('.tab-highlight');

    const moveHighlight = (activeIndex) => {
        if (highlight) {
            const tabHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tab-height') || '42px');
            highlight.style.transform = `translateY(${activeIndex * tabHeight}px)`;
        }
    };

    const initialActiveIndex = Array.from(tabs).findIndex(tab => tab.classList.contains('active'));
    if (initialActiveIndex !== -1) {
        moveHighlight(initialActiveIndex);
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
                t.setAttribute('tabindex', '-1');
            });
            panels.forEach(p => {
                p.classList.remove('active');
                p.hidden = true;
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            tab.setAttribute('tabindex', '0');
            const panelId = tab.getAttribute('aria-controls');
            const correspondingPanel = document.getElementById(panelId);
            if (correspondingPanel) {
                correspondingPanel.classList.add('active');
                correspondingPanel.hidden = false;
            }
            moveHighlight(index);
            tab.focus();
        });

        tab.addEventListener('keydown', (e) => {
            let newIndex = index;
            if (e.key === 'ArrowDown') {
                newIndex = (index + 1) % tabs.length;
            } else if (e.key === 'ArrowUp') {
                newIndex = (index - 1 + tabs.length) % tabs.length;
            }
            if (newIndex !== index) {
                tabs[newIndex].focus();
            }
        });
    });

});
/*
    script.js
    MDB Consulting Single-Page Website
    ---
    Handles:
    1. Sticky Header on Scroll
    2. Active Navigation Link Highlighting on Scroll
    3. Client Logo Slider (Swiper.js)
    4. Testimonial Slider (Swiper.js)
*/

document.addEventListener('DOMContentLoaded', function () {

    // 1. Sticky Header
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Active Navigation Link Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');

    const activateNavOnScroll = () => {
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - (header.offsetHeight + 50)) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentSection)) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', activateNavOnScroll);
    activateNavOnScroll(); // Initial check on page load

    // 3. Client Logo Slider (Swiper.js)
    const logoSlider = new Swiper('.logo-slider', {
        loop: true,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        slidesPerView: 2,
        spaceBetween: 30,
        breakpoints: {
            // when window width is >= 576px
            576: {
                slidesPerView: 3,
                spaceBetween: 30
            },
            // when window width is >= 768px
            768: {
                slidesPerView: 4,
                spaceBetween: 40
            },
            // when window width is >= 992px
            992: {
                slidesPerView: 5,
                spaceBetween: 50
            },
        }
    });

    // 4. Testimonial Slider (Swiper.js)
    const testimonialSlider = new Swiper('.testimonial-slider', {
        loop: true,
        autoplay: {
            delay: 6000, // Slower for reading
            disableOnInteraction: false,
        },
        slidesPerView: 1,
        spaceBetween: 30,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    });

});
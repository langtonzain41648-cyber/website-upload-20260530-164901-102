(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var carousel = document.querySelector('[data-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var active = 0;

        function showSlide(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5600);
        }
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var searchInput = document.querySelector('.search-input');
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    var clearButton = document.querySelector('.clear-search');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var keyword = normalize(searchInput ? searchInput.value : '');
        var filters = {};
        filterSelects.forEach(function (select) {
            filters[select.getAttribute('data-filter')] = select.value;
        });
        var visible = 0;
        cards.forEach(function (card) {
            var searchText = normalize(card.getAttribute('data-search') || card.textContent);
            var matched = !keyword || searchText.indexOf(keyword) !== -1;
            Object.keys(filters).forEach(function (key) {
                if (filters[key] && card.getAttribute('data-' + key) !== filters[key]) {
                    matched = false;
                }
            });
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        var empty = document.querySelector('.empty-state');
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    filterSelects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
    });
    if (clearButton) {
        clearButton.addEventListener('click', function () {
            if (searchInput) {
                searchInput.value = '';
            }
            filterSelects.forEach(function (select) {
                select.value = '';
            });
            applyFilters();
        });
    }

    function initVideo(video) {
        if (!video || video.dataset.ready === '1') {
            return;
        }
        var source = video.getAttribute('data-src');
        if (!source) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }
        video.dataset.ready = '1';
    }

    Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(function (video) {
        var overlay = video.parentElement ? video.parentElement.querySelector('.player-overlay') : null;
        var button = overlay ? overlay.querySelector('.play-trigger') : null;

        function startPlayback() {
            initVideo(video);
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        video.addEventListener('click', startPlayback);
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });
        if (button) {
            button.addEventListener('click', startPlayback);
        }
    });
})();

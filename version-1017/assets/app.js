(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-menu');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            menu.hidden = expanded;
            toggle.textContent = expanded ? '☰' : '×';
        });
    }

    function initHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = selectAll('.hero-slide', carousel);
        var dots = selectAll('[data-hero-dot]', carousel);
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                activate(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                activate(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                activate(dotIndex);
                start();
            });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    function initLibraryFilters() {
        selectAll('[data-library-filter]').forEach(function (section) {
            var input = section.querySelector('.library-search');
            var cards = selectAll('[data-search]', section);
            var buttons = selectAll('[data-filter-value]', section);
            var empty = section.querySelector('.empty-state');
            var activeFilter = 'all';

            if (section.getAttribute('data-query-param') && input) {
                var query = new URLSearchParams(window.location.search).get(section.getAttribute('data-query-param')) || '';
                input.value = query;
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var year = card.getAttribute('data-year') || '';
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesFilter = activeFilter === 'all' || year === activeFilter;
                    var visible = matchesKeyword && matchesFilter;
                    card.hidden = !visible;
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeFilter = button.getAttribute('data-filter-value') || 'all';
                    buttons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function initPlayers() {
        selectAll('.player-shell').forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.player-overlay');
            var source = shell.getAttribute('data-source');
            var hls = null;
            var loaded = false;

            if (!video || !source) {
                return;
            }

            function loadSource() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }

            function startPlayback() {
                loadSource();
                video.controls = true;
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', startPlayback);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 && overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    initMenu();
    initHero();
    initLibraryFilters();
    initPlayers();
})();

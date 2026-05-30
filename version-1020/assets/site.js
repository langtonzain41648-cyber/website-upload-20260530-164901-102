(function () {
    function bindMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function bindHero() {
        var hero = document.querySelector('[data-hero-carousel]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle('is-active', pos === current);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle('is-active', pos === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }
        dots.forEach(function (dot, pos) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(pos);
                start();
            });
        });
        show(0);
        start();
    }

    function bindFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var input = document.querySelector('[data-filter-input]');
        var yearSelect = document.querySelector('[data-year-select]');
        var typeSelect = document.querySelector('[data-type-select]');
        var empty = document.querySelector('[data-empty-state]');
        if (!cards.length || !input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            input.value = query;
        }
        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (year && cardYear !== year) {
                    ok = false;
                }
                if (type && cardType !== type) {
                    ok = false;
                }
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        input.addEventListener('input', apply);
        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', apply);
        }
        apply();
    }

    function bindSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindMenu();
        bindHero();
        bindFilters();
        bindSearchForms();
    });
}());

function initVideoPlayer(streamUrl) {
    var stage = document.querySelector('[data-player]');
    if (!stage) {
        return;
    }
    var video = stage.querySelector('video');
    var cover = stage.querySelector('.player-cover');
    var button = stage.querySelector('.play-button');
    var started = false;
    var hlsInstance = null;
    function attach() {
        if (!video || started) {
            return;
        }
        started = true;
        video.controls = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
        if (cover) {
            cover.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }
    if (button) {
        button.addEventListener('click', attach);
    }
    if (cover) {
        cover.addEventListener('click', attach);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (!started) {
                attach();
            }
        });
        video.addEventListener('ended', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }
}

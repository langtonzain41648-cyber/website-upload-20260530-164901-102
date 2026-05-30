(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initHeader() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");

    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 20);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (toggle) {
      toggle.addEventListener("click", function () {
        document.body.classList.toggle("nav-open");
      });
    }
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initFilterPanels() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var section = scope.closest(".section-wrap") || document;
      var input = section.querySelector("[data-filter-input]");
      var selects = Array.prototype.slice.call(section.querySelectorAll("[data-filter-select]"));
      var counter = section.querySelector("[data-filter-count]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      function update() {
        var query = normalize(input ? input.value : "");
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute("data-filter-select")] = normalize(select.value);
        });

        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var matched = !query || text.indexOf(query) !== -1;

          Object.keys(filters).forEach(function (key) {
            if (!filters[key]) {
              return;
            }
            var cardValue = normalize(card.getAttribute("data-" + key));
            if (cardValue !== filters[key]) {
              matched = false;
            }
          });

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = "当前显示 " + visible + " 部影片";
        }
      }

      if (input) {
        input.addEventListener("input", update);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", update);
      });
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<a class="tag" href="search.html?q=' + encodeURIComponent(tag) + '">#' + escapeHtml(tag) + "</a>";
    }).join("");

    return [
      '<article class="movie-card toffee-card hover-lift">',
      '  <a class="poster-frame" href="' + movie.path + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" onerror="this.remove();">',
      '    <span class="movie-badge">' + escapeHtml(movie.type) + "</span>",
      '    <span class="poster-shine"></span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '    <h3><a href="' + movie.path + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine || "") + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.getElementById("searchResults");
    var input = document.querySelector("[data-live-search]");
    var button = document.querySelector("[data-live-search-button]");
    var summary = document.getElementById("searchSummary");

    if (!results || !input || !window.MOVIE_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var query = normalize(input.value);
      if (!query) {
        results.innerHTML = "";
        summary.textContent = "请输入关键词开始搜索";
        return;
      }

      var matches = window.MOVIE_DATA.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" "));
        return text.indexOf(query) !== -1;
      }).slice(0, 120);

      summary.textContent = "找到 " + matches.length + " 条结果" + (matches.length === 120 ? "，已显示前 120 条" : "");
      results.innerHTML = matches.map(cardTemplate).join("");
    }

    input.addEventListener("input", render);
    if (button) {
      button.addEventListener("click", render);
    }
    render();
  }

  function initForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initFilterPanels();
    initSearchPage();
    initForms();
  });
})();

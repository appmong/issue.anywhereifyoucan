/* =========================================================
   Taboola-style Recommend Widget Loader
   - recommends.json 읽어 포스트 하단에 카드 렌더
   - 모바일/PC 반응형 (CSS가 처리)
   - URL 1개만 있어도 정상 표시
   사용:
   <div id="tbw-widget"></div>
   <script src="https://yourproj.pages.dev/widget.js"
           data-container="tbw-widget"
           data-title="함께 보면 좋은 글"
           data-max="10"
           data-shuffle="true"></script>
   ========================================================= */
(function () {
  "use strict";

  var script = document.currentScript;
  var BASE = script.src.replace(/\/[^\/]*$/, "");   // widget.js가 있는 폴더 = 저장소 루트
  var containerId = (script.dataset.container || "tbw-widget");
  var headTitle = (script.dataset.title || "함께 보면 좋은 글");
  var maxItems = parseInt(script.dataset.max || "10", 10);
  var shuffle = (script.dataset.shuffle || "false") === "true";

  // 캐시 우회용 버전 (날짜 단위) — Cloudflare 캐시 반영 지연 완화
  var v = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  var jsonUrl = BASE + "/recommends.json?v=" + v;

  // CSS 자동 로드 (이미 링크돼 있으면 생략)
  (function ensureCss() {
    var cssUrl = BASE + "/widget.css";
    var exists = Array.prototype.some.call(
      document.querySelectorAll('link[rel="stylesheet"]'),
      function (l) { return l.href.indexOf("widget.css") !== -1; }
    );
    if (!exists) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssUrl;
      document.head.appendChild(link);
    }
  })();

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function shuffleArr(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pickPosts(posts) {
    // 우선순위 내림차순 정렬
    var arr = posts.slice().sort(function (a, b) {
      return (b.priority || 0) - (a.priority || 0);
    });
    if (shuffle) {
      // 우선순위 유지하되 동순위 내에서만 섞고 싶으면 복잡 → 전체 셔플 옵션 제공
      shuffleArr(arr);
    }
    return arr.slice(0, maxItems);
  }

  function cardHtml(p) {
    var thumb = p.thumb ? (BASE + "/" + p.thumb) : "";
    var thumbHtml = thumb
      ? '<div class="tbw-thumb"><img src="' + esc(thumb) +
        '" loading="lazy" alt=""></div>'
      : '<div class="tbw-thumb"></div>';
    var tagHtml = p.tag
      ? '<span class="tbw-tag">' + esc(p.tag) + "</span>" : "";
    var descHtml = p.desc
      ? '<p class="tbw-desc">' + esc(p.desc) + "</p>" : "";
    return '' +
      '<a class="tbw-card" href="' + esc(p.url) +
      '" target="_blank" rel="noopener">' +
        thumbHtml +
        '<div class="tbw-body">' +
          tagHtml +
          '<p class="tbw-title">' + esc(p.title) + "</p>" +
          descHtml +
        "</div>" +
      "</a>";
  }

  function render(data) {
    var root = document.getElementById(containerId);
    if (!root) return;
    var posts = (data && data.posts) ? data.posts : [];
    if (!posts.length) { root.innerHTML = ""; return; }

    var picked = pickPosts(posts);
    var singleClass = picked.length === 1 ? " tbw-single" : "";
    var html =
      '<div class="tbw-root">' +
        '<div class="tbw-head">' +
          "<h3>" + esc(headTitle) + "</h3>" +
          '<span class="tbw-brand">AD</span>' +
        "</div>" +
        '<div class="tbw-grid' + singleClass + '">' +
          picked.map(cardHtml).join("") +
        "</div>" +
      "</div>";
    root.innerHTML = html;
  }

  function load() {
    fetch(jsonUrl, { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(render)
      .catch(function (e) {
        // 조용히 실패 (본문 레이아웃 깨지지 않게)
        if (window.console) console.warn("[tbw] load failed:", e);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();

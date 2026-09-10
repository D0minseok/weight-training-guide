/* =========================================================
   웨이트 트레이닝 입문 가이드 — 앱 로직 (바닐라 JS, 빌드 불필요)
   ========================================================= */
(function () {
  "use strict";

  const { CATEGORIES, EXERCISES, BEGINNER_GUIDE } = window.WT_DATA;

  const HOME_BG =
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1920&q=80";

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, props = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on") && typeof v === "function")
        node.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) node.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  };
  const catById = (id) => CATEGORIES.find((c) => c.id === id);
  const exById = (id) => EXERCISES.find((e) => e.id === id);
  const exOfCat = (id) => EXERCISES.filter((e) => e.category === id);

  const dom = {
    bg: $("#bgLayer"),
    nav: $("#nav"),
    content: $("#content"),
    crumbs: $("#crumbs"),
    search: $("#searchInput"),
    results: $("#searchResults"),
    sidebar: $("#sidebar"),
    backdrop: $("#sidebarBackdrop"),
    menuBtn: $("#menuBtn"),
    closeBtn: $("#sidebarClose"),
  };

  /* ---------- 배경 이미지 ---------- */
  let lastBg = "";
  function setBg(url) {
    const next = url || HOME_BG;
    if (next === lastBg) return;
    lastBg = next;
    const img = new Image();
    img.onload = () => {
      dom.bg.style.backgroundImage = `url("${next}")`;
    };
    img.onerror = () => {
      dom.bg.style.backgroundImage =
        "linear-gradient(135deg, #1a1f2b 0%, #0d0f12 60%)";
    };
    img.src = next;
  }

  /* ---------- 사이드바 내비게이션 ---------- */
  function buildNav() {
    dom.nav.innerHTML = "";
    CATEGORIES.forEach((cat) => {
      const list = el(
        "ul",
        { class: "nav__list" },
        exOfCat(cat.id).map((ex) =>
          el("li", {}, [
            el("a", {
              href: `#/exercise/${ex.id}`,
              "data-link": "",
              "data-exid": ex.id,
              text: ex.name,
            }),
          ])
        )
      );
      const btn = el("button", { class: "nav__cat", "data-catid": cat.id }, [
        el("span", { class: "ico", text: cat.icon }),
        el("span", { text: cat.short + " 운동" }),
        el("span", { class: "cnt", text: String(exOfCat(cat.id).length) }),
        el("span", { class: "arrow", text: "▶" }),
      ]);
      const group = el("div", { class: "nav__group", "data-catid": cat.id }, [
        btn,
        list,
      ]);
      btn.addEventListener("click", (e) => {
        // 화살표/개수 영역이 아닌 텍스트 클릭 시엔 카테고리로 이동
        const willOpen = !group.classList.contains("is-open");
        closeAllGroups();
        if (willOpen) group.classList.add("is-open");
        if (e.detail !== 0) location.hash = `#/cat/${cat.id}`;
      });
      dom.nav.appendChild(group);
    });
  }
  function closeAllGroups() {
    dom.nav
      .querySelectorAll(".nav__group.is-open")
      .forEach((g) => g.classList.remove("is-open"));
  }
  function highlightNav(route) {
    dom.nav.querySelectorAll(".nav__cat").forEach((b) =>
      b.classList.toggle(
        "is-current",
        (route.name === "cat" && b.dataset.catid === route.id) ||
          (route.name === "exercise" &&
            b.dataset.catid === exById(route.id)?.category)
      )
    );
    dom.nav.querySelectorAll(".nav__list a").forEach((a) =>
      a.classList.toggle(
        "is-current",
        route.name === "exercise" && a.dataset.exid === route.id
      )
    );
    // 현재 부위 그룹 펼치기
    const activeCat =
      route.name === "cat"
        ? route.id
        : route.name === "exercise"
        ? exById(route.id)?.category
        : null;
    if (activeCat) {
      dom.nav
        .querySelectorAll(".nav__group")
        .forEach((g) =>
          g.classList.toggle("is-open", g.dataset.catid === activeCat)
        );
    }
  }

  /* ---------- 조각 렌더러 ---------- */
  function chip(text, mod = "") {
    return el("span", { class: `chip ${mod}`.trim(), text });
  }
  function exerciseCard(ex) {
    const card = el("article", { class: "ex-card", tabindex: "0", role: "link" }, [
      el("div", {
        class: "ex-card__thumb",
        style: `background-image:url("${ex.image}")`,
      }),
      el("div", { class: "ex-card__body" }, [
        el("h4", { text: ex.name }),
        el("div", { class: "en", text: ex.english }),
        el("div", { class: "ex-card__meta" }, [
          chip(ex.level, `chip--lv ${ex.level}`),
          chip(ex.equipment),
          ex.primary[0] ? chip(ex.primary[0]) : null,
        ]),
      ]),
    ]);
    const go = () => (location.hash = `#/exercise/${ex.id}`);
    card.addEventListener("click", go);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
    return card;
  }

  /* ---------- 페이지: 홈 ---------- */
  function renderHome() {
    setBg(HOME_BG);
    dom.content.innerHTML = "";
    dom.content.append(
      el("section", { class: "hero" }, [
        el("h1", {
          html: '무겁게 시작하지 말고,<br /><span class="accent">바르게</span> 시작하세요.',
        }),
        el("p", {
          text:
            "웨이트 트레이닝을 처음 접하는 사람을 위한 부위별 운동 가이드입니다. " +
            "가슴 · 등 · 어깨 · 팔 · 하체 다섯 부위로 나눠, 각 운동의 자세와 초보자 팁, 흔한 실수를 정리했습니다.",
        }),
      ]),
      el("div", { class: "section-title", text: "부위 선택" }),
      el(
        "div",
        { class: "cat-grid" },
        CATEGORIES.map((cat) => {
          const c = el("a", { class: "cat-card", href: `#/cat/${cat.id}`, "data-link": "" }, [
            el("div", {
              class: "cat-card__img",
              style: `background-image:url("${cat.image}")`,
            }),
            el("span", { class: "tag", text: `${exOfCat(cat.id).length}개 운동` }),
            el("h3", {}, [el("span", { text: cat.icon }), document.createTextNode(" " + cat.name)]),
            el("p", { text: cat.summary }),
          ]);
          return c;
        })
      ),
      el("div", { class: "section-title", text: "먼저 읽어보세요" }),
      el("a", { class: "foot-link", href: "#/guide", "data-link": "", style: "max-width:340px" }, [
        document.createTextNode("📋 입문자 공통 가이드 — 세트·반복·과부하·부상 신호"),
      ])
    );
  }

  /* ---------- 페이지: 부위 ---------- */
  function renderCategory(id) {
    const cat = catById(id);
    if (!cat) return renderNotFound();
    setBg(cat.image.replace("w=1600", "w=1920"));
    dom.content.innerHTML = "";
    dom.content.append(
      el("a", { class: "back-link", href: "#/", "data-link": "" }, "← 전체 부위"),
      el("section", { class: "hero", style: "padding-top:12px" }, [
        el("h1", {}, [el("span", { text: cat.icon + " " }), document.createTextNode(cat.name)]),
        el("p", { text: cat.summary }),
      ]),
      el("div", { class: "section-title", text: `운동 ${exOfCat(id).length}개` }),
      el("div", { class: "ex-grid" }, exOfCat(id).map(exerciseCard))
    );
  }

  /* ---------- 페이지: 운동 상세 ---------- */
  function renderExercise(id) {
    const ex = exById(id);
    if (!ex) return renderNotFound();
    const cat = catById(ex.category);
    setBg(ex.image.replace("w=1200", "w=1920"));
    dom.content.innerHTML = "";

    const siblings = exOfCat(ex.category);
    const idx = siblings.findIndex((e) => e.id === ex.id);
    const prev = siblings[idx - 1];
    const next = siblings[idx + 1];

    dom.content.append(
      el("a", { class: "back-link", href: `#/cat/${cat.id}`, "data-link": "" }, `← ${cat.name}`),
      el("div", { class: "detail__hero" }, [
        el("div", { class: "bgimg", style: `background-image:url("${ex.image}")` }),
        el("div", {}, [
          el("h1", { text: ex.name }),
          el("div", { class: "en", text: ex.english }),
        ]),
      ]),
      el("div", { class: "detail__meta" }, [
        chip(ex.level, `chip--lv ${ex.level}`),
        chip("장비: " + ex.equipment),
        chip("주동근: " + ex.primary.join(", ")),
        ex.secondary.length ? chip("협응근: " + ex.secondary.join(", ")) : null,
      ]),
      el("div", { class: "detail__cols" }, [
        el("div", {}, [
          panel("동작 방법", "steps", el("ol", { class: "steps" }, ex.steps.map((s) => el("li", { text: s })))),
          panel("초보자 팁", "tips", el("ul", { class: "bullets" }, ex.tips.map((s) => el("li", { text: s })))),
          panel("흔한 실수", "warn", el("ul", { class: "bullets warn" }, ex.mistakes.map((s) => el("li", { text: s })))),
        ]),
        el("aside", {}, [
          el("div", { class: "aside-card" }, [
            el("h3", { text: "추천 세트 / 반복" }),
            el("p", { class: "kv", html: ex.sets }),
          ]),
          el("div", { class: "aside-card", style: "margin-top:14px;background:rgba(255,255,255,0.05);border-color:var(--border)" }, [
            el("h3", { text: "이 운동이 속한 부위", style: "color:var(--text)" }),
            el("p", { class: "kv", html: `<b>${cat.icon} ${cat.name}</b>` }),
            el("p", { class: "kv", text: cat.summary }),
            el("a", { class: "foot-link", href: `#/cat/${cat.id}`, "data-link": "", style: "margin-top:8px" }, `${cat.short} 운동 전체 보기 →`),
          ]),
        ]),
      ]),
      el("div", { class: "prevnext" }, [
        prev
          ? el("a", { class: "prev", href: `#/exercise/${prev.id}`, "data-link": "" }, [
              el("small", { text: "이전" }),
              document.createTextNode(prev.name),
            ])
          : el("span"),
        next
          ? el("a", { class: "next", href: `#/exercise/${next.id}`, "data-link": "" }, [
              el("small", { text: "다음" }),
              document.createTextNode(next.name),
            ])
          : el("span"),
      ])
    );
  }
  function panel(title, mod, bodyNode) {
    return el("div", { class: "panel" }, [
      el("h2", {}, [el("span", { class: "dot" }), document.createTextNode(title)]),
      bodyNode,
    ]);
  }

  /* ---------- 페이지: 가이드 ---------- */
  function renderGuide() {
    setBg("https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1920&q=80");
    dom.content.innerHTML = "";
    dom.content.append(
      el("a", { class: "back-link", href: "#/", "data-link": "" }, "← 홈"),
      el("section", { class: "hero", style: "padding-top:12px" }, [
        el("h1", { text: "📋 입문자 공통 가이드" }),
        el("p", { text: "부위별 운동을 시작하기 전에 알아두면 좋은 원칙들입니다." }),
      ]),
      el("div", { class: "guide-grid" }, BEGINNER_GUIDE.map((g) =>
        el("div", { class: "guide-item" }, [
          el("h3", { text: g.title }),
          el("p", { text: g.body }),
        ])
      ))
    );
  }

  function renderNotFound() {
    setBg(HOME_BG);
    dom.content.innerHTML =
      '<section class="hero"><h1>페이지를 찾을 수 없어요</h1><p><a data-link href="#/">홈으로 돌아가기</a></p></section>';
  }

  /* ---------- 빵부스러기(브레드크럼) ---------- */
  function setCrumbs(route) {
    dom.crumbs.innerHTML = "";
    const add = (label, href) => {
      if (dom.crumbs.children.length)
        dom.crumbs.append(el("span", { class: "sep", text: "/" }));
      dom.crumbs.append(
        href
          ? el("a", { href, "data-link": "", text: label })
          : el("span", { class: "here", text: label })
      );
    };
    add("홈", route.name === "home" ? null : "#/");
    if (route.name === "guide") add("입문자 가이드");
    if (route.name === "cat") add(catById(route.id)?.name || "부위");
    if (route.name === "exercise") {
      const ex = exById(route.id);
      if (ex) {
        add(catById(ex.category).name, `#/cat/${ex.category}`);
        add(ex.name);
      }
    }
  }

  /* ---------- 검색 ---------- */
  function runSearch(q) {
    const query = q.trim().toLowerCase();
    if (!query) {
      dom.results.hidden = true;
      dom.results.innerHTML = "";
      return;
    }
    const hits = EXERCISES.map((ex) => {
      const hay = [
        ex.name,
        ex.english,
        ex.equipment,
        ex.level,
        catById(ex.category).name,
        ...ex.primary,
        ...ex.secondary,
      ]
        .join(" ")
        .toLowerCase();
      return { ex, ok: hay.includes(query) };
    })
      .filter((r) => r.ok)
      .slice(0, 12);

    dom.results.innerHTML = "";
    if (!hits.length) {
      dom.results.append(
        el("div", { class: "res res--empty", text: `'${q}' 검색 결과가 없습니다.` })
      );
    } else {
      hits.forEach(({ ex }) => {
        const row = el("div", { class: "res", role: "button", tabindex: "0" }, [
          el("b", { text: ex.name }),
          el("span", {
            text: `${catById(ex.category).name} · ${ex.equipment} · ${ex.level}`,
          }),
        ]);
        const go = () => {
          location.hash = `#/exercise/${ex.id}`;
          dom.search.value = "";
          runSearch("");
        };
        row.addEventListener("click", go);
        row.addEventListener("keydown", (e) => {
          if (e.key === "Enter") go();
        });
        dom.results.append(row);
      });
    }
    dom.results.hidden = false;
  }

  /* ---------- 라우터 ---------- */
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, "");
    const parts = h.split("/").filter(Boolean);
    if (!parts.length) return { name: "home" };
    if (parts[0] === "guide") return { name: "guide" };
    if (parts[0] === "cat" && parts[1]) return { name: "cat", id: parts[1] };
    if (parts[0] === "exercise" && parts[1])
      return { name: "exercise", id: parts[1] };
    return { name: "home" };
  }

  function router() {
    const route = parseHash();
    switch (route.name) {
      case "cat": renderCategory(route.id); break;
      case "exercise": renderExercise(route.id); break;
      case "guide": renderGuide(); break;
      default: renderHome();
    }
    setCrumbs(route);
    highlightNav(route);
    closeSidebar();
    dom.results.hidden = true;
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  /* ---------- 모바일 사이드바 ---------- */
  function openSidebar() {
    dom.sidebar.classList.add("is-open");
    dom.backdrop.classList.add("is-open");
  }
  function closeSidebar() {
    dom.sidebar.classList.remove("is-open");
    dom.backdrop.classList.remove("is-open");
  }

  /* ---------- 초기화 ---------- */
  function init() {
    buildNav();
    dom.menuBtn.addEventListener("click", openSidebar);
    dom.closeBtn.addEventListener("click", closeSidebar);
    dom.backdrop.addEventListener("click", closeSidebar);
    dom.search.addEventListener("input", (e) => runSearch(e.target.value));
    dom.search.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        dom.search.value = "";
        runSearch("");
      }
    });
    document.addEventListener("click", (e) => {
      if (!dom.results.hidden && !e.target.closest(".search")) {
        dom.results.hidden = true;
      }
    });
    window.addEventListener("hashchange", router);
    router();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

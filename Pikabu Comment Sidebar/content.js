let enabled = false;
let currentUrl = location.href;

let scrollFixDone = false;
let wasNavigation = false;
let toggleScrollFixDone = false;

/* =========================
   ONLY STORY PAGES
========================= */

function isStoryPage() {
  return /^https:\/\/pikabu\.ru\/story\//.test(location.href);
}

/* =========================
   TOGGLE
========================= */

function setEnabled(state) {

  // расширение работает ТОЛЬКО на story
  if (!isStoryPage()) {
    enabled = false;

    document.body.classList.remove(
      "pikabu-comments-sidebar-enabled"
    );

    return;
  }

  enabled = state;

  if (enabled) {

    scrollFixDone = false;
    toggleScrollFixDone = false;
    wasNavigation = true;

    document.body.classList.add(
      "pikabu-comments-sidebar-enabled"
    );

    runScrollFixOnEnable();

/* =========================
   DONATE BUTTON
========================= */

function createDonateButton() {

  // уже существует
  if (
    document.getElementById(
      "pikabu-sidebar-donate"
    )
  ) {
    return;
  }

  if (!enabled) return;

  const sidebar =
    document.querySelector(".comments")
    || document.querySelector("[data-role='comments']")
    || document.querySelector("#comments");

  if (!sidebar) return;

  const btn = document.createElement("a");

  btn.id = "pikabu-sidebar-donate";

  btn.href =
    "https://dalink.to/flipmirror";

  btn.target = "_blank";

  btn.innerText = "❤️ Donate";

  // вставка ВВЕРХ sidebar
  sidebar.appendChild(btn);
}

createDonateButton();

  } else {

    document.body.classList.remove(
      "pikabu-comments-sidebar-enabled"
    );

removeDonateButton();
  }
}

/* =========================
   INIT
========================= */

chrome.storage.local.get("enabled", (res) => {
  setEnabled(!!res.enabled);
});

/* =========================
   EXTENSION TOGGLE
========================= */

chrome.runtime.onMessage.addListener((msg) => {

  if (msg.type === "TOGGLE_SIDEBAR") {
    setEnabled(msg.enabled);
  }
});

/* =========================
   SPA NAVIGATION SUPPORT
========================= */

setInterval(() => {

  if (location.href !== currentUrl) {

    currentUrl = location.href;

    // при смене URL проверяем страницу
    if (enabled && isStoryPage()) {

      document.body.classList.add(
        "pikabu-comments-sidebar-enabled"
      );

    } else {

      document.body.classList.remove(
        "pikabu-comments-sidebar-enabled"
      );
    }
  }

}, 300);

console.log("Pikabu sidebar extension loaded");

/* =========================
   DETECT NAVIGATION
========================= */

(function detectNavigationType() {

  try {

    const nav = performance
      .getEntriesByType("navigation")[0];

    // reload
    if (nav && nav.type === "reload") {

      wasNavigation = false;
      return;
    }

    wasNavigation = true;

  } catch (e) {

    wasNavigation = true;
  }

})();

/* =========================
   DETECT COMMENTS ENTRY
========================= */

function isCommentsPage() {
  return location.hash.includes("comments");
}

/* =========================
   WAIT FOR AUTO SCROLL
========================= */

function runScrollFix() {

  if (!enabled) return;
  if (!wasNavigation) return;
  if (scrollFixDone) return;
  if (!isCommentsPage()) return;

  scrollFixDone = true;

  let checks = 0;

  const interval = setInterval(() => {

    checks++;

    const scrolledDown =
      window.scrollY > 200;

    if (scrolledDown || checks > 10) {

      clearInterval(interval);

      setTimeout(() => {

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

        console.log(
          "[Pikabu] auto-scroll corrected"
        );

      }, 300);
    }

  }, 200);
}

/* =========================
   RUN ON LOAD
========================= */

window.addEventListener("load", () => {

  if (!enabled) return;
  if (!isStoryPage()) return;

  runScrollFix();
});

/* =========================
   RESET ON ENABLE
========================= */

function runScrollFixOnEnable() {

  if (!enabled) return;
  if (!isStoryPage()) return;
  if (toggleScrollFixDone) return;

  toggleScrollFixDone = true;

  let tries = 0;

  const interval = setInterval(() => {

    tries++;

    const scrollY = window.scrollY;

    const docHeight =
      document.body.scrollHeight;

    const viewport =
      window.innerHeight;

    const nearComments =
      scrollY >
      (docHeight - viewport) * 0.6;

    const scrolledDownEnough =
      scrollY > 200;

    if (
      (nearComments || scrolledDownEnough)
      || tries > 12
    ) {

      clearInterval(interval);

      setTimeout(() => {

        // вверх только если реально в комментариях

        if (nearComments) {

          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });

          console.log(
            "[Pikabu] scroll reset"
          );

        } else {

          console.log(
            "[Pikabu] no scroll reset"
          );
        }

      }, 200);
    }

  }, 150);
}

/* =========================
   DONATE BUTTON
========================= */

function createDonateButton() {

  // удаляем старую
  removeDonateButton();

  if (!enabled) return;

  const sidebar =
    document.querySelector(".comments")
    || document.querySelector("[data-role='comments']")
    || document.querySelector("#comments");

  if (!sidebar) return;

  const btn = document.createElement("a");

  btn.id = "pikabu-sidebar-donate";

  btn.href =
    "https://www.donationalerts.com/r/flipmirror";

  btn.target = "_blank";

  btn.innerText = "❤️ Donate";

  sidebar.appendChild(btn);
}

function removeDonateButton() {

  const old =
    document.getElementById(
      "pikabu-sidebar-donate"
    );

  if (old) {
    old.remove();
  }
}
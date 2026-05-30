function updateIcon(enabled) {

  // цвет фона бейджа
  chrome.action.setBadgeBackgroundColor({
    color: enabled ? "#16a34a" : "#dc2626"
  });

  // текст на значке
  chrome.action.setBadgeText({
    text: enabled ? "ON" : "OFF"
  });
}

function restoreIconState() {

  chrome.storage.local.get("enabled", (res) => {
    updateIcon(!!res.enabled);
  });
}

// при старте браузера
chrome.runtime.onStartup.addListener(() => {
  restoreIconState();
});

// при запуске service worker
restoreIconState();

/* =========================
   INIT
========================= */

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("enabled", (res) => {
    updateIcon(!!res.enabled);
  });
});

/* =========================
   CLICK
========================= */

chrome.action.onClicked.addListener((tab) => {

  if (!tab.id) return;

  chrome.storage.local.get("enabled", (res) => {

    const next = !res.enabled;

    chrome.storage.local.set({
      enabled: next
    });

    // обновляем цвет
    updateIcon(next);

    chrome.tabs.sendMessage(tab.id, {
      type: "TOGGLE_SIDEBAR",
      enabled: next
    });
  });
});

chrome.runtime.onInstalled.addListener(() => {

  chrome.tabs.query({}, (tabs) => {

    for (const tab of tabs) {

      if (!tab.id) continue;
      if (!tab.url) continue;

      // только Pikabu story
      if (
        /^https:\/\/pikabu\.ru\/story\//.test(tab.url)
      ) {

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });

        chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ["styles.css"]
        });
      }
    }
  });
});
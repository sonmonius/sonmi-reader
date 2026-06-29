const READER_STORAGE_KEY = "local-epub-reader-selection-translate-enabled";
const READER_ATTRIBUTE = "data-selection-translate-reader";

const isReaderPage =
  document.documentElement.getAttribute(READER_ATTRIBUTE) === "true" ||
  localStorage.getItem(READER_STORAGE_KEY) === "true";

let lastSentText = "";
let lastSentAt = 0;
let timer = null;

function getSelectedText() {
  const active = document.activeElement;

  if (
    active &&
    (active.tagName === "TEXTAREA" ||
      (active.tagName === "INPUT" && typeof active.selectionStart === "number"))
  ) {
    return active.value.substring(active.selectionStart, active.selectionEnd).trim();
  }

  const selection = window.getSelection();
  return selection ? selection.toString().trim() : "";
}

function shouldSkip(text) {
  if (!text || text.length < 2) {
    return true;
  }

  const now = Date.now();

  if (text === lastSentText && now - lastSentAt < 2500) {
    return true;
  }

  return false;
}

function sendSelectedText() {
  if (!isReaderPage) {
    return;
  }

  const text = getSelectedText();

  if (shouldSkip(text)) {
    return;
  }

  lastSentText = text;
  lastSentAt = Date.now();

  chrome.runtime.sendMessage(
    { type: "TRANSLATE_TEXT", text, readerPage: true },
    () => void chrome.runtime.lastError
  );
}

function scheduleSend(delayMs) {
  if (!isReaderPage) {
    return;
  }

  clearTimeout(timer);
  timer = setTimeout(sendSelectedText, delayMs);
}

if (isReaderPage) {
  document.addEventListener("selectionchange", () => scheduleSend(300), true);
  document.addEventListener("mouseup", () => scheduleSend(120), true);
  document.addEventListener("pointerup", () => scheduleSend(120), true);
  document.addEventListener("touchend", () => scheduleSend(250), true);

  document.addEventListener("keyup", (event) => {
    if (event.shiftKey || event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown") {
      scheduleSend(150);
    }
  }, true);
}

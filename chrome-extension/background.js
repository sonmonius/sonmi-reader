const DEFAULT_TRANSLATE_URL = "https://translate.google.com/?op=translate";

function isGoogleTranslateTab(tab) {
  return tab.url && (
    tab.url.startsWith("https://translate.google.com/") ||
    tab.url.startsWith("https://translate.google.com.ua/")
  );
}

function readTranslateLanguages(translateTab) {
  if (!translateTab?.url) {
    return { sourceLanguage: null, targetLanguage: null };
  }

  try {
    const url = new URL(translateTab.url);
    return {
      sourceLanguage: url.searchParams.get("sl"),
      targetLanguage: url.searchParams.get("tl")
    };
  } catch {
    return { sourceLanguage: null, targetLanguage: null };
  }
}

function buildTranslateUrl(text, translateTab) {
  const baseUrl = translateTab?.url || DEFAULT_TRANSLATE_URL;
  const { sourceLanguage, targetLanguage } = readTranslateLanguages(translateTab);

  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    url = new URL(DEFAULT_TRANSLATE_URL);
  }

  url.searchParams.set("text", text);
  url.searchParams.set("op", "translate");

  if (sourceLanguage) {
    url.searchParams.set("sl", sourceLanguage);
  }

  if (targetLanguage) {
    url.searchParams.set("tl", targetLanguage);
  }

  return url.toString();
}

async function findBestTranslateTab(sourceTabId) {
  const sourceTab = sourceTabId ? await chrome.tabs.get(sourceTabId).catch(() => null) : null;

  const tabs = await chrome.tabs.query({ currentWindow: true });

  const translateTabs = tabs
    .filter(isGoogleTranslateTab)
    .sort((a, b) => a.index - b.index);

  if (!translateTabs.length) {
    return null;
  }

  if (!sourceTab) {
    return translateTabs[0];
  }

  const rightTabs = translateTabs
    .filter(tab => tab.index > sourceTab.index)
    .sort((a, b) => a.index - b.index);

  if (rightTabs.length) {
    return rightTabs[0];
  }

  const leftTabs = translateTabs
    .filter(tab => tab.index < sourceTab.index)
    .sort((a, b) => b.index - a.index);

  if (leftTabs.length) {
    return leftTabs[0];
  }

  return translateTabs[0];
}

async function updateGoogleTranslateTab(text, sourceTabId) {
  const cleaned = (text || "").trim();

  if (!cleaned) {
    return;
  }

  const translateTab = await findBestTranslateTab(sourceTabId);
  const url = buildTranslateUrl(cleaned, translateTab);

  if (translateTab) {
    await chrome.tabs.update(translateTab.id, { url, active: false });
    return;
  }

  const sourceTab = sourceTabId ? await chrome.tabs.get(sourceTabId).catch(() => null) : null;
  const createProps = { url, active: false };

  if (sourceTab) {
    createProps.index = sourceTab.index + 1;
  }

  await chrome.tabs.create(createProps);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "TRANSLATE_TEXT" && message.readerPage) {
    updateGoogleTranslateTab(message.text, sender.tab?.id);
  }
});

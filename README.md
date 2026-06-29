# Sonmi-reader

A local EPUB reader for Chrome. Open `sonmi-reader.html` directly in the browser, pick an `.epub` file with the **Open EPUB** button — the reader saves your progress and resumes from the same position on the next launch. Any book language supported by Google Translate is supported.

---

## Extension — what it does and how to install

The extension watches for text selected in the reader and automatically sends it to Google Translate. For the best experience, keep the reader tab and a Google Translate tab (`translate.google.com`) side by side in the same window.

**Installation:**

1. Open `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked** and select the `chrome-extension/` folder.
4. Find **Reader Selection to Google Translate → Details** and enable **Allow access to file URLs**.
5. Reload the reader tab.

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.

---

> **Disclaimer:** This tool is intended for use with legally obtained EPUB files.
> Google Translate is a third-party service subject to its own [Terms of Service](https://policies.google.com/terms).

/**
 * Internationalization (i18n) Utility
 * Bridges Chrome i18n API with DOM and application logic
 */

/**
 * Get localized message by key with optional substitutions
 * @param {string} key
 * @param {string|string[]} substitutions
 * @param {string} fallback
 * @returns {string}
 */
export function getMessage(key, substitutions = [], fallback = '') {
  try {
    if (typeof chrome !== 'undefined' && chrome?.i18n?.getMessage) {
      const msg = chrome.i18n.getMessage(key, substitutions);
      if (msg) return msg;
    }
  } catch (err) {
    console.warn(`[i18n] Failed to resolve message for "${key}":`, err);
  }
  return fallback || key;
}

/**
 * Automatically apply internationalization to DOM elements
 * Elements with:
 * - data-i18n="key": sets textContent
 * - data-i18n-title="key": sets title
 * - data-i18n-aria-label="key": sets aria-label
 * - data-i18n-placeholder="key": sets placeholder
 * @param {HTMLElement|Document} root
 */
export function applyI18nToDOM(root = document) {
  // Translate text content
  const textElements = root.querySelectorAll('[data-i18n]');
  textElements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const translation = getMessage(key);
      if (translation && translation !== key) {
        el.textContent = translation;
      }
    }
  });

  // Translate title attributes
  const titleElements = root.querySelectorAll('[data-i18n-title]');
  titleElements.forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) {
      const translation = getMessage(key);
      if (translation && translation !== key) {
        el.title = translation;
      }
    }
  });

  // Translate aria-label attributes
  const ariaElements = root.querySelectorAll('[data-i18n-aria-label]');
  ariaElements.forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) {
      const translation = getMessage(key);
      if (translation && translation !== key) {
        el.setAttribute('aria-label', translation);
      }
    }
  });

  // Translate placeholder attributes
  const placeholderElements = root.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      const translation = getMessage(key);
      if (translation && translation !== key) {
        el.setAttribute('placeholder', translation);
      }
    }
  });
}

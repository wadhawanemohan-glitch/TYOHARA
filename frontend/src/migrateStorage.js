// One-time move of browser storage from the old "giftwala-*" names to
// "tyohara-*", so customers who are already logged in, or have items in
// their cart, do not lose them when the site is updated.
// Imported first in main.jsx, so it runs before anything reads storage.

const KEYS = ["user", "token", "cart", "last-order"];

try {
  for (const key of KEYS) {
    const oldName = `giftwala-${key}`;
    const newName = `tyohara-${key}`;

    const oldValue = localStorage.getItem(oldName);

    if (oldValue !== null) {
      if (localStorage.getItem(newName) === null) {
        localStorage.setItem(newName, oldValue);
      }

      localStorage.removeItem(oldName);
    }
  }
} catch {
  // Storage can be blocked (private mode); the site works without it.
}

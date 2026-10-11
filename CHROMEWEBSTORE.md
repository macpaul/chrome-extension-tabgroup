# Chrome Web Store Listing — Tab Purger & Grouper

> Last Updated: 2026-10-12

This document contains all metadata, permissions justifications, privacy disclosures, and store copy required to submit **Tab Purger & Grouper** to the Chrome Web Store Developer Dashboard.

---

## 1. Store Listing Metadata

**Extension Name** [REQUIRED]
```text
Tab Purger & Grouper
```
*(Matches `manifest.json` and `_locales/en/messages.json` `appName`)*

**Short Description** [REQUIRED] (100 / 132 characters)
```text
One-click clean duplicate tabs and smartly group tabs by domain or category using Chrome Tab Groups.
```

**Detailed Description** [REQUIRED]
*(Copy and paste the plain text below into the Detailed Description field. Note: Chrome Web Store does not render markdown formatting)*

```text
Tab Purger & Grouper is a lightweight, privacy-focused extension that helps you keep your browser organized and free from clutter. Detect duplicate open tabs with a single click and automatically organize related websites into native Chrome Tab Groups.

KEY FEATURES:

• One-Click Duplicate Removal: Automatically detect duplicate open tabs and close them instantly while preserving your active or earliest opened tab.
• Smart URL Matching: Filter out tracking parameters (utm_*, fbclid, gclid, ref) and customize rules to ignore URL hash (#) or query strings.
• Tab Groups by Domain: Automatically group multiple tabs from the same website (e.g., github.com, youtube.com) into clean, color-coded tab groups.
• Root Domain Aggregation: Optionally merge subdomains (e.g., mail.google.com and drive.google.com) under a single root domain group.
• Smart Category Grouping: Automatically group tabs by topic—Search & AI, Development, Social & Chat, Media & Streaming, Docs & Workspace, Shopping, and News.
• Pinned Tab Protection: Protect your pinned tabs from accidental closure.
• Window Scope Control: Clean tabs in the current window or across all open windows.
• Multilingual Support: Built-in localization for Traditional Chinese, Simplified Chinese, Japanese, Korean, English, French, and German.
• Keyboard Shortcuts: Press Alt+Shift+D to close duplicates or Alt+Shift+G to group tabs instantly.

HOW TO USE:

1. Click the Tab Purger & Grouper icon in your Chrome toolbar.
2. View your current tab count, detected duplicate tabs, and existing groups.
3. Click "Smart Clean" to remove all duplicate tabs and group remaining tabs by domain in one step.
4. Or use dedicated buttons to close duplicates, group by domain, or group by smart category individually.
5. Click the Settings icon in the top right to customize matching rules, threshold counts, and preservation strategies.

PRIVACY & PERMISSIONS:

• 100% Client-Side: All tab analysis and grouping operations run entirely inside your browser.
• No Tracking: The extension does not collect, log, or transmit any browsing history or personal data.
• Minimal Permissions: Only standard "tabs", "tabGroups", and local "storage" permissions are used.

SUPPORT & SOURCE CODE:

• Open Source: Released under the GNU General Public License v3.0 (GPLv3).
• GitHub Repository: https://github.com/macpaul/chrome-extension-tabgroup
• Issues & Feedback: https://github.com/macpaul/chrome-extension-tabgroup/issues
```

**Category** [REQUIRED]
```text
Productivity
```

**Single Purpose** [REQUIRED]
```text
Detect and close duplicate tabs, and group tabs by domain or category using Chrome Tab Groups.
```

**Primary Language** [REQUIRED]
```text
English
```

---

## 2. Graphics & Assets

| Asset | Dimensions | Status | Source Location |
| :--- | :--- | :---: | :--- |
| **Store Icon** [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| **Screenshot 1** [REQUIRED] | 1280×800 or 640×400 | ⬜ To capture | Popup open with duplicates detected |
| **Screenshot 2** [RECOMMENDED] | 1280×800 or 640×400 | ⬜ To capture | Tab groups created in Chrome tab strip |
| **Screenshot 3** [RECOMMENDED] | 1280×800 or 640×400 | ⬜ To capture | Preferences drawer with custom rules |
| **Small Promo Tile** [RECOMMENDED] | 440×280 PNG/JPEG | ⬜ To create | Feature promo card |
| **Marquee Promo Tile** | 1400×560 PNG/JPEG | ⬜ Optional | Store banner |

### Screenshot Guidance:
- **Screenshot 1 (Main Popup)**: Open Chrome with several duplicate tabs (e.g., multiple YouTube, GitHub, and Google tabs), open the extension popup showing the duplicate count and dashboard.
- **Screenshot 2 (Tab Groups in Action)**: Show the Chrome tab strip after clicking "Group by Domain" or "Smart Clean", displaying colored tab groups.
- **Screenshot 3 (Settings & Multi-language)**: Open the Settings drawer showing duplicate matching rules and root domain aggregation.

---

## 3. Permissions Justification

Enter these exact justifications in the **Privacy practices** tab of the Chrome Developer Dashboard:

| Permission | Type | Exact Justification for Reviewers |
| :--- | :--- | :--- |
| `tabs` | `permissions` | Required to read tab URLs and titles in order to identify duplicate open pages and close them upon explicit user request. |
| `tabGroups` | `permissions` | Required to create, name, color, and collapse native Chrome tab groups when organizing tabs by domain or smart category. |
| `storage` | `permissions` | Required to save user configuration preferences locally (such as duplicate matching rules, grouping threshold, and keep strategy). |

---

## 4. Privacy & Data Use Disclosures

Complete the Chrome Web Store **Data usage** form with the following answers:

### Data Collection Form
- **Does your extension collect user data?**
  - **No** (The extension does not collect or transmit user data).

### Data Certification Checkboxes
Check all three compliance boxes:
- [x] **I certify that this extension does not sell user data to third parties.**
- [x] **I certify that this extension does not use or transfer user data for purposes unrelated to the item's core functionality.**
- [x] **I certify that this extension does not use or transfer user data to determine creditworthiness or for lending purposes.**

### Privacy Policy URL [REQUIRED]
```text
https://github.com/macpaul/chrome-extension-tabgroup/blob/main/PRIVACY.md
```

---

## 5. Distribution Settings

- **Visibility**: `Public`
- **Regions**: `All regions` (Supports 7 languages: en, zh_TW, zh_CN, ja, ko, fr, de)
- **Pricing**: `Free`

---

## 6. Developer Information

- **Publisher Name**: `Macpaul Lin`
- **Contact Email**: `macpaul@gmail.com`
- **Support URL**: `https://github.com/macpaul/chrome-extension-tabgroup/issues`
- **Homepage URL**: `https://github.com/macpaul/chrome-extension-tabgroup`

---

## 7. Packaging for Submission

Run this command in the repository root to create a clean submission ZIP file:

```bash
zip -r tab-purger-grouper-v1.0.0.zip . \
  -x ".git/*" \
  -x "PRIVACY.md" \
  -x "CHROMEWEBSTORE.md" \
  -x "README.md" \
  -x "LICENSE" \
  -x ".gitignore" \
  -x ".DS_Store" \
  -x "Thumbs.db" \
  -x "*.zip"
```

Verify that the ZIP contains only:
- `manifest.json`
- `_locales/`
- `icons/`
- `src/`

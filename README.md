# Tab Purger & Grouper - 分頁清理與群組助手

一款專為 Google Chrome 設計的 Manifest V3 擴充功能，能夠一鍵偵測並關閉重複開啟的網站分頁，同時支援將同類型或同網域的分頁自動合併成 Chrome Tab Groups 分頁群組，讓瀏覽器隨時保持乾淨整齊。

支援多國語言（i18n）：繁體中文 (zh_TW)、簡體中文 (zh_CN)、日本語 (ja)、한국어 (ko)、English (en)、Français (fr)、Deutsch (de)。

---

## ✨ 核心特色與功能

### 1. 🗑️ 智慧關閉重複分頁
- **精準重複比對**：
  - 自動正規化網址，預設自動過濾 `utm_*`、`fbclid`、`gclid`、`ref` 等常見廣告追蹤參數。
  - 支援設定是否忽略網址錨點 (`#hash`)、所有查詢參數 (`?query`) 或結尾斜線 (`/`)。
- **靈活保留策略**：
  - 可選擇保留「最早開啟的分頁」、「目前使用中的分頁」或「最新開啟的分頁」。
- **釘選安全保護**：
  - 預設保護釘選分頁（Pinned Tabs），避免重要分頁被誤關。
- **視覺化清單預覽**：
  - 即時預覽重複分頁清單，標示保留與即將關閉的分頁，亦可針對特定重複網址單獨清理。

### 2. 🗂️ 智慧分頁群組 (Tab Groups)
- **依網域自動分組**：
  - 將相同網站的分頁歸類到同一個群組（例如：`github.com`、`youtube.com`）。
  - 支援「依主網域聚合」模式（可將 `drive.google.com` 與 `mail.google.com` 統一收攏至 `google.com`）。
- **依類型智慧分組**：
  - 內建各領域智慧辨識引擎，分類包括：
    - 🔍 **搜尋與 AI**（Google, Bing, ChatGPT, Claude, Gemini, Perplexity 等）
    - 💼 **開發與技術**（GitHub, GitLab, Stack Overflow, MDN, npm, Docker, AWS 等）
    - 💬 **社群與通訊**（Twitter/X, Facebook, Instagram, Threads, Discord, Reddit 等）
    - 🎬 **影音與串流**（YouTube, Netflix, Twitch, Spotify, Bilibili 等）
    - 📝 **文件與協作**（Notion, Google Docs, Figma, Trello, Jira, Slack 等）
    - 🛒 **購物與電商**（Amazon, Shopee, Momo, PChome, Taobao 等）
    - 📰 **新聞與閱讀**（BBC, CNN, Yahoo, Medium, Substack 等）
- **群組自訂與管理**：
  - 自動調配 Chrome 原生群組色系（藍、綠、紅、黃、橘、紫、粉紅、青色等）。
  - 可設定群組最低分頁門檻（預設 2 個分頁才成組，避免單一分頁被過度群組化）。
  - 支援建立群組後自動摺疊，一鍵釋放分頁列空間。
  - 提供「一鍵解散所有分組」還原功能。

### 3. 🌐 完整國際化支援 (i18n)
- 內建 7 種語言支援，自動根據瀏覽器偏好切換：
  - 繁體中文 (Traditional Chinese, `zh_TW`)
  - 簡體中文 (Simplified Chinese, `zh_CN`)
  - 日本語 (Japanese, `ja`)
  - 한국어 (Korean, `ko`)
  - English (English, `en`)
  - Français (French, `fr`)
  - Deutsch (German, `de`)

### 4. ⚡ 一鍵智慧整理 (Smart Clean)
- 同步執行「清理重複分頁」與「依網域分組」，一步完成瀏覽器大掃除。

### 5. 🪟 彈性視窗範圍切換
- 可隨時在「**目前視窗**」與「**所有視窗**」之間自由切換處理範圍。

### 6. ⌨️ 快捷鍵即時操作
- `Alt + Shift + D`：快速關閉重複分頁
- `Alt + Shift + G`：快速依網域建立群組

---

## 🚀 安裝方式（開發者模式）

1. 下載或複製本專案至本機資料夾：
   ```bash
   git clone git@github.com:macpaul/chrome-extension-tabgroup.git
   ```
2. 開啟 Google Chrome 瀏覽器，在網址列輸入並前往：
   ```text
   chrome://extensions/
   ```
3. 在右上角開啟 **「開發者模式」(Developer mode)** 開關。
4. 點選左上角的 **「載入未封裝項目」(Load unpacked)** 按鈕。
5. 選擇本專案所在資料夾（包含 `manifest.json` 的目錄）。
6. 安裝完成！您可以點擊 Chrome 右上角的拼圖圖示，將「Tab Purger & Grouper」固定到工具列以方便隨時使用。

---

## 📁 專案檔案架構

```text
├── .gitignore                    # Git 忽略檔案設定
├── LICENSE                       # GNU General Public License v3.0 (GPLv3)
├── PRIVACY.md                    # 隱私權政策 (Chrome Web Store 必備)
├── CHROMEWEBSTORE.md             # 商店上架文案與權限審查指南
├── package.sh                    # 依 Git Tag 自動打包上架 ZIP 工具
├── manifest.json                 # Chrome Extension Manifest V3 設定檔
├── README.md                     # 專案說明與使用手冊
├── _locales/                     # 國際化語系檔案 (i18n)
│   ├── de/messages.json          # 德文
│   ├── en/messages.json          # 英文 (預設語系)
│   ├── fr/messages.json          # 法文
│   ├── ja/messages.json          # 日文
│   ├── ko/messages.json          # 韓文
│   ├── zh_CN/messages.json       # 簡體中文
│   └── zh_TW/messages.json       # 繁體中文
├── icons/                        # 各解析度擴充功能圖示
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── src/
    ├── background/
    │   └── service-worker.js     # 後台服務（監聽快捷鍵、更新角標統計）
    ├── popup/
    │   ├── popup.html            # 彈出視窗介面結構
    │   ├── popup.css             # 現代質感樣式（支援深色/淺色模式）
    │   └── popup.js              # 彈出視窗互動與資料綁定邏輯
    └── utils/
        ├── i18n.js               # 國際化橋接與自動 DOM 翻譯模組
        ├── url.js                # 網址正規化、網域解析與類型匹配模組
        └── tabs.js               # 分頁查詢、去重比對、分組與儲存管理核心
```

---

## 📦 打包發佈 (Packaging)

若需要將擴充功能發佈至 Chrome 線上應用程式商店，可使用內建的自動打包指令：

```bash
# 依特定 Git Tag 打包 (例如 v0.1)：
./package.sh v0.1

# 或是直接執行，依互動選單選擇已有的 Tag：
./package.sh
```

指令會直接從該 Tag 的 Git 樹中擷取純生產環境檔案，並於 `dist/` 目錄下產出標準上架 ZIP 壓縮檔（例如 `dist/tab-purger-grouper-v0.1.zip`）。詳細上架文案與權限理由請參閱 [CHROMEWEBSTORE.md](CHROMEWEBSTORE.md)。

---

## ⚙️ 偏好設定選項

在擴充功能介面右上角點擊齒輪圖示 ⚙️ 即可展開設定面板：

| 設定項目 | 說明 | 預設值 |
| :--- | :--- | :--- |
| **忽略網址錨點 (#)** | 將 `site.com/doc#sec1` 與 `site.com/doc#sec2` 視為相同 | 開啟 (true) |
| **忽略常見追蹤參數** | 去除 `utm_*`、`fbclid` 等廣告參數後進行比對 | 開啟 (true) |
| **忽略所有網址參數 (?)** | 僅比對路徑，完全忽略所有 URL Query String | 關閉 (false) |
| **忽略結尾斜線 (/)** | 將 `site.com/abc/` 與 `site.com/abc` 視為相同 | 開啟 (true) |
| **重複時優先保留** | 可選「最早開啟」、「目前使用中」、「最新開啟」 | 最早開啟 |
| **保護釘選分頁** | 釘選分頁一律不予自動關閉 | 開啟 (true) |
| **成組最低分頁數** | 達到此數量時才建立群組（可選 1、2、3+） | 2 個分頁 |
| **依主網域聚合** | 將同一主網域下的子網域（如 *.google.com）合併在同一個群組 | 關閉 (false) |
| **建立群組後自動摺疊** | 建立群組時立即收合分頁，節省視覺空間 | 關閉 (false) |

---

## 📜 授權許可

本專案採 [GNU General Public License v3.0 (GPLv3)](LICENSE) 授權條款釋出。

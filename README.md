# ONEWORK 工一科技 · 官方網站

工一科技（ONEWORK）的雙語官方網站（英文／中文，右上角切換）。
純靜態網站：HTML、CSS、JavaScript，不需要安裝或建置。

## 頁面

| 頁面 | 路徑 |
|---|---|
| 首頁 HOME | `index.html` |
| 關於我們 ABOUT | `about/` |
| 服務項目 SERVICES | `product/` |
| 專案實績 PROJECTS | `projects/` |
| 顧問與獲獎 ADVISORS & AWARDS | `advisors/` |
| 加入我們 CAREER | `international-career/` |
| 舊實習頁網址（自動轉到 CAREER 的實習區塊） | `c/` |

網址路徑沿用舊網站 onework.io，方便日後轉址。

## 在自己電腦上預覽

動畫用到 JavaScript 模組，**不能直接雙擊 `index.html` 開啟**，要用本機伺服器。
在這個資料夾裡打開終端機，執行：

```bash
python3 -m http.server 8000
```

然後用瀏覽器打開 http://localhost:8000/

## 放上 GitHub Pages

1. 把這個資料夾的內容推到 GitHub repository 的 `main` 分支。
2. 到 repository 的 **Settings → Pages**。
3. **Source** 選 **Deploy from a branch**，Branch 選 **main**、資料夾選 **/ (root)**，按 Save。
4. 約一分鐘後，網站會出現在 `https://<帳號>.github.io/<repository 名稱>/`。

所有連結都是相對路徑，放在子網址底下也能正常運作。
`.nojekyll` 檔案用來讓 GitHub Pages 原樣提供所有檔案，請保留。

## 資料夾結構

```
assets/
  css/            每頁的樣式（site.css 是全站共用）
  js/             每頁的動畫與互動（site.js 是全站共用：語言切換、慣性捲動、頁首）
  onework-brand/  Logo 與 favicon
  partners/       首頁合作夥伴 Logo
  about/          About 頁照片
  about/team/     About 頁三個部門的照片（待放）
  advisors/       顧問照片
```

外部資源（從 CDN 載入，不需下載）：Three.js 0.160.0、GSAP 3.12.5 + ScrollTrigger、Lenis 1.1.13、Google Fonts（Archivo、Jost、Noto Sans TC 等）。

## 之後要換上的圖片

| 項目 | 怎麼換 |
|---|---|
| About 頁三個部門照片 | 放進 `assets/about/team/`，檔名 `technical-art.jpg`、`engineering.jpg`、`project-management.jpg`（建議約 1300 × 800 px）。放了就會自動取代線稿，不用改程式。 |
| Projects 頁 10 個專案圖片 | 圖片放進 `assets/projects/`，再到 `assets/js/projects.js` 最上方的 `PROJECTS` 清單，把該專案的 `img: null` 改成例如 `img: '../assets/projects/fm.jpg'`。展示廳螢幕和清單預覽會一起換上。 |
| 張懋中院士照片 | 放進 `assets/advisors/`，再把 `advisors/index.html` 裡 `[ Photo to be provided ]` 那一行換成 `<img class="adv-img" src="../assets/advisors/檔名.jpg" alt="">`。 |
| About 頁辦公室全景、辦公區 | 目前是舊網站的小圖（658 px 寬），建議換成高解析度原檔，檔名照舊覆蓋即可。 |

## 上線前待確認

- 聯絡窗口與信箱（頁尾目前是待確認）
- 合作夥伴 Logo 的公開使用授權
- 中文文案（多處為英文翻譯草稿）
- 專案數、團隊名單等與舊網站不一致的資料

## 其他

- 右下角的 **Tweaks** 按鈕是審稿工具，可以切換「動態強弱」與「標題字體」，設定只存在瀏覽器裡。
- 系統開啟「減少動態」時，網站會自動改成靜態顯示。

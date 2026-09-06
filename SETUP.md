# Force Check 名單頁 — 設定說明

四個檔案就是整個網站，沒有框架、沒有建置步驟，丟到任何主機都能跑。

```
index.html      銷售頁（兩個表單）
thank-you.html  送出後的感謝頁
style.css       版型（ACUFLOW 品牌 token 都在最上面）
config.js       ★ 唯一需要你手動修改的檔案
app.js          表單邏輯
alternative-apps-script/Code.gs   （備案，見文末）
```

**版型**：手機是單欄，電腦（寬度 ≥ 1040px）自動變成雙欄——左邊文案、右邊表單，表單會跟著捲動黏在畫面上。中間尺寸（平板）是三欄的重點區塊。同一份檔案，不用做兩個版本。

**配色**：直接沿用 ACUFLOW 輪播的 token（`#F9DCDE` 底 / `#FDF0F0` 卡片 / `#B4286A` 洋紅 / `#4A1E33` 墨色，Cinzel + Cormorant Garamond + Manrope），中間那條洋紅金句橫幅就是輪播 P7 那頁的網頁版。要微調顏色只改 `style.css` 最上面的 `:root`。

**名單怎麼收**：頁面上的表單是我們自己設計的，但按下送出後資料是直接送進一份 **Google 表單**。所以版面完全不受影響，而名單會出現在那份 Google 表單的「回覆」分頁、以及它連動的 Google 試算表裡。不用寫程式、不用部署、不用授權。

---

## 現況：已經接好了 ✅

表單已經建好、發布好，`config.js` 也填好了。**你不需要再做第一到第三節**，那幾節是留給之後要換帳號、或 Nana 要自己重建一份時照著做的。

| | |
|---|---|
| 表單擁有者 | `founder733733@gmail.com` |
| 編輯表單 | https://docs.google.com/forms/d/1pWav-BHD78Q2OnBwmKOwP8V09_1s0-5Cslk5ostk3ME/edit |
| 填表網址（公開） | https://docs.google.com/forms/d/e/1FAIpQLSfSEmR-G_sWnD_JbQYz6RujHyS37WqrQA1V1LLJN11jU63a2w/viewform |
| First name 欄位 | `entry.480637210` |
| Email 欄位 | `entry.1987916465` |

設定已經確認過：**收集電子郵件地址 = 不收集**、**僅限回覆 1 次 = 關閉**、**作答對象 = 知道連結的使用者**。這三項是「填表的人不用登入 Google」的關鍵，之後如果有人動到設定，先回來檢查這三項。

已經實測送出一筆並確認有進到「回覆」分頁。**記得把那筆測試資料刪掉**：表單 → 回覆 → 個別 → 刪除，那筆是 `TESTPLEASEDELETE`。

想把回覆同步成試算表：回覆分頁右上角「連結至試算表」按一下就好。

---

## 一、建立 Google 表單（約 3 分鐘）

1. 到 [forms.new](https://forms.new) 開一份新表單，命名成「Force Check」之類。
2. 建**兩個「簡答」題**，標題分別打 `First name` 和 `Email`。兩題都可以打開「必填」。
3. 右上齒輪 **設定**，確認這三項：
   - **回覆 → 收集電子郵件地址**：**關閉**（我們自己有收 Email 欄位，開著會強迫對方登入 Google）
   - **回覆 → 限制回覆 1 次**：**關閉**（開著會強迫登入）
   - 如果你的帳號是學校或公司網域，把「僅限 ●● 使用者」那個選項關掉
4. 右上 **傳送 → 連結** ⛓，複製網址。它長這樣：
   ```
   https://docs.google.com/forms/d/e/1FAIpQLSd........../viewform
   ```
   把 `/d/e/` 和 `/viewform` 中間那一長串抄下來，那就是 **formId**。

## 二、拿到兩個欄位的 entry 編號

1. 回表單編輯畫面，右上「⋮」→ **取得預先填入的連結**。
2. 在 First name 那格隨便打 `AAA`，Email 那格隨便打 `BBB`，按下面的 **取得連結 → 複製連結**。
3. 複製到的網址裡會有這兩段：
   ```
   ...&entry.1234567890=AAA&entry.9876543210=BBB...
   ```
   `AAA` 前面那個 `entry.1234567890` 就是 First name 的編號，`BBB` 前面那個就是 Email 的編號。

## 三、填進 config.js

```js
window.FORCE_CHECK_FORM = {
  formId: "1FAIpQLSd..........",
  fields: {
    first_name: "entry.1234567890",
    email:      "entry.9876543210",
    experience: ""
  }
};
```

存檔。**只有這一個檔案要改**，兩個頁面共用。

### 想多問「執業幾年」那一題（選配）

感謝頁可以再問一題，用來之後在 Kit 分眾。預設是關的。要打開的話：

1. 在同一份 Google 表單再加一個簡答題，標題 `Experience`，**不要**設必填。
2. 用上面同樣的方法拿到它的 entry 編號，填進 `experience`。

打開之後，這個人會在表單裡產生**兩列回覆**：第一列是他填 Email 的當下，第二列是他在感謝頁按下答案時（同樣帶著姓名和 Email）。整理時用 Email 對照即可。`experience` 留空字串就不會問這題，感謝頁那塊會自動隱藏。

## 四、本機測試

在這個資料夾開終端機跑：

```bash
python3 -m http.server 8765
```

打開 <http://localhost:8765> 填一次表單送出，然後去 Google 表單的「回覆」分頁看有沒有進來。

> ⚠️ 用 Finder 雙擊 `index.html`（`file://`）測不出來，一定要用上面的指令起本機伺服器。

## 五、上線（免費）

最省事的是 **Netlify Drop**：

1. 打開 <https://app.netlify.com/drop>
2. 把整個 `force-check-landing` 資料夾**直接拖進網頁**
3. 幾秒後就給你一個 `https://xxxx.netlify.app` 網址，自帶 HTTPS，免費

之後要換自己的網域（例如 `forcecheck.acuflow.com`），在 Netlify 後台 Domain settings 綁定，一樣免費。其他等效選擇：Cloudflare Pages、GitHub Pages、Vercel。

---

## 帳號怎麼換手

**這頁不在乎表單是誰的。** 換帳號就是換 `config.js` 裡那三個字串而已，頁面一行都不用動。所以：

- **現在**：表單開在你的 Google 帳號，名單進你的雲端硬碟。
- **之後交給 Nana**，三條路，由省事到正式：
  1. **最省事**：Nana 用她自己的帳號重開一份一模一樣的表單，把新的 formId 和兩個 entry 編號換進 `config.js`，重新上傳。舊名單匯出 CSV 給她。
  2. **加她當共同編輯者**：表單「傳送 → 新增協作者」，她就能看到全部回覆，但擁有者還是你。
  3. **正式移轉擁有權**：Google 雲端硬碟裡找到那份表單 → 共用 → 把她的權限改成「擁有者」。她要點確認接受。移轉後 `config.js` 完全不用改，網址和 entry 編號都不會變。

第 3 條是最乾淨的，但如果她之後想完全獨立管理，第 1 條反而最單純。

---

## 這個做法的限制（先講清楚）

- **不會自動去重**：同一個 Email 填兩次會有兩列。匯進 Kit 前先在試算表用「資料 → 資料清理 → 移除重複項目」清一次。
- **送出結果無法回報**：Google 的這個端點不回傳跨網域標頭，所以瀏覽器讀不到 Google 的回應。頁面能擋掉空欄位和格式錯的 Email，但如果 Google 那端拒收（例如表單被設成必須登入），頁面還是會顯示成功並跳轉。**所以第四步的本機測試一定要做，確認回覆真的有進去。**
- 這兩點是拿 Google 表單當後端的固有代價。如果之後名單量大到需要去重和真實錯誤回報，`alternative-apps-script/Code.gs` 那個備案（改用 Apps Script 直接寫進試算表）兩者都有，但要多做一次部署。

---

## 之後怎麼搬進 Kit

1. Google 表單「回覆」分頁 → 點試算表圖示連到 Google 試算表
2. **檔案 → 下載 → 逗號分隔值 (.csv)**
3. Kit 後台 → Subscribers → Import → 上傳 CSV
4. 對應欄位：`Email` → Email address、`First name` → First name、`Experience` → 自訂欄位或直接拿來分 tag

之後如果要改成直接串 Kit，只要把 `index.html` 裡兩個 `<form data-force-check>` 區塊換成 Kit 的 embed code 就好，其他都不用動。

---

## 乾貨怎麼交付

目前是**手動寄**。名單進來後去表單「回覆」分頁抄名字和 Email，套 `EMAIL.md` 裡的範本寄出去。頁面承諾的是 **24 小時內**，所以固定一天挑一個時段批次寄完就好。

乾貨本體（Notion）：<https://humorous-basement-740.notion.site/Force-Check-3d361470621081f0814ffdad5d02cd5e>

搬進 Kit 之後這封信設成 welcome automation 就會自動寄，那時記得把 `index.html` 和 `thank-you.html` 裡的「24 hours」改回「in a few minutes」。

---

## 還缺的素材

- **Nana 的大頭照**：把照片放進這個資料夾（例如 `nana.jpg`），然後在 `index.html` 搜尋 `class="portrait"`，把 `src="data:image/svg+xml,..."` 換成 `src="nana.jpg"`。目前是空的粉色佔位圖。
- **分享縮圖**：做一張 1200×630 的圖存成 `og-image.jpg` 放進資料夾，然後把 `index.html` 裡那行被註解掉的 `<meta property="og:image" ...>` 打開。這樣連結貼到 IG／FB／LINE 才會有預覽圖。
- **隱私權說明**：加拿大 CASL 規定要讓對方清楚知道自己訂閱了什麼。頁尾那段法律聲明可以再補一個隱私權政策連結。

## 安全性

- Google 表單本來就是公開可填的，這是它的設計，不需要額外開權限。
- 已經內建兩層防護：隱藏的蜜罐欄位（機器人一填就靜默丟棄）＋ Email 格式驗證。
- 名單只會進到**表單擁有者**的雲端硬碟，只有擁有者和被加為協作者的人看得到。

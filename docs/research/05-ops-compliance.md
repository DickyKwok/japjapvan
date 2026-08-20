# JapJapVan Year 1 營運管：錢同貨點樣過時間

**研究日期：** 2026-08-20  
**性質：** 營運研究筆記，**不是**稅務意見、法律意見、清關經紀意見、或 Health Canada 批文。落地前要加拿大 CPA + 清關經紀 + 做過 CNF／DIN 的 regulatory consultant 核過。  
**範圍：** 預購 → 週採購 → 集運空運 → CBSA → 尾程。公司所得稅論證以 `docs/hk-ca-tax-price-advantage-2026.md` 為準，本文不重寫。  
**目錄重量：** 以 `src/data/products.ts` 的 `weightG` 為準（Melano CC 目錄 55g，不是淨含量 20ml）。

---

## 0. 公司稅一句，然後走開

`docs/hk-ca-tax-price-advantage-2026.md` 同 `docs/research/_shared-facts.md` 已經鎖死：香港公司、無加拿大 PE，一般唔使交加拿大**公司所得稅**；Year 1 相對 BC 小 CCPC、CAD 20k 利潤，差大約 **CAD 550**（每件中位 SKU 約 CAD 0.34）。這不是定價武器。

本文管的是**管道**：預購現金幾時入、貨幾時買、幾公斤袋幾時飛、邊個當 importer of record、GST／PST／關稅幾時變成成本、邊個 SKU 會令整袋被扣。履約錯一次蒸發的錢，大過全年公司稅差一個數量級。

---

## 1. 管道（Year 1 無 PE）

Desk 已經按這個節奏想：`/preorders` 把已收 CAD 當鎖定現金；`/procurement` 每週一張採購 sheet（draft → ordered → in-transit → received），qty 跟 `weeklyVelocity` + 預購 − 在庫 − incoming。incoming 是**香港／日本供應商在途**，不是溫哥華倉。Year 1 唔好把「received」解成「入咗溫市朋友家」。

生存條件（`_shared-facts.md`）：**一件一寄 DHL 會食光萬寧式毛利**；每週 8–12 kg 集運；標價 DDP 全包，唔好 DDU。

### 1.1 時間線（預設：每週一袋，只寄已賣出的貨）

| 日 | 動作 | 錢 | 貨 |
| ---: | --- | --- | --- |
| 0–6 | Shopify 預購。客人付 CAD 全包價。未採購可取消；採購單鎖定後不可取消。 | 現金入香港 Stripe／Shopify。未買貨。 | 無加拿大庫存。 |
| 每週截單（例如週日 23:59 PT） | 對 `/preorders`：booked vs stock+incoming。短缺的才進本週 `/procurement`。 | 本週 COGS ≈ 已收預購 × (1 − 目標 GM)。不要為「快」提前買。 | 採購單 draft。 |
| 截單後 1–3 日 | 香港萬寧／屈臣氏／Donki 同日買，及／或日本批發／松本清出口單。 | 港幣／日圓流出。Desk FX：CAD/HKD 5.7、CAD/JPY 108（2026-08-16）。 | 實物到香港工作檯。 |
| 同日–翌日 | 按**已付款訂單**分箱。每箱寫客人姓名、加拿大地址、商業發票、HS、價值。未賣出的**留香港**。 | — | 主袋 8–12 kg（或拆成數個客人包裹、一個 master air waybill）。 |
| 出貨日 | 空運／快遞集運 HK → YVR。 | 運費＋燃油附加費現付或月結。 | 在途。標題／風險按貿易術語（見下）。 |
| YVR CBSA | 清關。幾乎每張都過 CAD 20 de minimis。 | GST 5% ＋關稅（如有）＋經紀費。 | 放行或查驗／扣查。 |
| 放行後 1–4 日 | 快遞或 Canada Post 交到客人。 | 尾程費（若未包在主運費）。 | 客人簽收。香港帳：received = 已交給承運人，不是入加拿大倉。 |
| 船期總覽 | 預購成功 → 客人到手：**估計 10–21 日**（日本加單可到 18–30 日，目錄 `leadDays` 14–30）。 | — | 48 小時達 = 本地倉 = 有 PE。兩樣唔能一齊要。 |

基準盤（稅務備忘）：約 90 單／月 → **約 20–25 單／週**。客單 CAD 68、2–3 件，約 50–75 件／週。平均件重 200–250 g 就已經是 10–19 kg；要留在 8–12 kg 帶，本週必須偏輕（護膚／文具細件），重貨（Campus、Fino、洗護）要控件數或改海運。

### 1.2 邊個係 importer of record

**DDP（Delivered Duty Paid）— Year 1 預設**

1. 買賣合同在香港完成（Shopify 收錢、香港公司出發票）。
2. 主運單／分運單的 **Importer of Record = 香港公司**（或它指定的加拿大 customs broker 代它報）。客人是 consignee，不是進口人。
3. 香港公司（或其經紀）在邊境付 GST 5% ＋應課關稅 ＋經紀費。
4. 客人只收到**一張** Shopify 收據，唔好再收到 DHL「請補 CAD xx」。
5. 化妝品 CNF 上的加拿大 importer：必須是**有加拿大地址的進口人／獲授權負責人**（2025-03-05 起 CNF 表格強制加拿大地址），通常是合規代理，**唔係**代你囤貨的朋友。CNF 地址 ≠ 履約倉。

**DDU／DAP（客人當進口人）— 唔好做零售預設**

1. 運單 Importer of Record = **客人**。
2. CBSA／快遞向客人收 GST、關稅、墊付費（disbursement）。DHL 常見第二張帳單。
3. 化妝品路徑變髒：商業出售的化妝品，進口人理論上要做 CNF。你把 IOR 推給散客，等於 20–25 個／週無通知的「進口人」，Health Canada／CBSA 都唔會當這是清潔商業路徑。
4. 客人拒付 → 貨困在快遞倉 → 你退款兼付回程。DDU 的「節省」是把轉換率同退貨炸掉。

**不要混淆的第三種：** 香港公司 DDP，但運單仍寫客人為 IOR——這是最常見的操作錯誤。標價寫包稅，清關文件卻叫客人當進口人，兩邊都生氣。

---

## 2. 每公斤成本（估計，2026-08 無即時報價）

沒有拿到 DHL／國泰貨運即時報價。以下是公開帶，全部標 **估計**。Year 1 量（每週 8–12 kg）**達不到**航空貨運 45／100 kg 優惠檔；生存帶是「貨代集運／折扣快遞」，不是官網零售件。

### 2.1 公開帶（HK → YVR）

| 產品 | 8–12 kg 這一檔實際在賣什麼 | 估計 CAD／收費公斤 | 備註 |
| --- | --- | ---: | --- |
| 航空貨運貨代（機場–機場，公開 100 kg 帶） | 你週袋太細，會被當小貨或收最低收費 | **CAD 7–16／kg**（USD 5–12 級，Freightamigo 等公開「100 kg air USD 8–12／kg」） | 還要加 YVR 提貨、拆袋、尾程。 |
| 集運／折扣 DHL·UPS·SF（門到門或門到清關） | Year 1 真實選項 | **CAD 14–28／kg** 運費本體 | 再加燃油、偏遠、清關。 |
| DHL Express 官網零售 | 一件一寄、或你當散客去櫃檯 | **CAD 40–80／kg** | CAD 21 的 Melano 會變負毛利。稅務備忘已示範。 |
| 快遞 10 kg 公開信封價 | Freightamigo 2025 表：parcel 10 kg **USD 100–200** | **CAD 14–28／kg** 同列 | 與中間檔一致。 |

**建議入帳用的 Year 1 工作帶（估計）：空運＋燃油 CAD 16–24／kg + 主袋清關經紀 CAD 15–40 + 每張訂單尾程 CAD 8–14**（若集運只送到 YVR 再拆）。全部包進 DDP 標價，不要事後向客人收。

體積重：航空／快遞通常 `L×W×H(cm) / 5000`（有些 6000）。`kokuyo-campus` `bulky: 4`，收費重可以高過 520 g 實重。液體護膚密度高，實重較準。

### 2.2 換到單件（只用空運公斤，未計尾程／經紀）

目錄重量：`melano-cc` 55 g、`fino-mask` 280 g、`kokuyo-campus` 520 g。

| SKU | 重量 | @ CAD 16／kg | @ CAD 24／kg | @ DHL 零售 ~CAD 50／kg |
| --- | ---: | ---: | ---: | ---: |
| `melano-cc` | 55 g | **0.88** | **1.32** | **2.75** |
| `fino-mask` | 280 g | **4.48** | **6.72** | **14.00** |
| `kokuyo-campus` | 520 g | **8.32** | **12.48** | **26.00** |

目錄毛利：Melano 11.40（54%）、Fino 9.90（55%）、Campus 10.20（54%）。集運之後 Fino／Campus 只剩薄薄一層；再加 5% 進口 GST（未登記抵 ITC）、HS 關稅、尾程，就會撞到基準盤「目錄 52% − 4 pt = 48%」這條線。Campus 再被體積重加碼，Year 1 不要當「輕平貨」灌進每週袋。

粗算一週 10 kg、60 件、平均 167 g：空運 CAD 160–240 → **CAD 2.7–4.0／件**，落在稅務備忘「均攤 CAD 2–5／件」區間。這是**混合物**的平均；Melano 補 Fino，Fino 補唔到 Campus。

`criteria.ts` 的 `maxWeightG: 900` 是上架門檻，不是「900 g 都划算」。空氣運價下，**超過 ~300 g 就要問這件能不能等海運或只做預購湊袋**。目錄已警告：`honey-shampoo`（480 g）「Sea freight only」。

---

## 3. DDP vs DDU

### 3.1 點解 DDU 殺死轉換

CBSA：非美墨快遞，完稅價格 **CAD 20 以上就要關稅同稅**（Memorandum D8-2-16；LVS 頁 2025-11-25）。CUSMA 的 CAD 40／150 **只適用由美／墨境內寄出、並已進入美／墨商業的貨**。香港／日本直寄、或經美墨**轉運但未進入當地商業**，仍是 CAD 20。萬寧式客單 CAD 24–70，**幾乎每張都超**。

DDU 客人會收到 DHL／UPS 第二張帳單：GST 5% ＋關稅 ＋墊付費（常見最低十到幾十加元）。CAD 21 的 Melano 再加 12–18，體感變成「比 Shoppers 貴同麻煩」。拒付、棄件、chargeback、永遠唔返來。這比公司稅差重要兩個數量級。

### 3.2 DDP 要坐進標價，唔係結帳後加

Year 1 貼紙（客人看到的 CAD）至少要蓋：

| 層 | 來源 | 點樣入價 |
| --- | --- | --- |
| 貨 | 目錄 `landedCad`（已內建約 38% 運／關／損——不要再加一層 38%） | COGS |
| 週袋空運均攤 | §2 估計 CAD 2–5／件（視重量） | 運費 |
| 關稅 | HS 3304 護膚 MFN 常見 **6.5%**；日本 CPTPP 工業品多 0%，但要原產地證明。香港**不是** CPTPP 成員。萬寧貨 Year 1 多數按 MFN 估。文具多數 0 或低。 | 按完稅價 |
| GST 5% | 邊境向 **IOR** 收。未做正常 GST 登記 = **成本**（或你已包進售價）。 | 見 §3.3 |
| BC PST 7% | 向 BC 招攬銷售，或 12 個月 BC 營業額 **> CAD 10,000** 就要登記代收（Bulletin PST 001）。基準盤 Year 1 已過線。 | Shopify 結帳代收，**唔好**再包一次進貨價 |
| 支付＋FX | 見 §6 | 3–6% GMV，視卡片國籍同結算幣 |

**不要做：** 標 CAD 24「包郵」、GST／關稅到門先講。  
**要做：** 標 CAD 29 全包，或結帳分開「貨價／進口稅費／PST」，但客人按下 Pay 之前總數鎖定。寧願貴、一次過，唔好平完再補刀。

Shopify 的 Duties & import taxes（DDP）同「GST 登記後代收 GST」唔係同一條。無 PE、貨從香港出、供應視為在加拿大境外完成時：你**未必**在發票上代收 GST，但你作為 IOR 仍要在邊境付 5%。把這 5% 當成成本加進售價，或登記後用 ITC 撈返——揀一條，唔好兩條都向客人收。

### 3.3 幾時自願登記 GST（ITC）vs 不登記、讓邊境 GST 黏住

官方框架：CRA RC4027。非居民**唔在加拿大經營業務**，一般唔使按正常 GST 制度登記（數碼經濟／qualifying goods 另算）。**Qualifying goods** = 貨在加拿大 fulfillment warehouse，或從加拿大境內地點寄給加拿大買家——Shopify 倉、Amazon FBA、本地 3PL 都中，要**正常 GST 登記**，不是簡化制度。直寄亞洲、途中不進加拿大倉：通常不是 qualifying goods；GST 在進口環節向 IOR 收。

| 選擇 | 何時 | 代價 |
| --- | --- | --- |
| **Year 1 預設：不登記 GST** | 無加拿大倉、無 PE、DDP 由香港當 IOR | 邊境 5% 變成成本，包進貼紙。基準盤 GMV 73k → GST 約 CAD 3,650。大於公司稅差 CAD 550。換來：無保證金、無「我喺加拿大做生意」的 GST 敘事。 |
| **自願正常登記（為 ITC）** | DDP 量大、你確定要當 IOR、CPA 確認咁做**唔等於**所得稅 PE | 可抵進口 GST。非居民無加拿大 PE 通常要 **security deposit**（最低 CAD 5,000，最高 100 萬；估計年應稅供應 ≤ 10 萬且淨稅在 ±3,000 內可豁免）。你要留至少一年。登記後若供應被當成在加拿大作出，就要代收 GST——同「境外銷售＋邊境 GST」模型衝突。 |
| **被迫登記** | 貨開始放加拿大倉／FBA／3PL（qualifying goods），或被認定在加拿大經營業務 | 正常 GST ＋所得稅 PE 風險一齊來。這是轉做加拿大零售公司的信號，不是小優化。 |

**操作口令：** Year 1 直寄 DDP → **不登記 GST，5% 當成本寫進售價**。過了「加拿大境內有貨」先登記。BC PST 過 CAD 10k **要登記**（消費稅，唔係公司稅）。PST 代收 7% 係客人付，唔好當成你的毛利。

加拿大公司在這一層更著數：有 ITC。香港直寄盤不要幻想「GST 都唔使」。

---

## 4. PE 營運語言（做／唔好做）

所得稅 PE 的法律條文在稅務備忘（加拿大–香港協定 Art. 5／7）。下面只寫**管道上的絆索**。GST 的 PE／「在加拿大經營業務」同所得稅不完全一樣，但實務上本地倉＋本地人履約 = 兩樣一齊來。

| 動作 | 無 PE 模型 | 點解 |
| --- | --- | --- |
| 溫哥華衣櫃當「週袋暫存、週末先寄」 | **唔好做** | 履約倉就係主業，唔係輔助存放。紙箱有你公司的貨、等你指令再拆寄 = 固定營業場所。 |
| 朋友地庫代收主袋、代你分件 | **唔好做** | 同上。仲多一個「代你處理訂單」的代理人故事。CNF 要加拿大地址，用合規代理，唔好用呢個地庫。 |
| Amazon FBA／會以你名義持有庫存的 3PL | **唔好做** | Qualifying goods ＋所得稅 PE。轉換會好，稅務模型死。 |
| 週末 pop-up，賣完即清；剩貨**即日帶回香港或即場賣光** | **小心做** | 一日市集、無常設庫存、合同仍由香港 Shopify 完成，灰色但未必一槌定 PE。**留低剩貨在溫市「下個週末再賣」= 倉。** |
| 溫市朋友用 WhatsApp 用 CAD 同客人確認「得，呢單我幫你 lock」 | **唔好做** | 附屬代理人習慣性締結合同。即使發票蓋香港章。客服可以回「我轉介香港同事／請到網站下單」；唔可以代你接受訂單、講價、承諾交期。 |
| 客人自己選 Shopify 預購；香港客服用英文／粵語回，決策在香港 | **做** | 網站、收款、採購、打包都在香港。 |
| 快遞在 YVR 清關後**直接送到已具名客人**（courier 自己拆主袋） | **做** | 承運人不是你的 PE。貨在途中已經賣出、有名字。 |
| 未賣出的貨當「安全庫存」寄去加拿大等訂單 | **唔好做** | 這是倉。安全庫存在香港。 |
| 中央管理：董事在溫市 WhatsApp 批採購、用個人加拿大卡付 COGS | **唔好做** | 公司居民身份比註冊地危險。個人稅務居民問題見稅務備忘；營運上：香港公司戶口付款、香港開會紀錄。 |

口令：**快（本地倉）同無 PE 互斥。** Year 1 揀無 PE，就接受 10–21 日。想 48 小時，就開加拿大公司做零售，唔好假裝香港公司無倉。

---

## 5. Year 1 SKU：殺／擱／走

目錄把幾乎所有防曬標成 `regulatory: "cnf"`——這是**錯分類**。CNF 是化妝品通知。帶 SPF／UV 過濾劑的產品，Health Canada 當 **NHP（要 NPN）或非處方藥（要 DIN）**，視活性成分。化學濾劑（octinoxate、avobenzone 等）→ DIN；只含氧化鋅／二氧化鈦 → NPN。CBC 2024-09-10：亞洲防曬在加拿大貨架難買，因為未獲批。商業進口、廣告、出售未授權防曬違法。消費者自己帶返用 ≠ 你 Shopify 上架。

Health Canada：化妝品係外用；**直接用於眼內的產品不是化妝品**。口服美白不是化妝品。

CNF 清潔路徑（要做的）：

- *Cosmetic Regulations* s.30：製造商同進口人須在加拿大**首次出售後 10 日內**交 CNF。不交 → 禁止繼續出售、可被拒入境。
- CNF **不是**批准上市。
- 2025-03-05 起表格強制 **製造商或進口人的加拿大地址**。無加拿大據點的品牌要有「在加拿大獲授權的負責人」或加拿大進口人。
- 標籤：品名同淨含量英／法雙語（CPLA）；INCI 成分表；內標要有客人可聯絡的電話／電郵／網址。日文原包裝**唔合規**。

### 5.1 殺（不要商業出售）

需求可以好強。Desk 防曬佔桌上模型 GMV ~18.8%。殺咗先有機會活過一年。

| id | 點解 |
| --- | --- |
| `biore-essence` | SPF50+ 化學防曬。要 DIN／DEL，不是 CNF。 |
| `biore-gel` | 同上。 |
| `anessa-milk` | 同上。 |
| `skinaqua-tone` | 同上。 |
| `canmake-uv` | 同上。Mermaid Skin 係防曬，不是普通妝。 |
| `allie-uv` | 同上。 |
| `transino-ii` | 口服美白錠。NHP／藥，要 NPN。目錄標 `cnf` 係錯。 |
| `rohto-lycee` | 眼藥水。眼內用 ≠ 化妝品。藥／NHP。notes 已寫 check CA import。 |

任何未授權 NHP／藥、任何「美白口服、隱形眼鏡藥水、藥用痘膏」一律殺。不要改名成「個人代購」繼續在加拿大境內廣告。

### 5.2 擱（Year 1 不要進每週普通集運袋）

| id | 點解 | 若要賣 |
| --- | --- | --- |
| `curel-spray` | notes：aerosol check。UN1950 第 2 類。**客機行李的盥洗用品豁免（每瓶 ≤0.5 L、合計 ≤2 L）不適用於商業貨物。** 平價集運多數拒收危險品。加壓罐還有雙語警告標。 | 獨立 DG 申報、貴運費，或乾脆唔賣。 |
| `refa-iron` | 100V。notes：Check voltage. Pre-order only。鋰電／電器空運限制另計。 | 只預購＋明確 100V／變壓警告；唔好同護膚混袋。 |
| `yaman-brush` | 100V 電器；可能有內置鋰電（UN3481 PI967）。國泰：鋰電唔好同第 2.1 類（易燃氣體，包括部分噴霧）同箱。 | 同上。 |
| `pana-dryer` | 780 g、`bulky: 6`、電壓轉接。空氣運價下件成本難看。 | 預購或放棄。 |
| `salonia-iron` | 100V 直髮夾。 | 同上。 |
| `honey-shampoo` | 480 g。notes：Sea freight only。 | 海運批次，唔好每週空運。 |
| `diane-repair` | 470 g、`preorderFit: 6`、需求弱。 | 海運或砍。 |
| `kewpie-mayo` | 食品。CFIA、雙語營養標籤；商業進口 ≠ 旅客袋。玻璃／擠瓶易碎。 | 小量灰只係風險選擇，唔係合規。量大停。 |
| `royce-nama` | 食品＋冷鏈。溫市尾程要冰袋。 | 季節禮盒先不要走無 PE 直寄。 |
| `pocky-giant` | 食品零食。 | 擱。 |
| `calbee-jagabee` | 食品零食。 | 擱。 |

`mapepe-brush`、`ikemoto-comb` 無電壓、無電，可以走（工具裡的例外）。

### 5.3 走（普通化妝品 CNF 路徑、文具、多數非藥頭髮）

先有加拿大 IOR／CNF 代理，先上架。以下目錄 `regulatory: "cnf"` 或文具 `none`，Year 1 可商業賣——**分類上**，唔係話而家標籤已經雙語合規。

**護膚（CNF）：** `sk2-essence`, `hada-lotion`, `hada-foam`, `shiseido-ultimune`, `curel-cream`, `fancl-oil`, `dhc-oil`, `kose-softymo`, `naturie-gel`, `melano-cc`, `senka-whip`, `minon-lotion`, `lululun-mask`, `shu-oil`, `obagi-c`, `sana-soy`, `muji-oil`, `attenir-oil`, `decorté-lipo`, `shiseido-whip`, `dprogram-lotion`, `elixir-lotion`, `haba-squa`  
（`muji-oil` 合規可走，但加拿大 Muji 店搶同一條，merch 可以唔選。）

**頭髮（非藥、CNF）：** `fino-mask`, `tsubaki-oil`, `milbon-oil`  
（洗護大支見擱清單。）

**妝（CNF）：** `canmake-cheek`, `heroine-mascara`, `kate-liner`

**文具（相對乾淨，合規避難所）：** `pilot-frixion`, `uni-one`, `zebra-sarasa`, `pentel-energel`, `kokuyo-campus`, `midori-md`, `tombow-mono`, `hobonichi-weeks`  
Campus 可賣但空運公斤貴（§2）。Hobonichi 係預購引擎，合 desk。

**工具（非電）：** `mapepe-brush`, `ikemoto-comb`

### 5.4 雙語標籤：Year 1 實際姿勢

| | 清潔 | 灰 |
| --- | --- | --- |
| **分類**（係咪化妝品／藥） | 必須清潔。防曬／Transino／Lycee 唔存在灰。 | 唔好。 |
| **CNF + 加拿大 IOR 地址** | 每個商業出售的化妝品 SKU，首次出售 10 日內。 | 跳過 = 非法繼續賣。 |
| **英／法品名、淨含量、警告** | 外標雙語；加壓罐有法定警告。 | 日文原盒。 |
| **INCI 成分表** | 法定。細包裝可改為標上雙語網址。 | 只有日文。 |

**Year 1 建議姿勢：分類同 CNF 走清潔；標籤走「灰邊、可辯護」。**  
即：請加拿大 IOR 交 CNF；每件外盒貼一張英／法 sticker（品名、淨含量、Imported by／for［加拿大地址］、聯絡電郵）。唔好假裝原盒已經合法。Health Canada 可以要你交標籤、改標、停售——sticker 係為咗被問時有東西交，唔係綠燈。全面換盒等過咗基準盤、聘過 consultant。魁省還有額外法文規則，Year 1 主場溫哥華，但聯邦標籤已經要法文。

灰邊的代價：CBSA 抽查、客人 chargeback「冇法文標」、競爭對手投訴。這比 DIN 防曬輕，但唔係零。

---

## 6. 支付、FX、退貨

### 6.1 香港公司、CAD 標價、Stripe／Shopify

Shopify Payments 香港：本地結算幣 **HKD**。公開的多幣結算名單係 EUR／GBP／JPY／USD，**唔包括 CAD 入香港銀行戶口**。客人用 CAD 付 → 平台換成 HKD（或你揀的 USD），收兌換費。

Stripe 香港（2026 公開價）：本地卡 **3.4% + HK$2.35**；國際卡 **+0.5%**；需要貨幣兌換 **+2%**。加拿大客人付 CAD、你結 HKD，三層疊埋可以去到約 **5.9% + HK$2.35**，遠高過稅務備忘假設的「支付約 3%」。爭議：**每張 HK$85 收件 + HK$85 反駁**（贏先退反駁費）。

Shopify 公開材料：美國店兌換約 1.5%；**其他地區常見 2%**。1–2% FX 單獨一項，基準盤 GMV 73k → **CAD 730–1,460／年**，已經 **大於** Year 1 公司稅差 CAD 550。

操作：

1. 售價用 CAD（轉換率）。結算預設 HKD，把 **國際卡 0.5% + FX 2%** 寫進毛利模型，唔好用美國 2.9%+30¢。
2. 不要為咗「CAD 結算」去開加拿大個人戶口收香港公司的錢——那是股東福利／居民故事。
3. Stripe 香港有 multi-currency settlement，但 CAD 要有**匹配的加拿大銀行戶口**。香港公司無 PE 就不該有呢個戶口。不要為 FX 去造一個 PE。
4. 灰色美妝 chargeback 高：客人寫「假貨」（日版 ≠ Shoppers 版）、「未授權進口」、「冇 DIN」。你贏面低。出貨照片、批號、購買小票（萬寧收據）係唯一證據。Shopify／Stripe 多數偏持卡人。把退款率 4% GMV 當成地板，灰色品類當 6–8%。

### 6.2 退貨政策（可直接貼上商店）

中文（貼 Shopify）：

> 退貨只接受**未開封、未使用、封口同批次標完好**的貨。買家負擔退回香港（或我們指定地址）的運費、關稅同風險；我們收到貨並確認可再售之後先退貨款（不含運費）。因 DDU／客人自行清關被 CBSA 扣查、棄置、補稅或充公的訂單，不設退款或補寄。已開封、試用、過敏、「同加拿大店包裝唔同」、「冇法文標」、「個人不喜歡」一律不退。每件出貨前我們會拍攝批次／到期日照片存檔；爭議以出貨照片為準。預購商品在我們向供應商落單之後不可取消。進口化妝品受 Health Canada 規則約束，我們不對未開封以外的使用後果負責。

English（checkout 備用）：

> Returns are accepted only for unopened, unused items with seals and lot marks intact. The buyer pays return postage, duties, and risk back to Hong Kong (or our nominated address). Refunds (product only, not outbound shipping) are issued after we inspect the goods and confirm they are resaleable. No refunds or reships if a DDU/self-cleared parcel is held, abandoned, taxed, or seized by CBSA. Opened, used, allergy, “different from Shoppers packaging,” or “no French label” claims are not returnable. We photograph lot/expiry on dispatch; that photo is the record. Preorders cannot be cancelled after we place the supplier order.

48% GM 撐唔住雙程空運。開封退貨 = 倒進垃圾桶的 COGS + 兩程公斤錢。

---

## Ops rules wave 2 must not break

1. **預購收錢先買貨。** `/procurement` 的 qty 跟缺口，唔好為速度屯加拿大。現金週轉係 Year 1 生死線。
2. **每週 8–12 kg 集運，唔好一件一寄。** Melano 可以，Fino／Campus 係邊車；DHL 零售公斤價會把 48% GM 打穿。
3. **DDP 全包坐進貼紙。** 唔好 DDU。IOR = 香港公司（或其經紀），唔係客人。
4. **無加拿大倉。** 衣櫃、地庫、FBA、3PL、pop-up 剩貨，全部當 PE 絆索。Courier 拆袋直送已具名客人可以；你自己拆唔可以。
5. **防曬／Transino／Lycee 唔准返正式 catalog。** 分類唔可以灰。桌面 19% GMV 放棄。
6. **噴霧、100V、食品、大支洗護唔入普通空運袋。** `curel-spray` 當 DG；鋰電唔同噴霧同箱。
7. **化妝品：CNF + 加拿大地址 IOR，10 日。** 標籤 Year 1 可以 sticker 灰邊；跳過 CNF 唔可以。
8. **BC 銷售過 CAD 10k 就登記 PST 7%。** GST 在直寄模型下 Year 1 不登記，5% 當成本；貨一進加拿大倉先登記。
9. **FX 1–2%（加國際卡）寫進模型。** 它可以大過 CIT 差。唔好為 CAD 結算去開加拿大戶口。
10. **退貨：未開封、買家付回程、DDU 扣查不退、出貨影批次。** 開封退貨會破產。
11. **WhatsApp 唔可以代香港公司確認訂單。** 朋友只可以叫人去網站。
12. **唔好用公司稅差去減價。** 價格優勢在日版缺貨同香港促銷，在 `docs/hk-ca-tax-price-advantage-2026.md`，唔在呢條管道。

---

## 來源

- Health Canada, *Notification of Cosmetics*（s.30，首次出售後 10 日；CNF 不是批准）：https://www.canada.ca/en/health-canada/services/consumer-product-safety/cosmetics/notification-cosmetics.html  
- Health Canada, *Guide for Cosmetic Notifications*（2025-03-05 起強制製造商或進口人加拿大地址；importer = 為出售而進口的人）：https://www.canada.ca/en/health-canada/services/consumer-product-safety/cosmetics/notification-cosmetics/guide.html  
- *Cosmetic Regulations*, C.R.C., c. 869, ss. 15.3, 30–31：https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._869/  
- Health Canada, *Industry Guide for the labelling of cosmetics*（英／法品名、淨含量、INCI）：https://www.canada.ca/en/health-canada/services/consumer-product-safety/reports-publications/industry-professionals/labelling-cosmetics.html  
- Health Canada, *Sunscreens*（化學濾劑 → DIN；只含 ZnO／TiO2 → NPN；未授權不得售）：https://www.canada.ca/en/health-canada/services/sun-safety/sunscreens.html  
- Health Canada, *Guidance on the Classification of Products at the Cosmetic-Drug Interface*（眼內用 ≠ 化妝品）：https://www.canada.ca/en/health-canada/services/consumer-product-safety/reports-publications/industry-professionals/guidance-document-classification-products-cosmetic-drug-interface.html  
- CBC, 2024-09-10, *Asian sunscreens are all the rage, so why can't you buy them in Canada?*：https://www.cbc.ca/news/health/asian-sunscreens-canada-1.7317656  
- CBSA, Memorandum D8-2-16 *Courier Imports Remission*（非美墨 CAD 20；美墨轉運未入商業仍 20）：https://www.cbsa-asfc.gc.ca/publications/dm-md/d8/d8-2-16-eng.html  
- CBSA, CUSMA low-value shipment thresholds（mail／courier 分檔；2025-11-25）：https://www.cbsa-asfc.gc.ca/services/cusma-aceum/lvs-efv-eng.html  
- *Courier Imports Remission Order*, SI/85-182：https://laws-lois.justice.gc.ca/eng/regulations/SI-85-182/  
- CRA RC4027 *Doing Business in Canada – GST/HST Information for Non-Residents*（自願登記、ITC、非居民保證金、qualifying goods 指向）：https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc4027/doing-business-canada-gst-hst-information-non-residents.html  
- CRA, GST/HST on imports and exports（IOR 付進口 GST；登記人可抵 ITC）：https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-imports-exports.html  
- BC, *Register to collect PST*：https://www2.gov.bc.ca/gov/content/taxes/sales-taxes/pst/register  
- BC Bulletin PST 001 *Registering to Collect PST*（境外賣家、BC 收入門檻 CAD 10,000）：https://www2.gov.bc.ca/assets/gov/taxes/sales-taxes/publications/pst-001-registering-to-collect-pst.pdf  
- CFIA, food labelling for industry（商業食品進口／雙語營養）：https://inspection.canada.ca/en/food-labels/labelling/industry  
- IATA Dangerous Goods（航空貨物；盥洗噴霧行李豁免 ≠ 商業 cargo；UN1950）：https://www.iata.org/en/programs/cargo/dgr/  
- Cathay Cargo, lithium-ion shipper approval／唔好同 Division 2.1 同箱：https://www.cathaycargo.com/en-us/solutions/cathay-dangerous-goods.html  
- Stripe Hong Kong pricing（3.4%+HK$2.35；國際卡 +0.5%；兌換 +2%；爭議 HK$85）：https://stripe.com/en-hk/pricing  
- Stripe, multi-currency settlement（香港可開；非主結算幣收費）：https://docs.stripe.com/payouts/multi-currency-settlement  
- Shopify Payments Hong Kong payouts（本地 HKD；多幣名單 EUR／GBP／JPY／USD）：https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/hong-kong/payouts  
- Shopify, credit-card processing fees（非美地區兌換費常見 2%）：https://www.shopify.com/blog/credit-card-processing-fees  
- Freightamigo, Hong Kong to Canada shipping（公開 100 kg air USD 8–12／kg；10 kg parcel USD 100–200）— **估計，非即時報價**  
- 本倉庫：`docs/hk-ca-tax-price-advantage-2026.md`；`docs/research/_shared-facts.md`；`src/data/products.ts`；`src/data/discovered-products.json`；`src/data/criteria.ts`；`src/routes/preorders.tsx`；`src/routes/procurement.tsx`

公斤價、尾程、經紀費全部是估計。落單前向香港貨代要 8 kg 同 12 kg 兩條 HK→YVR 書面報價（含燃油、清關、是否收 UN1950）。

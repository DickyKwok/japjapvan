# JapJapVan 採購手冊：下星期怎麼買，才不會輸給 YesStyle 或溫市代購

**日期：** 2026-08-20  
**對象：** 老闆（香港公司、預購 + 每週集運、**不在加拿大囤貨**）  
**性質：** 營運手冊。**研究筆記，不是稅務或法律意見。** 落地前仍要加拿大 CPA、香港稅務師、以及做過 CNF／DIN 的人把目錄逐個 SKU 標完。

鎖定事實：`docs/research/_shared-facts.md`、`docs/hk-ca-tax-price-advantage-2026.md`。  
單位經濟：`docs/research/01-unit-econ.md`。需求：`docs/research/02-demand-market.md`。  
香港地圖：`docs/research/03-sourcing-hk.md`。日本地圖：`docs/research/04-sourcing-jp.md`。  
殺／擱／走：`docs/research/05-ops-compliance.md`。對手活頁：`docs/research/06-competitor-intel.md`。  
目錄數字：`src/data/products.ts`（desk FX CAD/HKD **5.7**、CAD/JPY **108**，2026-08-16）。

---

## 先讀這八段，再出門

1. **Year 1 是連鎖零售買手，不是批發倉。** 你還沒有花王／資生堂／KOSE 出口帳。香港側 = 松本清香港 + 萬寧出位價。日本側 = 人在藥妝店掃、或 JP 網單進香港週箱。目錄 `supplier` 欄是企劃標籤，不是已簽約供應商。
2. **一件一寄 DHL 會把萬寧式貨的貢獻打成負。** Melano 賣 CAD 21、目錄 landed CAD 9.60，單件快遞 τ_x 約 CAD 10–18（estimate，無 2026-08 live quote）→ 貢獻為負。生存條件是**每週 8–12 kg 空運集運**，均攤約 CAD 2–5／件。標價 DDP 一次過，不要 DDU 讓客人收到第二張帳單。
3. **日本化學防曬不上架、不採購、不在 Shopify／IG 當商品賣。** Biore Aqua Rich、Anessa、Allie、Skin Aqua、Canmake UV：Health Canada 當 NHP／藥（要 NPN 或 DIN）。貨架上到處都是，那是香港暢銷，不是加拿大貨。桌上模型這 6 支約 **18.8% GMV**——放棄。Rohto Lycee 眼藥水、Transino 類口服美白：同樣不買。
4. **不要為了「兩日達」把貨放到溫市朋友家／3PL／FBA。** 那是所得稅 PE + qualifying goods GST。快和無 PE 互斥。預購 → 香港買 → 集運直寄具名客人。
5. **YesStyle 的 Melano 標價已經低過你的目錄 21。** 2026-08-20 換算約 CAD 12–15（未計 GST／經紀）。不要用低 2–3 刀去打。你贏的是 JAN／lot 照片、DDP、不賣會被查封的 SKU、以及文具這個美妝對手懶得做的洞。
6. **萬寧原價不是 COGS。** Mannings Melano essence 曾見 HKD 99（≈ CAD 17.37）當進貨，毛利只剩 **17%**，低於上架門檻 28%。出位價／香港藥房促銷才接近目錄 landed。沒有促銷就松本清對 JAN，不要用正價硬掃。
7. **旅客免稅 ≠ 進貨。** Donki 明文：轉售不合資格，免稅不開發票。2025-04-01 起自己郵寄不能再證明免稅。商業進口要商業發票。CPTPP 原產地證明在 CAD 10–20 貨上通常永遠不值得追（Melano 的 6.5% MFN ≈ CAD 0.62）。
8. **Curél 面霜不再是「加拿大買不到」。** 2025-09 起 Shoppers exclusive，40g **CAD 29.99**，與目錄 `curel-cream` 賣 29 同一價位。可合法賣，但不要當差異化故事。Muji 卸妝油加拿大店有——不要低價打。

---

## 1. 採購層級

預設：**同一週、同一 SKU，香港連鎖能對到 JAN（或客人接受港版）且價錢過關 → 留香港。** 日本是斷貨、日版限定、或大減之後仍蓋過機票／代運摩擦才去。

相對價是現場估計（日本藥妝正價 = 100），不是報價單。Year 1 香港沒有已核實的日藥妝 B2B／cash-and-carry。

| 品類 | 預設渠道 | 備胎 | 永遠不要 |
| --- | --- | --- | --- |
| **Skincare 開架**（Hada Labo 水／洗面、Melano CC、DHC／Kose／FANCL 油、Naturie、Senka、Minon、Lululun、Sana、d program） | **松本清香港**（銅鑼灣旗艦或當週路線上的那間）。先對 JAN。 | 萬寧 **出位價**擊中同一 JAN（或客人接受港版）則改萬寧。屈臣氏只對價，幾乎不買。 | 深水埗 grey。無公司抬頭發票的平行店。條碼被貼紙遮、已開封。萬寧正價當 COGS。 |
| **Skincare 精品**（SK-II 230ml、Ultimune、Decorté Liposome、Shu Uemura、Obagi C10） | **有預購才莎莎**（或當週查連卡佛／SOGO 專櫃） | 卓悅僅出發前確認仍開門 | 無預購「因為今日平」。平行店的平貨 SK-II。 |
| **Skincare 通訊／沙龍**（Attenir、Milbon） | **日本網單或日本行**（香港週巡不穩） | 松本清香港偶見 Milbon 再對 JAN | 為它們加一站香港藥妝。 |
| **Hair**（Fino、Tsubaki 油） | Fino／Tsubaki：**松本清香港 → 萬寧出位價** | Donki 藥妝層只補缺口 | 把 Fino 當流量鉤去跟 Amazon CAD 18／Kiyoko 促銷 11.99 死磕——當加購。 |
| **Hair 重瓶**（&honey 440ml、Diane 450ml） | 有預購才買；**海運思維**，不要每週空運 | 松本清／Donki 現貨 | 為 Diane 加站。把 480 g 洗護灌進 8–12 kg 週袋。 |
| **Makeup**（Canmake Cream Cheek 16、Heroine Make 睫毛液） | **松本清香港** | 萬寧、莎莎開架牆 | JHC「看起來像 Canmake」的無牌彩妝。色號不對就不要用 16 的 PDP 出貨。 |
| **Stationery**（Pilot FriXion、Uni-ball One、Zebra Sarasa、Pentel、Kokuyo Campus、Tombow、Midori MD、Hobonichi） | **LOG-ON**（時代廣場 B1／朗豪坊／海港城）；季節書展；Pilot／Zebra 香港零售點。Hobonichi：**日本官方／Hands／Loft 預購**，香港貨架不是引擎 | JHC 真好城只入門款 | **不要去萬寧找筆。** 雅虎拍密封藥妝禁用；文具絕版才可小量試。 |
| **Tools 非電**（MaPEPE 頭皮刷、Ikemoto 椿油梳） | 日本 Hands／Loft，或松本清雜貨牆對 JAN | JHC 不保證同款 | 無 JAN 的「日系按摩梳」。 |
| **Tools 100V 電器**（ReFa、YA-MAN、Panasonic Nanoe、SALONIA） | **Year 1 建議不進首批。** 若留：只接預購 + 明確 100V／非 CSA 警告，Donki／松本清看一眼 | — | 現貨屯 100V。Adaptor 只改插頭，不是變壓。SPE-1000 不是零售捷徑。 |
| **Food** | **不採購（商業）。** CFIA + 雙語營養標；商業進口 ≠ 旅客袋 | — | Donki 整籃零食「順便」。Royce 冷鏈、玻璃美乃滋、巨型 Pocky 都不要進週袋。 |
| **Never-sunscreen** | **不採購（商業）** | 沒有備胎 | 萬寧、屈臣氏、松本清、Donki、莎莎、Sundrug、YesStyle 貨架上的 Biore／Anessa／Allie／Skin Aqua／Canmake UV。個人自用與 Shopify 上架是兩回事。 |
| **Daily 藥**（Lycee 眼藥水、Transino 口服） | **不採購** | — | 藥房區當沒看見。 |

**開架護膚／頭髮／彩妝的進貨順序（寫死）：**  
松本清香港現貨（對 JAN）→ 萬寧出位價（同 JAN 或客人接受港版）→ 屈臣氏對價（幾乎不買）→ Donki 只補缺口 → 平行店最後、且要機打發票 + JAN + lot 可拍。

精品相反：預購 → 莎莎／專櫃。文具：LOG-ON。工具電器：多數不在香港、多數不進首批。

---

## 2. 決策樹：這個星期萬寧／去日本或 JP 網／Rakuten+集運

目錄中位賣價 CAD **24**，平均 SKU 毛利約 **52%**。經營貨品 GM 集運後鎖定 **48%**（目錄減 4 pt 空運／破損／FX）。上架門檻毛利 **≥ 28%**。公司稅差每件約 CAD **0.34**——不要讓它驅動渠道。

### 2.1 先問能不能賣

```
這個 SKU 在加拿大能不能合法商業賣？
 ├─ 化學防曬／NHP／眼藥水／美白口服 → 公司不買、不上架。停。
 ├─ 食品零食 → 商業不做。停。
 ├─ 氣霧（Curel spray）→ 平價集運多數拒收 UN1950。本週袋不進。停。
 ├─ 100V 電器 → 首批不進。若日後留：只預購 + 電壓警告，不混護膚袋。
 └─ 普通化妝品／頭髮／文具／非電工具 → 進入價錢樹。
```

### 2.2 再問這個星期在哪買（單位經濟觸發）

同一週、同一 SKU。把「日本看起來平」換成**落地後是否仍便宜到蓋過摩擦**。

摩擦（要加在日本稅拔價上，單位 CAD／件，標 estimate）：

| 層 | 量級 | 來源 |
| --- | --- | --- |
| 日本店頭稅拔 ÷ 108 | — | desk FX |
| 行李箱攤分 **或** 代運（國內運 + Buyee ¥500／單或 Tenso 作業 + 國際段到香港） | 常 **CAD 3–8** | `docs/research/04-sourcing-jp.md` |
| 香港 → YVR 週集運均攤 | **CAD 2–5** | `docs/research/01-unit-econ.md`（8–12 kg 帶） |
| DDP 進口 GST 5% × 申報值 | landed 的 5% | 你墊，寫進貼紙 |
| HS 3304 MFN 6.5%（沒有 CoO 就付） | CAD 12 貨 ≈ **0.80** | 香港不是 CPTPP 方 |

**禁止：** 日本網單 **AmazonGlobal／一件 DHL 直寄加拿大**。單票起跳已吃掉 Melano 級毛利。正確形狀永遠是：**日本倉或行李箱 → 香港週箱 → 加拿大 DDP。**

```
香港本週貨架有、促銷後進貨價 ≈ 目錄 landedCad？
 ├─ 有，且能對 JAN（或客人接受港版）
 │    → 這個星期萬寧／松本清。不要為 10% 日本消費稅飛。
 └─ 沒有／只有港版但客人指定日 JAN／日本大減
      → 算落地：
        日本稅拔÷108 + 行李箱或代運 + 週集運 2–5 + GST 5% + MFN 6.5%
        是否 < 香港同週落地，且差距大過斷貨成本（客人取消、再等一週）？
         ├─ 否 → 留香港，或缺貨預購等到下週連鎖。
         ├─ 是，且是文具限定／Hobonichi／開架日版斷貨
         │    → 去日本（疊在本來就要去的行程）或 JP 網單 → 香港倉集運。
         ├─ 是，且是 SK-II 230ml／Decorté 量級
         │    → 可以為日本出口發票走一趟；仍要集運，仍不要一件 DHL。
         └─ 「只是想追 CPTPP」→ 永遠不觸發。CAD 10–20 貨的 6.5% 不夠支付文件。
```

### 2.3 觸發／不觸發（用目錄數字講）

| 情況 | 算術 | 決定 |
| --- | --- | --- |
| **Hada Labo 化妝水** landed 11.50／賣 24 | 日本稅拔即使 ¥1,000（≈ CAD 9.26）再免稅，看起來省 ~CAD 2。代運或機票攤 CAD 3–8，加拿大段再 2–5，**已經輸**。萬寧週促時更輸。一件一寄 τ_x 中位 14 → CM_full **−5.1** | **這個星期萬寧／松本清。** |
| **Melano CC** landed 9.60／賣 21 | 一件一寄 τ_x 12 → CM_full **−3.75**。Mannings 正價 HKD 99 當 COGS → 毛利 **17%**，低於 28% | **只收出位價或松本清對得上 JAN 的貨。** 不直寄。 |
| **Fino 230g** landed 8.10／賣 18 | 重 280 g；一件一寄 τ_x 14 → CM_full **−6.80**。Amazon.ca 已錨在 CAD 18 | **香港促銷收、當加購。** 不為它飛。 |
| **Hobonichi Weeks 英語版** landed 28／賣 52 | 香港沒有同期。季節 drop、預購引擎 | **觸發日本：** 官方／Hands／Loft，或 Rakuten 官旗 → 代運香港週箱。 |
| **SK-II 230ml** landed 148／賣 248 | 6.5% MFN ≈ CAD 9.62；一件 τ_x 25 貢獻仍正（約 +38） | **有預購才動。** 日本免稅店頭開始有數學意義；仍集運。無預購莎莎今日平 = 不買。 |
| **Rakuten 洗髮精 ×4 示例** | RGX 寄香港 Economy Air 示例 1.8 kg 級已 **¥4,000+** | 必須**集運成一個夠重的箱**再進香港週袋。單件直出加拿大 = 自殺。 |

**機票不是 COGS。** 一趟東京若只帶回 8 kg 藥妝，免稅 10% 會被機票吐回去。日本行要疊在本來就要去的行程，或一次帶夠週集運的量。

**三個按鈕怎麼按：**

| 按鈕 | 何時按 | 何時不准按 |
| --- | --- | --- |
| **這個星期萬寧／松本清** | Restock SKU 香港有貨；出位價或全線限定接近 landed；客人接受港版或 JAN 對得上 | 正價 Melano；為「巡第二間萬寧對價」（App 已對過） |
| **去日本或 JP 網店頭** | 日版 JAN 香港斷；Loft／Hands／Hobonichi 限定；日本藥妝大減 + 免稅後落地仍明顯低過香港 | 為 Hada／Melano 省 CAD 2；用旅客免稅當批發；Donki 免稅單當進貨發票 |
| **Rakuten + 集運（RGX／Tenso）** | 日本網價極端低或店頭當天沒有；文具整箱；官方旗艦 | 直寄加拿大；Yahoo 拍／Mercari 藥妝（RGX 明文不收 C2C；藥妝仿品風險）；單件出 |

---

## 3. 真貨協議

日本藥妝客人要的是**那一支**，不是「同一個品牌中文盒」。港版可以是真貨、同一工廠、不同條碼、不同說明書語言、偶有不同容量。

發票能證明什麼：**某日、某店、某品名、某價錢。**  
發票不能證明：這盒是日本 JAN、配方與大阪那支相同、Health Canada 准你賣、lot 未過期。

**真貨協議是照片，不是發票。發票是附件。**

### 3.1 進店五件事，缺一不買

（客人已聲明接受港版則第 1 點可放寬，但仍要拍照標「港版」。）

1. **JAN／條碼。** 日本 JAN 是 EAN-13，多數 **45 或 49 開頭**。港版／亞洲版常是另一組碼。與日本官網或你的 SKU 主檔對。對不上 → 標港版，只有客人接受才收。理貨對 JAN，不要對英文品名（Amazon 的 Hoshisu「北美改標」Melano ≠ Rohto 黃管；Hada Labo Tokyo ≠ 肌ラボ Premium）。
2. **製造 vs 輸入。** 日文盒找「製造販売元／製造者」；中英盒找 “Manufactured in Japan” vs “Imported by [Hong Kong Ltd]”。**日本製造 + 香港輸入商**仍可以是真貨，但它是港行貨，不是松本清大阪貨架那盒。拍這一欄。
3. **Lot／批號。** 盒底、摺口、或管尾噴碼。日本很多化妝品**只印批號、不印到期日**（安定性 ≥3 年可豁免印到期）。拍清楚、不要反光。不要把 CheckFresh 一類網站當法律依據。
4. **到期／PAO。** 有印到期就拒收剩餘 **< 12 個月**的貨（空運 + 客人使用期）。只有開封後月數（例如 12M）就靠 lot 推算，不確定則少買。
5. **封口。** 收縮膜、封貼、泵頭蓋完整。平行店「已開封確認真貨」= 不買。

### 3.2 出貨前最低包（每 SKU 每批）

- 發票（店名、日期、品名、數量、HKD 或 JPY）——**一張發票一個店**，不要合併私人購物
- 盒正面
- 條碼特寫
- 製造／輸入欄
- Lot 特寫
- 若有到期日：到期特寫

週日 18:00 鎖進該週資料夾 `YYYY-MM-DD/mannings/`（或 `matsukiyo/`、`logon/`）。這套降低客訴與 chargeback，**不構成** Health Canada 授權，也不讓防曬變合法。

### 3.3 深水埗價錢「好到不像真的」——預設假

| 訊號 | 動作 |
| --- | --- |
| 深水埗黃金商場／福華街／鴨寮街美妝 | **整區不進週巡。** 海關 2018「維納斯」名單包括深水埗；2025-07 仍在銅鑼灣／尖沙咀／上水檢冒牌藥＋化妝品。省下來的 20% 不夠一次假貨客訴。 |
| 平行店價低於連鎖 **>40%** 又講不清貨源 | 走開。平行 ≠ 假貨，但這是警告不是機會。 |
| 無商業登記、無公司名機打發票、手寫單、遊客專享無單 | 不買。加拿大客人 chargeback 時你拿不出零售商名稱。 |
| 條碼被貼紙遮、中文手寫譯名蓋住日文盒、拆盒、中文標貼 | 不買。 |
| 旺角／銅鑼灣／北角獨立藥房，預購缺貨且連鎖斷貨 | 只准買清單上的 SKU，且五件事全過：商業登記在當眼處、機打發票有公司名、未開封、JAN 45／49 對得上、lot 可拍。單店 **12 分鐘**，一週最多 2 店。開始講價或不讓拍 = 離開。 |

龍豐類連鎖在本地討論裡「有人信、有人出事片」——**不夠冷，不要當成系統貨源。**

---

## 4. 比對手更熟的部分

對手不是「一間交 11% 公司稅的加拿大公司」。溫市購物車會讓給：YesStyle／Stylevana（標價低、DDU）、Amazon.ca 第三方（Fino 已 CAD 18，sold-by 混、有深圳登記／改標）、Kiyoko.ca（安大略倉、包稅）、Shoppers 授權 Curel、以及微信／FB 代購（熟人、無發票、防曬照賣）。

**不要比誰更熟、誰更平。要比他們系統性不追的。**

| 他們知道什麼 | 你會系統性知道什麼 |
| --- | --- |
| YesStyle／Stylevana： Melano／Fino／Canmake **永遠 in-stock**，同一個 PDP，倉儲價常低過你的 `sellCad`（Melano 換算 ~CAD 12–15 vs 目錄 21） | **萬寧 dm 週 vs 日本改版週。** 他們不對香港促銷日曆或日本改版清舊批做採購。誰在出位價那週進、誰在改版前清 lot，COGS 才可能低過「永遠有貨」。這是要建立的作業，不是已偷到的時間表。週一 App 把出位價寫進買入表，週三只買表上的。 |
| Amazon：英文品名 + Prime。Fino 深圳登記；Melano CAD 27.99 那條公開寫「為北美改標」（Hoshisu ≠ Rohto 黃管） | **每件出貨拍 JAN／lot／製造欄。** 理貨對 JAN，不對英文。把「這支是松本清貨架那支」做成可核對證據。代購朋友圈只貼商品圖；YesStyle 不在包裹層給批號。 |
| 代購：防曬照賣、效期靠「我剛從日本返」、現金／e-transfer、無 CNF | **Health Canada 會查封哪類 SKU。** 化學濾劑防曬商業進口／廣告／出售未授權產品違法（CBC 2024-09-10）。你正式目錄沒有這 19% desk GMV。詢單來了，轉去合法護膚／頭髮／文具，不要用「到港自取」在店上打廣告。 |
| YesStyle 對 BC **不是 DDP**：關稅可事後退店積分，GST／PST 不在退款範圍；BC 客人仍會收到 DHL 第二張單 | **DDP 一次寫清。** 寧願標貴、Pay 之前總數鎖定。這是他們懶得做、你做了就能減少拒收的事。 |
| 美妝電商幾乎不賣 FriXion 5 支裝／Sarasa／Campus；YesStyle 文具是角色聯名 | **文具是對手懶得做的洞，也是合規避難所。** LOG-ON 週巡，當加購拉 AOV，不當萬寧順便。 |
| YesStyle／Kiyoko／Amazon／Shoppers 都是 **先備貨再收款** | **預購現金週期。** 先收 CAD 再跟萬寧週採。基準盤年 COGS ~38k，現貨要壓 6–10 週 ≈ CAD 8k–15k，能吃掉 Year 1 稅後一半。不要為了像他們一樣快把預購丟掉。 |
| 全球倉夏天推 Aqua Rich／韓系防曬；不會為一個城市改庫存權重 | **溫市願付在冬天的保濕與批號，不是夏天的凝膠。** Curel 40g 已是 Shoppers 29.99——當冬天補貨／套裝，不當「加拿大買不到」。Hada 日版 vs Hada Labo Tokyo 仍是差異化。 |
| CPTPP、日本產地故事 | **客單 CAD 68 上，CoO 幾乎無關。** Melano 6.5% ≈ CAD 0.62，不夠支付文件。YesStyle 不申請；代購不申請。不要寫進售價模型。 |
| 代購可以「今晚交貨」（朋友倉——那是 PE 灰色） | **承認 7–21 日，用日曆日期而不是「3–7 business days」。** 不要假裝 48h 又無 PE。 |

活頁錨（2026-08-20，標價層，未計你的 DDP）：YesStyle Melano ~CAD 12–15；Fino Amazon.ca **CAD 18.00**；Fino YesStyle ~CAD 16；Hada YesStyle ~CAD 19／瓶；Kiyoko Fino 促銷 **11.99**、Hada 26、Curel 40；Shoppers Curel **29.99**。目錄 Melano 21／Fino 18／Canmake 16 **高過** YesStyle 標價——沒有問題，只要售價是 DDP、SKU 是原裝日版。問題是把 21 理解成「已經比對手便宜」。

---

## 5. 首批 20 個可合法賣去加拿大的 SKU

來自 `src/data/products.ts` 核心 id。**不含** 所有 `category: sunscreen`、**不含** `rohto-lycee`、**不含** Transino 類 NHP。毛利 = `(sellCad − landedCad) / sellCad`，是**目錄毛利**，未扣經營盤那 4 pt 頭髮。上架門檻 28%；下列全部過。

先有加拿大 importer of record 做化妝品 CNF（首次出售 10 日內）。標籤 Year 1 走「外盒英／法 sticker」，不要假裝日文原盒已經合法。

未列入但合法可賣、首批不掃：SK-II／Ultimune／Decorté／Shu（無預購不准買）；Attenir／Milbon（日本單）；100V 電器（擱）；`curel-spray`（氣霧、平價集運拒收）；`muji-oil`（加拿大店搶同一條）；`diane-repair`（重、需求弱）。

| # | id | 品名（目錄） | 目錄毛利 | 預設買入 | 為什麼是這條、不是旁邊那條 | 擱／注意 |
| ---: | --- | --- | ---: | --- | --- | --- |
| 1 | `hada-lotion` | Hada Labo Gokujyun Premium Lotion 170ml | 24−11.50 → **52.1%** | 松本清香港對日 JAN；萬寧出位價且客人接受港版則改萬寧 | Restock 英雄。Shoppers 的是 Hada Labo Tokyo，不是肌ラボ。Kiyoko 26 比目錄 24 貴——這格可打 | 一件一寄貢獻為負；必須進週袋 |
| 2 | `hada-foam` | Gokujyun Foaming Wash 160ml | 19−9.20 → **51.6%** | 同上，與化妝水當套裝掃 | 目錄 notes：pair with lotion。重量 200 g，仍屬週袋 | — |
| 3 | `melano-cc` | Melano CC Intensive Essence 20ml | 21−9.60 → **54.3%** | 松本清 JAN 45／49；萬寧**只收出位價**（正價 HKD 99 毛利 17%） | 差異化仍在（Shoppers 無日版黃管）。假貨故事是護城河。對 JAN，不要出 Amazon 改標那支 | 輕（55 g）但一件一寄仍負。YesStyle ~12–15：不要跟標價 |
| 4 | `dhc-oil` | DHC Deep Cleansing Oil 200ml | 26−12.80 → **50.8%** | 松本清 → 萬寧出位價 | 目錄：classic first-order。CNF 化妝品 | 230 g，週袋可以，不要單寄 |
| 5 | `naturie-gel` | Naturie Hatomugi Gel | 17−7.90 → **53.5%** | 松本清；Sundrug 日本行若大減再算落地 | 開架、預購適合度高。夏天凝膠冬天仍動 | — |
| 6 | `kose-softymo` | Kose Softymo Speedy Oil | 18−8.40 → **53.3%** | 松本清／萬寧出位價 | 入門卸妝、適合作 bundle | 250 g、`bulky: 3`：控件數 |
| 7 | `minon-lotion` | Minon Amino Moist Lotion | 28−13.40 → **52.1%** | 松本清香港（萬寧不穩） | 敏感肌線；Curél 已授權後，這支仍較不像 Shoppers 貨架 | 香港斷貨 → 日本單，不要平行店 |
| 8 | `fancl-oil` | FANCL Mild Cleansing Oil 120ml | 32−16.00 → **50.0%** | 松本清；無則日本網店旗艦 → 香港集運 | 無防腐故事。Year 1 沒有 FANCL B2B | — |
| 9 | `curel-cream` | Curel Intensive Moisture Cream 40g | 29−14.00 → **51.7%** | 松本清／萬寧出位價 | **合法可賣。** 2025-09 起 Shoppers **29.99** 已是替代——當冬天補貨／批號／套裝，不當「加拿大買不到」 | 不要為它開倉搶 1–3 日。噴霧 `curel-spray` **不在本表**（氣霧） |
| 10 | `fino-mask` | Fino Premium Touch 230g | 18−8.10 → **55.0%** | 松本清 → 萬寧出位價 | 頭髮禮物 + 復購。Shoppers 未見授權 | **重 280 g。** Amazon／Kiyoko 已打價——當加購，不當鉤子。一件一寄負貢獻 |
| 11 | `tsubaki-oil` | Tsubaki Premium Repair Oil 50ml | 21−9.70 → **53.8%** | 松本清 → 萬寧出位價 | 輕（80 g），補 Fino 重量。CNF | — |
| 12 | `honey-shampoo` | &honey Melty Moist 440ml | 28−13.60 → **51.4%** | 有預購才買；松本清／Donki | 目錄 notes：**Sea freight only** | **擱出每週空運袋。** 480 g、`bulky: 4`。海運批次或等袋極輕的週 |
| 13 | `canmake-cheek` | Canmake Cream Cheek **16** | 16−7.40 → **53.8%** | 松本清香港 | 色號 16 是英雄；YesStyle 活頁常是別的色——出貨寫色號 | 輕、週袋優先。JHC 仿款不進 |
| 14 | `heroine-mascara` | Heroine Make Long & Curl Advanced | 20−9.10 → **54.5%** | 松本清香港 | 膜型／防水不要混 SKU。Kiyoko 近款曾售罄 | 28 g，週袋 |
| 15 | `pilot-frixion` | Pilot FriXion Ball Knock 0.5 **5-pack** | 16−7.20 → **55.0%** | **LOG-ON**，不是萬寧 | 文具避難所。美妝對手幾乎不賣工作筆 5 支裝 | — |
| 16 | `zebra-sarasa` | Zebra Sarasa Clip Vintage 5-pack | 15−6.90 → **54.0%** | LOG-ON；日本 Loft 限定色 | 目錄：vintage colours sell out。香港沒有的色才觸發日本 | — |
| 17 | `uni-one` | Uni-ball One 0.38 8-colour | 24−11.40 → **52.5%** | LOG-ON／日本文具店 | 顏料墨水圈子。加購拉 AOV | — |
| 18 | `kokuyo-campus` | Campus Dot Lined B5 5-pack | 19−8.80 → **53.7%** | LOG-ON；日本整包再集運 | 學生／planner。文具關稅多數 0 或低 | **擱出「當輕平貨灌袋」。** 520 g、`bulky: 4`，體積重可高過實重。預購湊袋或海運 |
| 19 | `hobonichi-weeks` | Techo Weeks English 2027 | 52−28.00 → **46.2%** | **日本官方／Hands／Loft／Rakuten 官旗 → 香港週箱** | 季節 drop、預購引擎。香港貨架不是供應 | 過門檻 28%。無同期香港貨 → 這是少數「按樹觸發日本」的 SKU |
| 20 | `mapepe-brush` | MaPEPE Scalp Massage Brush | 16−6.40 → **60.0%** | 日本 Hands／松本清雜貨牆對 JAN | 非電工具、便宜加購。`ikemoto-comb` 同類可輪替 | 香港 JHC 不保證同款。無 JAN 不買 |

**本週袋口令：** 1–11、13–17、20 進空運週袋（Fino 控件數）。12 與 18 有預購才走海運或等極輕週。19 走日本預購日曆。氣霧、100V、防曬、眼藥、食品：**零件。**

---

## 6. 每週儀式

預設：**一週一次實體、週中一次 App 補漏。** 預購單是主倉；促銷是加成。沒有預購的精品與 100V **不准買**。整天實體上限 **3.5 小時門到門**。選路線 A 或 B，不要一天跑兩條。

時間盒：松本清非旗艦 20 分鐘／銅鑼灣旗艦 35 分鐘；萬寧 15–20 分鐘；屈臣氏 15 分鐘；莎莎 20 分鐘且必須有預購精品；Donki 藥妝區 20 分鐘；平行店 12 分鐘／店、一週最多 2 店。逾時還在「看看還有什麼」= 離開。

**路線 A（預設，銅鑼灣 90–110 分鐘）：** 銅鑼灣 E → 松本清恒隆 G+1（對 JAN）→ Donki 名珠城只上藥妝層 → 同街萬寧只買 App 已圈 SKU → 有精品預購才莎莎 → 文具週才下時代廣場 B1 LOG-ON。

**路線 B（旺角 70–90 分鐘）：** 松本清雅蘭 G+1 → Donki 文華 2 樓（10:00 才開）→ 彌敦道萬寧只買清單 → 平行店預設路過。不要順便深水埗。

---

**週日 21:00（人在家）**

1. 打開本週預購表：SKU、數量、客人要**日版還是不在乎港版**。
2. 把 never-buy 劃掉：所有防曬、Lycee、口服美白、食品、無預購精品、無預購 100V、氣霧。即使客人催。
3. Restock 心智：Hada 水／洗面、Melano CC、DHC 油、Fino、Canmake 16、Heroine、FriXion／Sarasa——有單就買；促銷店優先，沒促銷就松本清正價，不要賭週五出位價而斷客人。

**週一 10:00–10:40（仍在家，禁止出門）**

4. 萬寧 App：出位價／今日出位價／yuu。清單 SKU 搜一遍。有貨＋出位價 →「萬寧・促銷」。只有正價 →「松本清先看」。
5. 屈臣氏易賞錢：只標**清單上已有**的價。禁止瀏覽「本週激抵」加新 SKU。
6. 松本清香港官網／IG：全線限定週把對應 SKU 標「松本清・促銷」。
7. 莎莎：僅當預購有 SK-II／資生堂精品。Donki：沒有藥妝週促就不要改路線。
8. 文具週：LOG-ON 有沒有 FriXion 5 裝／Sarasa Vintage／Campus——寫進表，不要到了藥妝店才想起來。
9. 產出**買入表**（一行一個 SKU）：店、上限價（HKD）、數量、JAN（若要日版）、restock 還是 opportunistic。沒有這張表不出門。
10. Opportunistic（沒有預購的促銷）同時滿足才加：(a) 已在目錄且非 never-buy；(b) 不超過預先寫死的上限價（店裡不重算 P&L）；(c) 重量／噴霧／鋰電過得了本週集運。**每週上限 8 件或 HKD 1,500，先到先得。**
11. 選 A 或 B。每店時間盒寫在備忘錄最上面。

**週一 10:40 決策**

12. 香港本週能對 JAN 且價錢過關 → 留香港。落地算術輸給代運／機票 → 留香港。Hobonichi／日版斷貨／日本大減仍贏 → 才開 JP 網單到香港倉，或疊在已計畫的日本行。

**週三（預設實體日；萬寧日）**

13. 若當週 1 或 15 碰上恒生 enJoy 萬寧滿 HKD 500 → 92 折，把萬寧段改到那天；松本清仍可週三。屈臣氏 8／18／28 才疊屈臣氏段，否則跳過。
14. 進店順序永遠是：**松本清（對 JAN）→ 清單缺口才萬寧 → 屈臣氏只對價 → Donki 只補缺口 → 莎莎只精品預購 → LOG-ON 只文具週。**
15. 單手買入表、另一手拍照。不試妝、不買 matsukiyo 自家保健、不「順便」零食。
16. 結帳：一店一票，立刻拍進 `YYYY-MM-DD/店名/`。店外 2 分鐘對發票行數 = 袋內件數，少了立刻回頭。
17. yuu／易賞錢結帳出示。出位價通常不能再疊 yuu。積分回贈不要寫進 landed。

**週四–週日**

18. 週四：萬寧「1 折快閃」**只准買清單 SKU**。
19. 週五至日：出位價擊中 restock 而週三沒買夠 → **只再進一間萬寧、20 分鐘**。
20. 週日 18:00：照片、發票、lot 表鎖檔。缺的 SKU 寫進下週預購——**不要週日晚上衝旺角平行店。**
21. 出貨前：每批最低包（§3.2）齊了才進週箱。未賣出的留香港。主袋目標 8–12 kg；Fino／Campus／&honey 控件數。商業發票寄件人是香港公司，原產國寫日本（若真是日本製），不要寫 gift。

---

## 口令

> 週一 10 點在家用 App 寫死買入表。週三只走一條線。松本清對 JAN，萬寧只收出位價。莎莎沒有預購當沒有。平行店是例外，深水埗不是例外。防曬在香港再平，也不是加拿大貨。一件一寄不做。日本網單只進香港週箱。真貨是 JAN＋lot 照片。YesStyle 已經住在「平 3 刀」那條曲線上——你住在批次、DDP、文具、以及不賣會被查封的東西。

研究筆記，不是稅務或法律意見。

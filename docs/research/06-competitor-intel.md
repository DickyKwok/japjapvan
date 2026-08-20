# Wave 1 / 06 — 對手情報（價格、天數、可替代性）

**研究日期：** 2026-08-20  
**對象：** JapJapVan（香港／日本採購 → 溫哥華零售，賣 CAD）  
**性質：** 營運研究筆記，**不是**稅務意見、法律意見、或報稅依據。落地前要找熟悉跨境的加拿大 CPA 核過。

稅、PE、GST、de minimis CAD 20、HS 3304 MFN 6.5%、Year 1 不賣防曬：一律以 `docs/research/_shared-facts.md` 與 `docs/hk-ca-tax-price-advantage-2026.md` 為準，本文不重打稅差。稅務備忘已點名的對手——YesStyle / Stylevana / Jolse、Amazon.ca 灰市、溫市 WeChat／FB 代購、T&T / Daiso / MiniSo / Tokyo Life、Shoppers / Sephora——下面用**活頁標價**核對，不是憑記憶背。

---

## 一句結論

這盤生意的對手不是「一間交 11% 公司稅的加拿大公司」。活頁上，溫市客人真正會把購物車讓出去的，是：

1. **YesStyle / Stylevana**（目錄齊、標價常低過 JapJapVan 目錄 `sellCad`、香港倉、船期以週計、清關常常 DDU）
2. **Amazon.ca 第三方**（Prime 一兩日、Fino 已在 CAD 18 附近、但 sold-by 混、有改標／深圳登記）
3. **Kiyoko.ca**（安大略發貨、包稅、無關稅帳單；Fino 促銷可低至 CAD 11.99，Curel 40g 卻賣 CAD 40）
4. **Shoppers 授權日版 Curel**（2025-09 起上架，40g **CAD 29.99**——與目錄 `curel-cream` 的 `sellCad` 29 **同一價位、同一 SKU 形態**）
5. **溫市 WeChat／FB／小紅書代購**（熟人、現金／e-transfer、可當日或週內交貨，無 CNF、無發票）

**不要用低 2–3 刀去打 YesStyle 的 Melano。** 目錄 Melano `sellCad` 21，YesStyle 現價換算大約 CAD 12–15（未計 GST／經紀）。價格優勢只對「加拿大正規貨架沒有的日版／港版」成立；對已經授權上架的 Curel，Shoppers 就是替代品。文具（FriXion／Sarasa）是這張籃子裏幾乎沒人認真做的洞。Biore Aqua Rich 只當需求標尺——**JapJapVan 正式目錄不得賣**（Health Canada：化學濾劑防曬要 DIN／NPN，商業出售未授權產品違法；CBC 2024-09-10 寫過可查封）。

---

## 方法與匯率

- **活頁日期：** 2026-08-20。未能打開的店寫明跳過，不編造。
- **目錄對照：** `src/data/products.ts` 核心 SKU 的 `sellCad`（這是 JapJapVan 標價假設，不是已成交價）。
- **CAD 換算（僅用於 YesStyle 非 CAD 頁）：** USD/CAD **1.38**（Yahoo `CAD=X` 2026-08-20 收市約 1.3805）。TWD：1 CAD ≈ 23.3 TWD（由 USD/TWD≈32.1 與 1.38 回推）。**標成「換算」，不是結帳價。**
- **YesStyle 地緣：** 本次 PDP 把配送顯示成台灣、標價 NT$。搜尋快照另有 USD。加拿大客人結帳常見 USD。**不是**溫哥華郵編的 DDP 到戶價。
- **Stylevana 加拿大站** PDP 為前端渲染，本次工具讀不到單品 HTML 價錢；Melano／Fino 的 CAD 來自 2026-08-20 官網加拿大首頁快照。其餘 Stylevana SKU 標「PDP 未讀到」。
- **Amazon.ca** 配送預設落到 Alberta Balzac T4B（工具 IP），不是 V6；Amazon.ca 境內履約對溫市通常同類，仍標「非 V6 核對」。
- Shoppers 官網 PDP 被擋（Access Denied）；Curel 價用 Vita Magazine 2025-08-29 發布稿 + Pharmaprix／Reddit 交叉。

---

## 價格籃（SKU × 對手 × 價 × URL × 日期）

**JapJapVan 欄 = 目錄 `sellCad`，不是已驗證成交。**  
**標籤：** `標價` = 商品頁數字，未含境外 GST／關稅／經紀；`到戶估` = 境內倉或授權店、稅另計或已含於結帳；`促銷` = 當天折扣。  
Biore 列為需求標尺，**正式 catalog 不賣。**

| SKU（目錄） | JapJapVan `sellCad` | YesStyle（2026-08-20） | Stylevana CA（2026-08-20） | Amazon.ca（2026-08-20） | Kiyoko.ca（加拿大倉） | Shoppers / 其他授權 | 備註 |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| Rohto Melano CC Intensive Essence 20ml | 21 | **NT$ 283.13**（原 NT$ 353.92，約八折）→ 換算 **CAD ~12.2**。搜尋 USD 快照 US$ 10.40／12.99 → **CAD ~14.4／17.9**。URL: https://www.yesstyle.com/en/rohto-mentholatum-melano-cc-vitamin-c-essence-20ml/info.html/pid.1122834023 | 首頁快照 **CA$ 12.29**（原 CA$ 24.39）。URL: https://www.stylevana.com/en_CA/rohto-mentholatum-rohto-melano-cc-concentration-measures-essence-20ml42850.html | **CAD 27.99**（Hoshisu 改標「北美包裝」）Sold by Gemini Image、FBA。另有日文名 listing **CAD 33.89**。URL: https://www.amazon.ca/Melano-Essence-CC-Vitamin-Serum/dp/B0F562GC1J | 本次未打開 Melano PDP | 非替代（Shoppers 無此日版精華） | Amazon 這條**不是**原裝 Rohto 管；見下文 |
| Fino Premium Touch mask 230g | 18 | **NT$ 363.94**（原 NT$ 519.91）→ 換算 **CAD ~15.6**。URL: https://www.yesstyle.com/en/shiseido-fino-premium-touch-hair-mask/info.html/pid.1126837080 | 首頁快照 **CA$ 15.59**（原 CA$ 23.19）。URL: https://www.stylevana.com/en_CA/shiseido-fino-premium-touch-hair-mask-230g6848.html | **CAD 18.00**（BBD Online Store）／**CAD 18.58**（PREMIUM JAPAN、FBA）。Was CAD 19.77。過去一個月 1K+ 件。URL: https://www.amazon.ca/Three-Fino-Premium-penetration-Essence/dp/B00YM1MEJI | **CAD 11.99** 促銷（原 19.00），加拿大發貨、滿 65 免運。URL: https://kiyoko.ca/en-ca/products/shiseido-fino-premium-touch-hair-mask-230g | 非授權貨架英雄 SKU | Amazon 登記地 Shenzhen cosmetics；不可無理由退 |
| Hada Labo Gokujyun Premium lotion 170ml | 24 | **NT$ 435.98**（原 NT$ 544.97）→ 換算 **CAD ~18.7**。URL: https://www.yesstyle.com/en/rohto-mentholatum-hada-labo-gokujyun-premium-lotion/info.html/pid.1122621936 | PDP 未讀到 CAD | 本次未核到穩定的 170ml 日版單價（Amazon.com 有美區配方，勿混） | **CAD 26.00**。URL: https://kiyoko.ca/en-ca/products/hada-labo-gokujyun-premium-hydrating-lotion-170ml | Hada Labo Tokyo 北美線 ≠ 日版 Premium | 日版 vs 北美配方要分開報 |
| Curel Intensive Moisture Cream 40g | 29 | **NT$ 679.01**（原 NT$ 848.77）→ 換算 **CAD ~29.2**。URL: https://www.yesstyle.com/en/kao-curel-intensive-moisture-care-moisture-facial-cream-40g/info.html/pid.1131567184 | PDP 未讀到 CAD | 有 JP Curel 系列 listing（本次未鎖 40g 面霜單一價） | **CAD 40.00**。URL: https://kiyoko.ca/en-ca/products/curel-intensive-moisture-care-moisturizer-cream-40g | **Shoppers CAD 29.99**＋稅（2025-09 授權登陸）。Reddit：T&T **34.99**、Sukoshi **~32.99** | **已是替代品。** 目錄 29 打不過 Shoppers 的信任＋即拿 |
| Canmake Cream Cheek（色號 16 為目錄英雄；活頁常見 24 Peach Mousse） | 16 | **NT$ 212.98**（原 NT$ 266.22）→ 換算 **CAD ~9.2**。搜尋 USD 快照 US$ 8.08／8.50。URL: https://www.yesstyle.com/en/canmake-cream-cheek-24-peach-mousse/info.html/pid.1073879287 | PDP 未讀到 CAD | 本次未鎖到穩定 CA 單價 | 本次未打開 | 非 Sephora／Shoppers 同類開架 | 色號會漂；比價要寫色號 |
| Heroine Make Long & Curl Mascara Advanced | 20 | **NT$ 278.12**（原 NT$ 347.65）→ 換算 **CAD ~12.0**。URL: https://www.yesstyle.com/en/isehan-kiss-me-heroine-make-long-curl-mascara-advanced-film-56-hydrangea/info.html/pid.1075162835 | 美區快照曾見 US$ 9.99（Was 12.23）；CA 站 PDP 未讀到 | 有多條 Kiss Me listing，sold-by 混、價散 | Volume & Curl **CAD 25.00，售罄**（近 SKU，非同一支 Long & Curl Advanced）。URL: https://kiyoko.ca/en-ca/products/kissme-heroine-make-volume-curl-mascara-6g | 非替代 | 膜型／防水型不要混成一條 |
| Pilot FriXion 或 Zebra Sarasa | 16／15 | YesStyle 文具為角色聯名筆，**5 支裝工作筆不在美妝主目錄**；Snoopy FriXion 頁標「no longer available」 | 不賣這類文具 | Amazon.ca 有文具，但是辦公／學生渠道，不是 J-beauty 購物車 | 不賣 | Daiso／MUJI／文具店即拿 | **這是對手懶得做的洞** |
| Biore Aqua Rich Watery Essence SPF50+（**需求標尺；不得賣**） | 目錄 24（禁止上架） | **NT$ 365.81**（原 NT$ 457.27）→ 換算 **CAD ~15.7**。搜尋 USD 快照 US$ 11.68／14.60。URL: https://www.yesstyle.com/en/kao-biore-uv-aqua-rich-watery-essence-sunscreen-spf-50-pa-70g-2025/info.html/pid.1122056968 | 有 Aqua Rich 系列；CA 站 PDP 未讀到 | 灰市大量 | 有日系防曬類（本次未核單價） | **授權貨架基本沒有日版化學濾劑 Biore** | CBC 2024-09-10：未授權防曬在加拿大出售違法，可查封 |

**籃子怎麼讀：** 在「標價、未計 GST」這一層，YesStyle／Stylevana 的 Melano、Fino、Canmake、睫毛膏**系統性低過** JapJapVan 目錄。Fino 在 Amazon 已經打到目錄價 18；Kiyoko 促銷 11.99 更低。Curel 是例外：授權店 29.99，Kiyoko 40，YesStyle 換算約 29——**目錄 29 沒有稅務空間再砍。**

---

## 各對手

### 1. YesStyle

**定位：** 香港倉、全球美妝電商。目錄 **KR 為主、JP 開架藥妝齊、CN 有一部分**。不是「日本專門店」。

**採購猜測（一行）：** 韓國授權盤＋日本平行出口商進香港倉，**不是**每週跟萬寧 dm 掃貨。

**船期（官網表，2026-08-07 生效）：** 加拿大 Express：滿 US$ 180 免運、US$ 100–180 收 US$ 7、低於 US$ 100 收 US$ 11，標 **3–5 工作日**；Standard：滿 US$ 35 免運，標 **10–14 工作日**。實際 Reddit r/CanSkincare（2025-12）：多倫多 Express 常見 **約 3 週**。要加「商品備貨日」（多數 in-stock 24h，預購另計）。

**關稅政策：** **DDU 為主，再加事後退款。** 官網：US$ 1,000 以下訂單的「customs-related taxes and fees」（關稅、進口稅、經紀費）可憑收據 30 日內申報，**退 YesStyle Credit**。**明確排除** GST／VAT／PST。加拿大 PST 頁此刻只寫 **Saskatchewan 6% 在結帳收**——**沒有寫 BC 7% PST**。BC 客人：GST 5%（外加可能的 PST／經紀）多半在 DHL／Canada Post 第二張帳單出現。Reddit r/koreanskincare：BC 一張 CAD 182 的 YesStyle Express，DHL 再收 **CAD 36** 進口費。

**退貨：** 14 日；官網稱在美國、**加拿大**、香港有退貨物流代理。退款預設店積分。

**仿貨聲譽：** r/KoreanBeauty 2023–2025 有「便宜到像假貨／效期／氣味不對」帖（例：`16gnvzr`、`1aj1lvn`），也有用兩年沒遇假貨的反證。共識比較接近：**大盤正貨、效期與批次參差、客服用積分打發**，不是淘寶假貨倉。YesStyle 寫 ISEHAN 來自 authorized distributors。

**弱點（JapJapVan 能用）：**  
1. 標價不含 BC 落地稅——DDP 一次寫清可以贏轉換，不必贏標價。  
2. 不拍 JAN／lot／expiry。  
3. 不賣正經文具 5 支裝。  
4. 不追萬寧 dm 與日本改版週。  
5. 退貨雖有加拿大代理，實務仍是「先自己寄、再等積分」。

### 2. Stylevana（加拿大站 `stylevana.com/en_CA`）

**定位：** 香港倉。美區站自述 KR 貨「每日從韓國運到香港倉」。目錄 **KR 更重、JP 藥妝有、時尚／美妝混賣**。

**採購猜測（一行）：** 韓國供應商日運香港，日本貨走出口商／平行，現貨模型。

**船期（CA 站 2026-08-20）：** Standard：滿 **CA$ 68 免運**，否則 CA$ 7.99，標 **6–12 工作日**；Express **CA$ 25**，標 **3–6 工作日**。另加處理：in-stock 24h，最長「30 working days」才出倉。Reddit r/CanSkincare `1hr7u6h`（2025-01）：聖誕檔 **3–6 週**、要過加拿大海關。Trustpilot（近評，ca.trustpilot.com/review/stylevana.com）：付了加急仍兩週不到是常見投訴。

**關稅：** CA 站 shipping 頁**沒有**寫「結帳已含 GST／DDP」。美區頁只把南非／汶萊／哥倫比亞列為客人當 importer of record。加拿大實務按跨境直寄：**DDU 風險在**，de minimis CAD 20 幾乎必破。Reddit 有人專門問 Stylevana 關稅（`1n1puv7`）。FAQ 另有「Duty Free 標籤貨不可退」——這是平行貨的氣味。

**退貨：** 14 日；客人自己 **Air Mail 寄回香港**。瑕疵才報運費。過敏不退。時尚可換碼，美妝實務接近不退。

**仿貨：** 官網稱 authentic、KR 直採。論壇較少「假貨」、較多「效期／出貨拖／加急不 honoured」。

**弱點：** 處理日可以把「6–12 日船期」變成一個月；退貨要寄香港；標價 CAP 常靠折扣碼，目錄原價虛高（Melano 原 CA$ 24.39、現 12.29）。JapJapVan 不需要跟 12.29 打 Melano——要打的是「批次照片＋DDP＋不賣防曬」。

### 3. Jolse

**定位：** 韓國 Suwon 公司（JOLSE Co., Ltd.），**K-beauty 專店**。

**採購猜測（一行）：** 韓國國內盤，不是日本藥妝。

**籃子：** 搜尋 Melano CC／Fino／Hada Labo／Curel／Canmake／Heroine Make **沒有對得上的日版 PDP**。本次 **跳過價格列**。溫市客人要日版藥妝，Jolse 不是購物車對手；要 Cosrx／Beauty of Joseon 才是。

**船期／關稅：** 官網 shipping notice：**不保證不清關**；產生費用 **客人自付（DDU）**。據實申報、不接受改低申報。加拿大在可送名單。CKFTA 下韓國原產理論可 0 關稅，但仍有 GST＋經紀。Trustpilot 有「韓國寄出約 10 日到」的正面個例。

**弱點：** 品類錯位。不要把 Jolse 當日系對手來定價。

### 4. Amazon.ca（sold-by 混合物）

**定位：** 信任殼＋Prime。日系開架幾乎全是 **第三方**，不是 Amazon 自營日本藥妝。

**採購猜測（一行）：** 賣家從日本郵局、香港、或深圳改標後 FBA。

**活頁事實：**

- **Fino 230g CAD 18.00／18.58**，過去一個月 1K+。Sold by BBD Online Store 或 PREMIUM JAPAN（FBA）。商品資訊 **Place of Business: Shenzhen cosmetics cp ltd, Shenzhen CHINA**；賣點寫 “w/tracking number from JP Post”。**不可無理由退**，只接受損壞／瑕疵。
- **Melano：** 一條 CAD 27.99 的 listing 品牌是 **Hoshisu**，文案：「authentic Japanese skincare, thoughtfully **repackaged and translated for North American use**」。這不是松本清貨架那支黃管 Rohto。旁邊才有日文名「薬用」listing CAD 33.89。
- 履約：FBA 可 **翌日／兩日**（工具所見 Aug 21–25 窗）。這是 YesStyle 做不到的速度。

**仿貨／配方風險：** Fino 的深圳登記＋Melano 的「為北美改標」就是聲譽成本。r/AsianBeauty 舊帖已有人用 Kyoto Style 等賣家買 Melano 覺得「便宜到不值得賭」。

**弱點：** 同一 ASIN 混 JP 原裝、改標、可能美區配方。JapJapVan 只要每件出貨拍 **JAN＋批號＋效期**，這句話 Amazon 第三方說不出口。價格上 Fino 已經打平目錄 18——不要幻想靠 Fino 單品贏 Amazon，要靠「這罐是日文標、批次可追」贏不信任 Amazon 的華人客。

### 5. eBay.ca 灰市

**定位：** 全球賣家、Buy It Now 為主。

**採購猜測（一行）：** 日本個人／出口商／美國轉售，申報與效期不透明。

**活頁：** 搜尋可見 Fino 3 件裝約 **C$ 45.79**（約 CAD 15.3／件）免運、以及 Melano 套裝；頁面流動快。**不是**穩定零售價。假貨／水貨／近效期風險高於 YesStyle。

**弱點：** 信任極差。只搶「已經知道 JAN、只差價錢」的客人。不要在 eBay 跟價。

### 6. iHerb

**相關但不是這條籃子的對手。** ca.iherb.com 有 Melano CC **Lotion 170ml CA$ 28.99**（化妝水，不是 Essence 20ml）。Fino／Canmake／Heroine 不是 iHerb 主力。有時從美／加倉出、DDP 較乾淨，但 SKU 對不上日本藥妝英雄籃。**不列入價格主表。**

### 7. Kiyoko.ca（本次找到的加拿大 DTC；`japanese-beauty.ca` 未找到活站）

**定位：** 安大略起家的 KR＋JP 電商。自稱「No gray market」、**加拿大發貨、duty-free、滿 CAD 65 免運**。這是稅務備忘裏「Canadian DTC」那一格的實體。

**採購猜測（一行）：** 日本／韓國供應商進加拿大倉（有 PE／GST 的形狀），再用 CAD 零售。

**活頁：** Fino **11.99／19**；Hada Labo Premium 170ml **26**；Curel 40g **40**；Heroine Volume & Curl **25 售罄**。Curel 比 Shoppers 授權價 **貴約 10 刀**——可見「加拿大倉＋正貨故事」撐得起溢價，但撐不起對 Shoppers 的溢價。

**弱點：** 價高（Curel）、KR 比重仍大、溫市沒有自家店面。JapJapVan 若走預購集運，船期輸 Kiyoko；若講「香港現場萬寧／日本改版」，Kiyoko 的加拿大倉做不到同樣新鮮度。

### 8. Shoppers Drug Mart / Sephora.ca（授權，多數不是替代）

**Shoppers × Curel：現在是替代品。** Vita Magazine 2025-08-29：Curél 日系敏感肌線 **2025-09-07** 加拿大首發，**Shoppers 獨家**，六件 **CAD 29.99–34.99**。Intensive Moisture Facial Cream **40g = CAD 29.99**。Elle Canada／Shoppers Beauty IG 同期。這與目錄 `curel-cream`（40g、`sellCad` 29、notes: Vancouver winters）**同一使用場景**。Reddit r/CanSkincare `1muz8vi`：Shoppers 29.99 是所見最低，T&T 34.99、Sukoshi ~32.99。

**仍然不是替代的：** Melano CC 日版、Fino、Hada Labo **日版** Premium、Canmake Cream Cheek、Heroine Make、Biore 日版。Shoppers 的 Hada Labo 若有，是 **Hada Labo Tokyo 北美配方**，不是松本清金瓶。Sephora.ca 是歐美／韓系精品，**不是**萬寧式開架。

**含義：** Curel 不要再當「加拿大買不到的日版」來定價。要當「與 Shoppers 授權貨同價、但你提供批號照片／套裝／冬天補貨節奏」。Melano／Fino／彩妝仍是平行貨故事。

### 9. 溫市即拿：T&T、Daiso、MiniSo、Tokyo Beauty、Konbiniya 等（只作家品，不裝滿籃）

未能逐店掃貨架價（除 Curel 的 Reddit／媒體交叉）。**家品偏差（2026-08 能核到的）：**

| 店 | 偏差 | 對籃子 |
| --- | --- | --- |
| **Tokyo Beauty**（Kerrisdale；IG 亦見 West Van） | 溫市最接近「日本藥妝櫃」的實體。IG 開箱見過 Hada Labo Premium、Melano CC、Fino、DHC | **即拿替代**，價未核。Facebook 代購帖把它與 MUJI／Daiso 並列為「不想等代購就去的地方」 |
| **T&T** | 亞洲雜貨＋少量藥妝。Curel 授權後 **CAD 34.99**（Reddit） | Curel 替代， Melano／Fino 深度不足 |
| **Sukoshi**（Richmond Centre 等） | 亞系美妝連鎖。Curel ~32.99 | 偏 KR，J 有一些 |
| **Daiso** | 日系家品／文具／低價彩妝 | **文具／小物**，不是 Melano 級藥妝 |
| **MiniSo** | 中國自有品牌為主 | **不是**日版藥妝替代 |
| **Konbiniya**（Robson） | 零食、Pocky、罐裝咖啡 | 不是美妝 |
| **MUJI** | 自有護膚；目錄 `muji-oil` 已註明加拿大店競爭 | 不要低價打 MUJI 有的 SKU |
| **Oomomo／Fujiya** | 華人圈 FB 代購帖點名 | 家品／零食／部分日貨，未核藥妝深度 |
| **Tokyo Life** | 本次**未能獨立打開**一間仍在營運、可核貨架的溫市店 | 跳過，不編造 |

即拿的殺傷力是 **今天晚上要用的 Curel／髮膜**，不是比價表上的 2 刀。預購集運模型在這層永遠輸；只能用「他們沒有的色號／改版／文具／批號」接住願意等一週的人。

### 10. WeChat／Facebook／小紅書 溫市代購（定性）

沒有公開價目表可爬。能核到的公開痕跡：

- Facebook **HKCoupleToVancouver** 帖《日本代購直送加拿大》：問溫市人會去 MUJI／Daiso／Oomomo／Fujiya／Konbiniya／Tokyo Beauty 還是找代購；並寫海關 **GST 約貨值 8%**、先電郵再過一兩日到貨。
- Instagram 有「日本代購｜加拿大現場直送」帳號，自稱做了多年、集運／日本直送。

**定性（與稅務備忘一致，且與上述帖相符）：**

| | |
| --- | --- |
| 速度 | 本地現貨：當日～兩日（朋友倉／家裡紙箱——這是 PE 灰色）。日本／香港行：1–3 週，與 YesStyle 同級 |
| 信任 | 熟人、WhatsApp 語音、朋友圈截圖。出事靠關係，不靠政策 |
| 錢 | 現金、e-transfer、WeChat Pay。**無 CNF、無 GST 登記、無發票** |
| 合規 | 防曬照賣；效期靠「我剛從日本返」一句 |
| JapJapVan 怎麼打 | 不要比誰更熟。要比 **清單、批次照片、退貨地址、不賣會被 Health Canada 查封的 SKU**。價錢跟代購死磕會把毛利打穿（一件一寄已經是負貢獻） |

---

## 可替代性地圖（客人實際會把車讓給誰）

以「溫市華人／亞裔、要日版開架、客單約 CAD 68」為場景。

| 客人要的東西 | 最可能被搶走的對手 | 會不會真的替代 JapJapVan | 怎麼接 |
| --- | --- | --- | --- |
| Melano CC 原裝黃管 | YesStyle／Stylevana 標價；代購；Amazon **改標**（價更高、貨不一樣） | YesStyle **會搶**（標價低 6–9 刀）。Amazon Hoshisu **不應視為同一 SKU** | 不要跟 12 刀。講 JAN、效期、DDP。把 Amazon 改標當反面教材 |
| Fino 230g | Amazon Prime CAD 18；Kiyoko 促銷 11.99；YesStyle ~15.6 換算；Tokyo Beauty 即拿 | **會搶。** 目錄 18 已無價格空間 | 當加購／套裝，不當流量鉤。即拿需求讓給 Tokyo Beauty／Amazon |
| Hada Labo 日版 Premium | YesStyle ~18.7 換算；Kiyoko 26 | YesStyle 搶價；Kiyoko 搶速度／包稅 | 強調日版 vs Hada Labo Tokyo。Kiyoko 26 比目錄 24 貴——這格可打 |
| Curel 40g 面霜 | **Shoppers 29.99**；T&T 34.99；Kiyoko 40；YesStyle ~29 | **2025-09 之後，Shoppers 是真替代。** 稅務備忘「Shoppers 不是同一 SKU」對 Curel **已過時** | 目錄 29 對齊授權價。賣冬天補貨、批號、與化妝水／噴霧套裝，不賣「加拿大買不到」 |
| Canmake／Heroine | YesStyle 換算明顯更低；Kiyoko 睫毛膏 25 還缺貨 | YesStyle 搶價；實體店搶即拿 | 色號／膜型寫清楚。缺貨時預購比亂標強 |
| FriXion／Sarasa | Daiso／Amazon 文具／MUJI；美妝電商基本不做 | **美妝對手幾乎不搶這格** | Year 1 合規避難所（稅務備忘）。當加購拉 AOV |
| Biore Aqua Rich | YesStyle／Stylevana／代購／Amazon 灰 | 需求最強、也是 **不能接的單** | 導去「非防曬護膚＋冬天 Curel」。不要用「到港自取」在 Shopify 上打廣告 |
| 「今晚要用」 | Tokyo Beauty、Shoppers、T&T、代購現貨 | 預購集運 **永遠輸** | 不要假裝 48h 又無 PE。承認 7–21 日，換批次與 DDP |
| 「我要一站買齊韓＋日」 | YesStyle／Stylevana／Kiyoko | 全目錄會輸 | 縮到日版藥妝＋文具，不做 KR 海 |

**購物車層級的誠實排序：** 預購客人在 Melano／Canmake 會先打開 YesStyle；要今晚用 Curel 會去 Shoppers；怕假貨但不趕時間會去 Kiyoko；什麼都要、還要防曬的會去代購。JapJapVan 能穩吃的，是 **知道日版配方、願意等一週、要批號、要文具加購、不要未授權防曬** 的那一小截。

---

## 附錄：比他們冷的事實（YesStyle 理貨員／WeChat 代購系統性不追的）

只寫本次能核到、或與已鎖定備忘一致的。編不出來的「情報」不寫。

1. **萬寧 dm 週 vs 日本改版週。** YesStyle／Stylevana 的 Melano／Fino 是倉儲 SKU，週週有貨、週週同一個 PDP。他們不對香港屈臣氏／萬寧促銷週期或日本藥妝改版週做採購日曆。誰在 dm 出低價的那週進、誰在改版前清舊批號，誰的 COGS 才低過他們的「永遠 in-stock」。本次**沒有**核到某一期萬寧 dm 的具體日期——這條是**要建立的作業**，不是已偷到的時間表。

2. **每件出貨拍 JAN／批號／效期。** Amazon Fino listing 的商業登記在深圳；Melano CAD 27.99 那條公開寫「為北美改標」。代購朋友圈只貼商品圖。YesStyle 不在包裹層給客人批號。這不是行銷，是把「這支是松本清貨架那支」做成可核對的證據。

3. **Amazon.ca 哪條是日版、哪條是美區／改標。** 活頁例子：Hoshisu Melano Essence CC（B0F562GC1J）≠ Rohto Melano CC 藥用黃管；Hada Labo Tokyo ≠ Gokujyun Premium 日版。第三方 ASIN 會把兩者搜在一起。理貨時要對 JAN，不要對英文品名。

4. **Health Canada 會查封哪類 SKU。** 防曬有 SPF／化學濾劑 → NHP（NPN）或非處方藥（DIN）。Biore Aqua Rich、Anessa、Allie、Skin Aqua、Canmake UV：**商業進口／廣告／出售未授權產品違法**。CBC 2024-09-10 *Asian sunscreens are all the rage, so why can't you buy them in Canada?*：部門可發合規信、巡查、**查封**。YesStyle／Stylevana／代購照賣，因為他們賭的是「客人當個人進口」。Shopify 上架是另一回事。目錄防曬約 19% desk GMV——這 19% 不是定價問題，是不能賣。

5. **CPTPP 原產地證明在這客單幾乎無關。** 鎖定事實：非美墨 de minimis **CAD 20**；HS 3304 MFN 常見 6.5%；日本 CPTPP 工業品可 0%，但要 certification of origin，香港不是 CPTPP 成員。基準 AOV CAD 68。做一份 CoO 的時間與關係，在這個客單上省下的關稅常常不夠支付文件成本。YesStyle 不申請 CPTPP；代購不申請。不要把「我有日本產地」寫進 Year 1 售價模型。

6. **預購現金週期 vs 他們的現貨模型。** YesStyle／Stylevana／Amazon／Kiyoko／Shoppers 都是 **先備貨再收款**（或 FBA 壓倉）。JapJapVan 預購是先收款再跟萬寧／日本週採。稅務備忘：基準盤年 COGS ~38k，現貨要壓 6–10 週庫存 ≈ CAD 8k–15k，能吃掉 Year 1 稅後一半。對手的「現貨」看起來比較快，是用現金換的。不要為了像他們一樣快，把預購丟掉——那會同時觸發 PE 誘惑與現金短缺。

7. **溫市願付價格是冬天的 Curel，不是夏天的凝膠。** 目錄 notes 已寫 Curel 是 Vancouver winters staple。Shoppers 2025-09 用 CAD 29.99 授權上架 40g 面霜，等於市場已經公布 WTP。Kiyoko 賣 40 仍有人買「加拿大倉正貨」。夏天 YesStyle 首頁會推 Aqua Rich／韓系防曬；冬天他們不會為溫市濕冷改 Curel 庫存權重。這是一個 **地理×季節** 的 merchandising 事實，全球倉不會為一個城市改。

8. **（額外、已核）YesStyle 對 BC 不是 DDP。** 關稅可事後退店積分；GST／PST **不在**退款範圍；PST 結帳目前只點名薩斯喀徹溫。BC 客人仍會在快遞收到第二張單。把「包稅到溫」寫在標價上，是他們懶得做、你做了就能減少拒收的事。

9. **（額外、已核）文具不在美妝對手的購物車裏。** YesStyle 文具是角色聯名；Stylevana／Jolse 不做 FriXion 5 支裝。稅務備忘：文具相對乾淨、桌上模型毛利約 53%。這不是秘密配方，是品類空白。

---

## 對定價的直接含義（不重打稅）

- 目錄 Melano 21／Fino 18／Canmake 16 **高過** YesStyle／Stylevana 的標價層。這沒有問題——只要售價是 **DDP 一次過**，並且 SKU 是原裝日版。問題是把 21 理解成「已經比對手便宜」。
- Curel 29 現在是 **授權價對齊**，不是平行進口折讓。
- 一件一寄 Melano 會把貢獻打穿（鎖定作業規則）。集運＋預購仍然是生存條件。
- 防曬從正式店拿掉之後，YesStyle 看起來會「比較齊」。接受。用 Curel 冬天、Hada Labo、Melano、文具、頭髮填洞。

---

## 來源

- 本倉庫：`docs/research/_shared-facts.md`；`docs/hk-ca-tax-price-advantage-2026.md`；`src/data/products.ts`（`sellCad`）
- YesStyle PDP／政策（2026-08-20）：Melano pid.1122834023；Fino pid.1126837080；Hada Labo pid.1122621936；Curel pid.1131567184；Canmake pid.1073879287；Heroine pid.1075162835；Biore pid.1122056968；Shipping Rates（表註 2026-08-07）；Customs & Tax hsi.735；Canada PST hsi.2317（僅 Saskatchewan）；The YesStyle Promise hsi.1684
- Stylevana CA（2026-08-20）：https://www.stylevana.com/en_CA/ ；FAQ；Shipping & Delivery（CA$ 68 免運、6–12／3–6 日）；Melano／Fino 首頁快照 URL 見表
- Amazon.ca（2026-08-20）：Fino B00YM1MEJI；Melano B0F562GC1J（Hoshisu 改標）
- Kiyoko.ca（2026-08-20）：Fino、Curel 40g、Hada Labo Premium 170ml、Heroine Volume & Curl
- Shoppers／授權 Curel：Vita Magazine 2025-08-29 *Curél Japanese Skincare Launching Exclusively at Shoppers Drug Mart*；https://www.curel.com/en-ca/ ；Reddit r/CanSkincare `1muz8vi`
- CBC 2024-09-10 *Asian sunscreens are all the rage, so why can't you buy them in Canada?*（https://www.cbc.ca/news/health/asian-sunscreens-canada-1.7317656 ）；Health Canada sunscreen monograph（DIN／NPN）
- Reddit：r/CanSkincare YesStyle 船期 `1pm6zy9`、Stylevana CA `1hr7u6h`、BC YesStyle DHL CAD 36 `1rei8iq`（r/koreanskincare）；r/KoreanBeauty YesStyle 真偽討論 `16gnvzr` `1aj1lvn`
- Jolse：https://jolse.com/shipping_notice.html （DDU、據實申報）
- iHerb：ca.iherb.com Melano CC lotion（非 Essence）
- eBay.ca：Fino 3 件裝等流動 listing
- Facebook HKCoupleToVancouver「日本代購直送加拿大」（GST 約 8%、本地店名單）
- Tokyo Beauty Kerrisdale IG／開箱（家品，非標價）
- FX：Yahoo CAD=X 2026-08-20 ≈ 1.38 USD/CAD

**本次未能載入、故跳過或降級：** Shoppers 官網 PDP（Access Denied）；Stylevana CA 多數單品 HTML 價錢；`japanese-beauty.ca`（無活站）；Tokyo Life 現營溫市店；Jolse 日版籃子 SKU；溫市 WeChat 群的即時報價；CBC 全文（工具 HTTP 失敗，標題與查封表述來自搜尋摘要＋稅務備忘已鎖定引用）。

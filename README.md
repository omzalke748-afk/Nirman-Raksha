# NIRMAN-RAKSHA

### AI-Powered Building Health, Risk Intelligence & Early Warning System for Nagpur
> **“Know the condition. Track the change. Warn before the danger.”**

---

## 🏛️ Project Overview

**NIRMAN-RAKSHA** is a centralized civic infrastructure intelligence platform built specifically for **Nagpur City / Nagpur Municipal Corporation (NMC) jurisdiction**. It continuously monitors structural building health, integrates verifiable public records with licensed field inspections and live environmental telemetry, computes explainable risk indicators, and enables authorized municipal authorities to issue geo-fenced public safety alerts.

---

## 🛡️ Core Features & Capabilities

### 1. Zero Fake Data & Complete Data Provenance
- Every single data point displays its originating legal public source, retrieved timestamp, data status, and confidence score.
- Supported statuses: `VERIFIED`, `OFFICIAL_SOURCE`, `PUBLIC_SOURCE`, `ENGINEER_VERIFIED`, `AUTHORITY_VERIFIED`, `ESTIMATED`, `UNAVAILABLE`, `SYNTHETIC_DEMO`.
- Unavailable fields are honestly presented as *"Data unavailable"* rather than fabricated.
- Synthetic demo records are isolated and clearly labeled `SYNTHETIC DEMO DATA — NOT A REAL BUILDING RECORD`.

### 2. Nagpur-Locked Operating Jurisdiction
- Operating scope strictly locked to **Nagpur Municipal Corporation (10 Administrative Zones)**.
- Autocomplete search includes an instant boundary guard (searches for cities outside Nagpur inform the user that coverage is currently restricted to NMC).

### 3. Continuous Building Health Passport (`/buildings/:id/health-passport`)
- A 12-section medical-style health history for every structure:
  - **Section A:** Identity & Permitted Use
  - **Section B:** Location & Cadastral GIS Data
  - **Section C:** Sanction & Construction History
  - **Section D:** Structural Framing System (RCC vs Load Bearing Masonry)
  - **Section E:** Official Municipal Gazette Status (NMC Section 264 / 265 / 268)
  - **Section F:** Inspection & Remedial Triage
  - **Section G:** Chronological Medical Event Timeline
  - **Section H:** Structural Defect & NDT Observations
  - **Section I:** Maintenance & Retrofitting Ledger
  - **Section J:** NIRMAN AI Analyst (Decision Support)
  - **Section K:** Active Public Safety Alerts
  - **Section L:** Complete Data Provenance Audit Trail

### 4. Explainable Prototype Risk Engine & "What Changed?" Analytics
- **Transparent Weighted Scoring:** Labeled *“Prototype Building Risk Indicator”* (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`, `INSUFFICIENT_DATA`).
- Strictly avoids misleading claims: **Never claims to predict exact collapse timing or collapse probability percentage**.
- Generates positive and negative factor breakdowns (+ Severe crack at plinth, + Repeated seepage, - Past retrofitting).
- **"What Changed?" Engine:** Automatically analyzes differentials between the latest inspection and prior baseline.

### 5. NIRMAN AI Analyst
- Embedded conversational decision-support assistant inside building profiles.
- Pre-built quick queries: *"Why was this building flagged?"*, *"What changed since previous inspection?"*, *"What information is missing?"*, *"What should be checked next?"*.
- Grounded exclusively in verified stored records with civic safety disclaimers.

### 6. Interactive GIS Risk Map (`/risk-map`)
- High-fidelity Leaflet map centered on Nagpur (21.1458° N, 79.0882° E).
- Custom color-coded markers by risk level.
- Official NMC Section 264 Dilapidated Building Layer toggle.
- Geo-fenced safety alert cordon radii (100m, 200m, 500m) with pulsing radar visual effects.

### 7. Authorized Early Warning System (`/authority`, `/authority/alerts/create`, `/alerts`)
- **Strict Human-in-the-Loop Protocol:** No public alert is broadcast purely from an AI score.
  `Flagged Building → Qualified Engineer Review → Authority Verification → Issue Alert → Geo-Fenced Broadcast → Public Safety Action → Post-Retrofit Resolution`.
- Lifecycle States: `DRAFT` → `UNDER_REVIEW` → `VERIFIED` → `PUBLISHED` → `ACTIVE` → `RESOLVED`.
- Broadcast Simulation: Delivery tracking for citizen in-app popups, simulated SMS, and web push notifications.

### 8. Real-Time Data Sources & Transparency Manager (`/data-sources`)
- Connectors to:
  - **Open-Meteo Live Nagpur Meteorological API** (Polled live: Temperature, Relative Humidity, Rainfall 24h & 7d, Soil Saturation).
  - **NMC Dangerous & Dilapidated Gazette** (Official municipal register under Section 264).
  - **MRSAC Maharashtra Geospatial Layer** (VNIT Campus, Nagpur).
  - **GSDA Nagpur Hydrogeology & Aquifer Depth Bulletin**.
  - **CPCB / MPCB Ambient Air Quality Station**.
  - **NMC Licensed Structural Engineers Assessment Network**.
- Interactive `[Refresh Now]` buttons that execute live network fetches and inspect raw JSON payloads.

### 9. Report Studio (`/reports`)
- Generates printable/exportable PDF documents formatted with official NMC headers, QR verification tags, mathematical risk factor tables, timeline ledgers, and statutory disclaimers.

### 10. Interactive 17-Step Ideathon Demo Tourbar
- Built-in floating guided tourbar that takes judges seamlessly from **Step 1 (Open Dashboard)** to **Step 17 (Review Complete Passport History)** with one-click action triggers.

---

## 🚀 Running the Application Locally

The project is built with React 19, TypeScript, Vite, Tailwind CSS, Leaflet, and Lucide React.

```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev

# 3. Open in your browser
http://localhost:5173/
```

---

## 🏛️ Nagpur Administrative Zones Covered

| Zone # | Zone Name | Office Location |
| :--- | :--- | :--- |
| **Zone 1** | Laxmi Nagar | Water Tank Square, Laxmi Nagar |
| **Zone 2** | Dharampeth | WHC Road, Dharampeth |
| **Zone 3** | Hanuman Nagar | Medical Square, Hanuman Nagar |
| **Zone 4** | Dhantoli | Yashwant Stadium, Dhantoli |
| **Zone 5** | Nehru Nagar | Nandanvan Road, Nehru Nagar |
| **Zone 6** | Gandhibagh | Mahal Road, Gandhibagh |
| **Zone 7** | Satranjipura | Itwari Road, Satranjipura |
| **Zone 8** | Lakadganj | CA Road, Lakadganj |
| **Zone 9** | Ashi Nagar | Kamptee Road, Ashi Nagar |
| **Zone 10**| Mangalwari | Sadar Bazar, Mangalwari |

---

## ⚖️ Statutory Disclaimer

> **NIRMAN-RAKSHA** is an AI-assisted decision-support and building information platform designed for Nagpur Municipal Corporation jurisdiction. Risk indicators do NOT constitute structural safety certification and do NOT predict exact collapse timing. All safety decisions require physical inspection by qualified structural engineers and authorized municipal authorities.

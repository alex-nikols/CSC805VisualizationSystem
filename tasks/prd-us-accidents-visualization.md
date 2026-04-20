# PRD: US Accidents Data Visualization Website

## Introduction

Build an interactive data visualization website for exploring US traffic accident data (2016-2023) using React + Vite. The site visualizes ~1.76 million accident records from the US_Accidents_Full2022 dataset, helping users (government departments, researchers, the public) identify high-risk areas, understand accident patterns, and explore contributing factors like weather and road features.

This is Phase 3 of the CSC 805 course project at SFSU. The dataset is pre-split into 4 CSV files. A Python preprocessing pipeline will aggregate data into static JSON files consumed by the frontend — no backend server required.

## Goals

- Pre-process ~1.76M CSV records into lightweight JSON summaries for fast frontend loading
- Implement two main views: **Explorer** (interactive map) and **Analytics** (dashboard with charts)
- Use D3.js for all data visualizations
- Use Leaflet.js + OpenStreetMap for the interactive map
- Use Tailwind CSS for styling, matching the Figma designs in `figma/`
- Keep code simple, well-structured, and easy to understand
- App runs locally via `npm run dev`

## User Stories

### US-001: Data Preprocessing Pipeline
**Description:** As a developer, I need a preprocessing script that converts the raw CSV files into aggregated JSON files so the frontend can load data quickly without parsing millions of rows.

**Acceptance Criteria:**
- [ ] Python script reads all 4 CSV files from `US_Accidents_Full2022_parts/`
- [ ] Generates the following JSON files in `public/data/`:
  - `summary.json` — total accidents, avg danger score, most dangerous county, peak hour
  - `by_year.json` — accident counts grouped by year (2016-2023)
  - `by_severity.json` — accident counts grouped by severity level (1-4)
  - `by_month.json` — accident counts aggregated by month across all years
  - `by_county_danger.json` — top counties ranked by danger score formula: `(S1*N1 + S2*N2 + S3*N3 + S4*N4) / T`
  - `by_weather.json` — weather condition distribution (visibility, wind speed, precipitation buckets)
  - `by_day_hour.json` — accident counts grouped by day-of-week and hour-of-day (7x24 matrix)
  - `by_state.json` — accident counts and danger scores per state
  - `accidents_sample.json` — sampled subset (~10K-50K records) with lat/lng, severity, date, weather for map markers
- [ ] Script runs successfully: `python preprocess.py`
- [ ] All output JSON files are under 5MB each for fast loading

### US-002: Project Scaffolding & Navigation
**Description:** As a user, I want a top navigation bar to switch between Explorer, Analytics, and About pages so I can access different views of the data.

**Acceptance Criteria:**
- [ ] React + Vite project initialized with Tailwind CSS
- [ ] Top nav bar with site title "US Accidents Visualization" and subtitle "CSC 805 Data Visualization Project"
- [ ] Navigation links: Explorer, Analytics, About
- [ ] Active page is visually highlighted (Analytics button filled dark, others outline)
- [ ] React Router handles page switching without full reload
- [ ] Layout matches Figma header design
- [ ] Verify in browser using dev-browser skill

### US-003: Analytics Dashboard — KPI Summary Cards
**Description:** As a user, I want to see key statistics at a glance (total accidents, avg danger score, most dangerous county, peak hour) so I can quickly understand the overall picture.

**Acceptance Criteria:**
- [ ] 4 cards in a horizontal row at top of Analytics page
- [ ] Each card shows: icon, label, value, and subtitle
  - Total Accidents (e.g., "7.7M", subtitle "2016-2023 cumulative")
  - Avg Danger Score (e.g., "4.2", subtitle "Weighted severity metric")
  - Most Dangerous (e.g., "LA County", subtitle "Score: 8.4 (Critical)")
  - Peak Hour (e.g., "5-6 PM", subtitle "Friday rush hour")
- [ ] Data loaded from `summary.json`
- [ ] Cards are responsive and match Figma design
- [ ] Verify in browser using dev-browser skill

### US-004: Analytics Dashboard — Accidents Over Time (Bar Chart)
**Description:** As a user, I want to see a bar chart of yearly accident counts so I can understand the trend over time.

**Acceptance Criteria:**
- [ ] D3.js bar chart showing accident counts per year (2016-2023)
- [ ] Y-axis shows count (0 to max), X-axis shows years
- [ ] Bars are blue/steel color matching Figma
- [ ] Growth badge in top-right corner (e.g., "+104% growth")
- [ ] Chart title: "Accidents Over Time" with subtitle "Yearly trend 2016-2023"
- [ ] Data loaded from `by_year.json`
- [ ] Verify in browser using dev-browser skill

### US-005: Analytics Dashboard — Severity Distribution (Donut Chart)
**Description:** As a user, I want to see a donut chart showing the distribution of accident severity levels so I can understand how severe accidents typically are.

**Acceptance Criteria:**
- [ ] D3.js donut chart with 4 segments: S1 Minor (green), S2 Moderate (yellow/orange), S3 Serious (orange/red), S4 Fatal (dark red)
- [ ] Legend below chart showing label, color, and percentage for each severity
- [ ] Chart title: "Severity Distribution" with subtitle "Across all recorded accidents"
- [ ] Data loaded from `by_severity.json`
- [ ] Verify in browser using dev-browser skill

### US-006: Analytics Dashboard — Top 10 Counties by Danger Score
**Description:** As a user, I want to see a ranked list of the most dangerous counties so I can identify high-risk areas.

**Acceptance Criteria:**
- [ ] Ranked list (1-10) showing county name + state abbreviation
- [ ] Horizontal red bar proportional to danger score
- [ ] Danger score value displayed to the right of the bar
- [ ] External link icon next to each score (can link to Explorer view in future)
- [ ] Chart title: "Top 10 Counties by Danger Score" with subtitle "Click to view on map"
- [ ] Data loaded from `by_county_danger.json`
- [ ] Verify in browser using dev-browser skill

### US-007: Analytics Dashboard — Weather Conditions
**Description:** As a user, I want to see how weather conditions correlate with accidents so I can understand environmental risk factors.

**Acceptance Criteria:**
- [ ] Horizontal bar chart with 3 categories: Visibility, Wind Speed, Precipitation
- [ ] Each bar shows count and percentage
- [ ] Color-coded bars (teal for visibility, blue for wind, dark blue for precipitation)
- [ ] Chart title: "Weather Conditions" with subtitle "Accident distribution by weather at time of incident"
- [ ] Data loaded from `by_weather.json`
- [ ] Verify in browser using dev-browser skill

### US-008: Analytics Dashboard — Accident Heatmap by Day & Hour
**Description:** As a user, I want to see a heatmap of when accidents occur (day of week vs hour) so I can identify peak accident times.

**Acceptance Criteria:**
- [ ] D3.js heatmap grid: 7 rows (Mon-Sun) x 24 columns (12a to 11p)
- [ ] Color scale from light yellow (fewer) to dark red/orange (more)
- [ ] Legend showing color scale (Less to More)
- [ ] Chart title: "Accident Heatmap by Day & Hour" with subtitle "Intensity shows accident density"
- [ ] Data loaded from `by_day_hour.json`
- [ ] Verify in browser using dev-browser skill

### US-009: Analytics Dashboard — Monthly Accident Trend (Line Chart)
**Description:** As a user, I want to see monthly accident trends aggregated across all years to identify seasonal patterns.

**Acceptance Criteria:**
- [ ] D3.js line/area chart showing accident count per month (Jan-Dec)
- [ ] Light blue area fill under the line
- [ ] Peak month annotated with badge (e.g., "Peak: December")
- [ ] X-axis: month names, Y-axis: accident count
- [ ] Chart title: "Monthly Accident Trend" with subtitle "Aggregated across all years — seasonal patterns"
- [ ] Data loaded from `by_month.json`
- [ ] Verify in browser using dev-browser skill

### US-010: Explorer Page — Interactive Map
**Description:** As a user, I want an interactive map showing accident locations so I can visually explore where accidents occur.

**Acceptance Criteria:**
- [ ] Leaflet.js map with OpenStreetMap tiles, full-width layout
- [ ] Accident markers displayed using sampled data from `accidents_sample.json`
- [ ] Marker clustering using Leaflet.markercluster plugin (clusters at low zoom, individual markers at high zoom)
- [ ] Marker size/color reflects severity level
- [ ] Map is pannable and zoomable
- [ ] Verify in browser using dev-browser skill

### US-011: Explorer Page — Filter Sidebar (Left)
**Description:** As a user, I want filters on the left side of the map so I can narrow down accidents by date range, severity, and weather conditions.

**Acceptance Criteria:**
- [ ] Left sidebar with "Filters" header and collapse toggle
- [ ] Date Range filter: start date and end date pickers
- [ ] Severity filter: checkboxes for severity levels 1-4
- [ ] Weather Condition filter: checkboxes for common conditions (Clear, Rain, Fog, Snow, etc.)
- [ ] Filters update the displayed map markers
- [ ] Matches Figma Explorer page layout
- [ ] Verify in browser using dev-browser skill

### US-012: Explorer Page — Accident Detail Panel (Right)
**Description:** As a user, I want to click on an accident marker and see its details in a right-side panel so I can learn about specific incidents.

**Acceptance Criteria:**
- [ ] Clicking a marker opens a right panel showing:
  - Accident Details header
  - Date & Time of accident
  - Accident Information: Severity, Distance, Description
  - Weather: Temperature, Humidity, Visibility, Wind Speed
- [ ] Panel shows "Click on an accident marker to view details" when no marker is selected
- [ ] Panel can be closed
- [ ] Matches Figma `explorer_selected.png` layout
- [ ] Verify in browser using dev-browser skill

### US-013: Explorer Page — Timeline Slider
**Description:** As a user, I want a timeline slider at the bottom of the map so I can scrub through time and see how accidents change over different periods.

**Acceptance Criteria:**
- [ ] Horizontal slider at bottom of map area
- [ ] Shows date range (start and end labels)
- [ ] Dragging the slider filters map markers by date
- [ ] Matches Figma Explorer page bottom bar
- [ ] Verify in browser using dev-browser skill

### US-014: About Page
**Description:** As a user, I want an About page explaining the project, data sources, and team members.

**Acceptance Criteria:**
- [ ] Project description and purpose
- [ ] Dataset citation and source links
- [ ] Team member names: Alexander Nikols, Zoe Long, Andra Bhargav Teja
- [ ] Course info: CSC 805, SFSU
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Python preprocessing script reads CSV files and outputs aggregated JSON files to `public/data/`
- FR-2: Frontend loads only pre-aggregated JSON — never parses raw CSV
- FR-3: Navigation bar allows switching between Explorer, Analytics, and About pages
- FR-4: Analytics page renders all 6 visualization components (bar chart, donut chart, county ranking, weather bars, heatmap, line chart) plus KPI cards
- FR-5: All charts are built with D3.js (no Recharts/Chart.js)
- FR-6: Explorer page renders a Leaflet.js map with OpenStreetMap tiles
- FR-7: Map displays clustered accident markers from sampled data
- FR-8: Left sidebar filters update which markers are displayed on the map
- FR-9: Clicking a marker shows accident details in the right panel
- FR-10: Timeline slider filters markers by date range
- FR-11: Danger score formula: `(S1*N1 + S2*N2 + S3*N3 + S4*N4) / T`
- FR-12: App runs locally via `npm run dev` with no backend dependencies

## Non-Goals (Out of Scope for Phase 3)

- No backend server or database — all data is static JSON
- No user authentication or accounts
- No real-time data updates or live data fetching
- No deployment to production (local dev only)
- No unit/integration tests (Phase 3 focus is on implementation)
- No advanced map features like route visualization or street-level view
- No data editing or CRUD operations
- No mobile-optimized responsive design (desktop-first)

## Design Considerations

- **Figma designs** are in `figma/` directory — follow these as the visual reference:
  - `explorer.png` — Explorer page with map, left filters, right summary
  - `explorer_selected.png` — Explorer page with selected accident detail panel
  - `analytics.png` — Analytics dashboard with all charts and KPI cards
- **Color palette**: Dark gray header, white cards, blue bars, orange/red severity colors, teal/blue weather bars
- **Typography**: Clean sans-serif, large bold numbers for KPIs
- **Card-based layout**: Each chart wrapped in a white card with subtle shadow/border

## Technical Considerations

- **Data size**: ~1.76M rows across 4 CSVs. Must pre-aggregate — frontend should never load raw CSV data
- **Preprocessing**: Python script using pandas for efficient CSV aggregation
- **Map performance**: Use marker clustering and sampled data (~10K-50K points) to keep the map responsive
- **D3.js integration with React**: Use `useRef` + `useEffect` pattern to let D3 manage DOM within React components
- **File structure**:
  ```
  /
  ├── preprocess.py              # Data preprocessing script
  ├── public/data/               # Generated JSON files
  ├── src/
  │   ├── components/
  │   │   ├── layout/            # Navbar, Layout
  │   │   ├── analytics/         # Dashboard chart components
  │   │   ├── explorer/          # Map, filters, detail panel
  │   │   └── common/            # Shared components (cards, etc.)
  │   ├── pages/                 # Explorer, Analytics, About pages
  │   ├── App.jsx
  │   └── main.jsx
  ├── index.html
  ├── tailwind.config.js
  └── vite.config.js
  ```
- **Dependencies**: react, react-router-dom, d3, leaflet, leaflet.markercluster, tailwindcss

## Success Metrics

- App loads Analytics dashboard in under 3 seconds
- All 6 Analytics charts render correctly with real data
- Explorer map displays clustered markers and responds to filter changes
- Code is clean and well-organized — a teammate can understand the structure quickly
- Matches Figma designs closely
- Runs successfully with `npm run dev`

## Open Questions

- How many sample points should be loaded for the Explorer map? (10K vs 50K — tradeoff between detail and performance)
   load it by chunk or only load it while necessary. Make a loading page or feature so people know we are loading data.
- Should the Explorer page default to a specific region (e.g., zoomed into a high-risk area) or show the full US?
    zoomed into SF y default
- Should the About page include the danger score formula explanation?
    yes
- Will Phase 4 add more interactivity (e.g., clicking a county in Analytics navigates to Explorer filtered to that county)?
    you can do that

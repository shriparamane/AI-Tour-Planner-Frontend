# AI Tour Planner — Frontend

An Angular 21 single-page application that lets Indian travellers discover international trip itineraries within their INR budget, with server-side pagination, autocomplete restricted to Indian cities, and a detailed day-by-day itinerary view.

## Tech Stack

- **Framework:** Angular 21 (standalone components)
- **UI Library:** Angular Material 21
- **Charts:** Chart.js + ng2-charts
- **Animations:** Angular Animations
- **City Search:** [Photon API](https://photon.komoot.io) (filtered to India)
- **Change Detection:** OnPush

## Project Structure

```
src/app/
├── components/
│   ├── trip-planner/
│   │   ├── trip-planner.component.ts    # Main search + results + pagination
│   │   └── trip-planner.component.html  # Template
│   └── plan-card/
│       ├── plan-card.component.ts       # Individual destination card
│       └── plan-card.component.html
├── services/
│   ├── itinerary.service.ts             # Backend API calls (no-cache headers)
│   └── geocoding.service.ts             # City autocomplete (India-only)
└── models/
    └── trip.models.ts                   # TypeScript interfaces
```

## Features

- **India-only departure city** — Autocomplete powered by Photon API, filtered to Indian cities only. Non-Indian cities yield no suggestions.
- **INR budget** — Budget input and all displayed costs are in Indian Rupees (₹).
- **Server-side pagination** — Up to 50 results returned, displayed 6/9/12 per page (configurable). Page and page size are sent to the backend on every request.
- **No API caching** — Every search sends fresh `Cache-Control: no-cache` headers.
- **Destination cards** — Show total cost, budget breakdown (flights, hotel, food), visa type, rating, highlights, and flight duration.
- **Detail modal** — Four tabs: Overview (description, visa, weather, language, attractions, travel tip), Day-by-Day itinerary, Budget breakdown with visual bars, and Gallery.
- **Animations** — Fade-in and staggered list animations on results.

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Angular CLI 21](https://angular.dev/tools/cli)

```bash
npm install -g @angular/cli
```

### Install & Run

```bash
cd AI-Tour-Planner-Frontend
npm install
ng serve
```

App runs at `http://localhost:4200`.

> The backend must be running on `http://localhost:5011` before searching.

### Build

```bash
ng build
```

Output is in `dist/`.

### Run Tests

```bash
ng test   # unit tests (Vitest)
ng e2e    # end-to-end tests
```

## Configuration

### Backend URL

Update the API base URL in `src/app/services/itinerary.service.ts`:

```typescript
private apiUrl = 'http://localhost:5011/api';
```

### INR Exchange Rate

The exchange rate is managed on the backend (`InrPerUsd = 83.0` in `ItineraryPlannerService.cs`). The frontend displays whatever values the backend returns — no conversion is done on the client.

### Pagination

Default page size is `9`. Supported values: `6`, `9`, `12` — selectable via the dropdown in the pagination bar.

## Search Rules

| Field | Description |
|---|---|
| Departure city | Indian cities only — enforced by autocomplete + backend validation |
| Budget | Minimum ₹10,000, entered in INR |
| Trip type | International / Both (`Domestic` returns no results — no Indian domestic destinations in the dataset) |
| Dates | Departure and return date are both required |

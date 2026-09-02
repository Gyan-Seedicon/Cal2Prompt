# Cal2Prompt

Multi-product Google Sheets content calendar scraper and prompt generator for GTM & social media workflows.

## Features
- **Multi-Product Sheet Sync**: Reads Google Sheets content calendars across multiple product spreadsheets without maintaining a persistent database.
- **Dynamic Header & Tab Resolution**: Resilient parser that detects repeated headers, column variations, and handles date normalization.
- **Interactive Inspection Drawer**: Slide-over panel with full post details (hooks, visual directions, captions, hashtags, CTAs, and KPIs).
- **Customizable Export Checklist**: Toggle individual sections to include in the generated Markdown or copy AI image generation prompts directly.
- **Custom Calendar Date Picker**: Clean, modern date selector with month/year navigation and quick presets.
- **Mock Mode Fallback**: Automatically provides realistic mock data when credentials are not configured.

## Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS, DM Sans typography, square-rounded shadow design
- **API Integration**: Google Sheets API v4 (JWT Service Account Auth)
- **Icons**: Lucide React

## Setup & Configuration

1. **Clone repository & install dependencies**:
   ```bash
   git clone https://github.com/Gyan-Seedicon/Cal2Prompt.git
   cd Cal2Prompt
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Google Cloud Service Account credentials and Spreadsheet IDs:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEETS_CONFIG='[{"productName":"Allbuddy","spreadsheetId":"your_spreadsheet_id","tabName":"weekly calendar"}]'
   USE_MOCK_SHEETS=false
   ```

3. **Run locally**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

# ScienceMap Benelux

An interactive web application to visualize scientific publications across the Benelux region (Belgium, Netherlands, Luxembourg) using an interactive map interface.

## Features

- **Interactive Benelux Map**: Click on institutions to view their publications
- **Publication Browser**: View and filter publications by keywords
- **Keyword Expansion**: Click on keywords (sample types, enzymes, instruments) to filter results
- **Institution Details**: View statistics and metadata for selected institutions
- **Dataset Overview**: Global statistics across all loaded data

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/           # React components
│   ├── BeneluxMap.tsx   # Interactive map component
│   ├── PublicationBrowser.tsx  # Publication list/detail view
│   └── FileUpload.tsx   # Excel file upload interface
├── context/             # React Context for state management
│   └── DataContext.tsx
├── utils/               # Utility functions
│   └── dataLoader.ts    # Excel file parsing and data processing
├── App.tsx              # Main application component
├── main.tsx             # Entry point
└── index.css            # Global styles with Tailwind CSS
```

## Data Format

The application expects two Excel files:

### Publications File
Columns needed:
- `pmid`: PubMed ID
- `title`: Publication title
- `authors`: Author list
- `Last Author`: Last author name
- `year`: Publication year
- `journal`: Journal name
- `summary`: Publication summary
- `Last author city`: City of last author affiliation
- `Last author institute`: Institution name
- `Last author country`: Country code (NL, BE, LU)
- `sample type`: Sample type used (optional)
- `enzymes`: Enzymes used (optional)
- `instrument`: Equipment used (optional)

### Accounts File
Columns needed:
- `Account`: Institution/Company name
- `Postal Code`: Zip code
- `City`: City name
- `Country`: Country code

## Technologies Used

- **React** 18 + TypeScript
- **Leaflet** for map rendering
- **Tailwind CSS** for styling
- **XLSX** for Excel file parsing
- **Lucide React** for icons
- **Vite** for build tooling

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Chromium 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## License

MIT

## Author

Created with GitHub Copilot

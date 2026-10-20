import React, { useState } from 'react';

export interface FilterOptions {
  regions: string[];
  portfolios: string[];
}

interface FilterPanelProps {
  onFiltersChange: (filters: FilterOptions) => void;
}

const DUTCH_PROVINCES: Record<string, string[]> = {
  'North Holland': ['Amsterdam', 'Haarlem', 'Alkmaar', 'Enkhuizen', 'Hoofddorp', 'Landsmeer', 'Naarden', 'Zaventem'],
  'South Holland': ['Rotterdam', 'Den Haag', 'Leiden', 'Delft', 'Dordrecht', 'Gouda', 'Leiderdorp', 'Oegstgeest', 'Rijswijk', 'Waddinxveen', 'Zoetermeer', 'Voorburg', 'Delfgauw', 'Nieuw Vennep', 'Badhoevedorp'],
  'Utrecht': ['Utrecht', 'Amersfoort', 'Bilthoven', 'Bunnik', 'Houten', 'Maarssen', 'Nieuwegein', 'Veenendaal', 'Zeist', 'Ijsselstein'],
  'Flevoland': ['Almere', 'Lelystad', 'Zevenhuizen'],
  'Gelderland': ['Nijmegen', 'Arnhem', 'Wageningen', 'Ede', 'Deventer', 'Harderwijk', 'Duiven', 'Huissen', 'Wijchen', 'Beuningen', 'Beek-Ubbergen', 'Heumen', 'Boven Leeuwen'],
  'North Brabant': ['Breda', 'Eindhoven', 'Tilburg', "'s Hertogenbosch", 'Den Bosch', "'s-Hertogenbosch", 'Oss', 'Enschede', 'Venlo', 'Son', 'Best', 'Veldhoven', 'Vught', 'Oosterhout', 'Made', 'Nunhem', 'Boxmeer', 'Horst'],
  'Limburg': ['Maastricht', 'Geleen', 'Kerkrade'],
  'Overijssel': ['Enschede', 'Zwolle', 'Deventer', 'Hengelo', 'Drachten', 'Tynaarlo', 'Joure', 'Bolsward'],
  'Friesland': ['Bolsward', 'Enkhuizen', 'Joure'],
  'Groningen': ['Groningen', 'Assen', 'Emmen'],
  'Drenthe': ['Assen', 'Emmen', 'Tynaarlo'],
};

const ALL_REGIONS = [
  'Belgium',
  'Luxembourg',
  ...Object.keys(DUTCH_PROVINCES).sort(),
];

const PORTFOLIOS = [
  'Sample Prep',
  'Cell Separation',
  'Cell Culture',
  'Cell Analysis',
  'Imaging',
  'Clinical',
];

const FilterPanel: React.FC<FilterPanelProps> = ({ onFiltersChange }) => {
  const [selectedRegions, setSelectedRegions] = useState<string[]>(ALL_REGIONS);
  const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>(PORTFOLIOS);

  const handleRegionChange = (region: string) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter(r => r !== region)
      : [...selectedRegions, region];
    setSelectedRegions(newRegions);
    onFiltersChange({ regions: newRegions, portfolios: selectedPortfolios });
  };

  const handlePortfolioChange = (portfolio: string) => {
    const newPortfolios = selectedPortfolios.includes(portfolio)
      ? selectedPortfolios.filter(p => p !== portfolio)
      : [...selectedPortfolios, portfolio];
    setSelectedPortfolios(newPortfolios);
    onFiltersChange({ regions: selectedRegions, portfolios: newPortfolios });
  };

  const handleSelectAllRegions = () => {
    if (selectedRegions.length === ALL_REGIONS.length) {
      setSelectedRegions([]);
      onFiltersChange({ regions: [], portfolios: selectedPortfolios });
    } else {
      setSelectedRegions(ALL_REGIONS);
      onFiltersChange({ regions: ALL_REGIONS, portfolios: selectedPortfolios });
    }
  };

  const handleSelectAllPortfolios = () => {
    if (selectedPortfolios.length === PORTFOLIOS.length) {
      setSelectedPortfolios([]);
      onFiltersChange({ regions: selectedRegions, portfolios: [] });
    } else {
      setSelectedPortfolios(PORTFOLIOS);
      onFiltersChange({ regions: selectedRegions, portfolios: PORTFOLIOS });
    }
  };

  return (
    <div
      style={{
        width: '280px',
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderRight: '1px solid #e5e7eb',
        padding: '24px',
        overflowY: 'auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <h1 style={{ 
        margin: '0 0 32px 0', 
        fontSize: '24px', 
        fontWeight: '700',
        color: '#111827',
        letterSpacing: '-0.5px'
      }}>
        ScienceMap
      </h1>

      {/* Regions Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          margin: '0 0 14px 0', 
          fontSize: '13px', 
          fontWeight: '600',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          🌍 Regions
        </h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
            <input
              type="checkbox"
              checked={selectedRegions.length === ALL_REGIONS.length}
              onChange={handleSelectAllRegions}
              style={{ 
                cursor: 'pointer',
                width: '16px',
                height: '16px',
                accentColor: '#ea580c'
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>Select All</span>
          </label>
        </div>
        {ALL_REGIONS.map((region: string) => (
          <label
            key={region}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px', marginBottom: '10px' }}
          >
            <input
              type="checkbox"
              checked={selectedRegions.includes(region)}
              onChange={() => handleRegionChange(region)}
              style={{ 
                cursor: 'pointer',
                width: '16px',
                height: '16px',
                accentColor: '#ea580c'
              }}
            />
            <span style={{ fontSize: '13px', color: '#4b5563' }}>{region}</span>
          </label>
        ))}
      </div>

      {/* Portfolios Section */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          margin: '0 0 14px 0', 
          fontSize: '13px', 
          fontWeight: '600',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          📊 Portfolios
        </h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
            <input
              type="checkbox"
              checked={selectedPortfolios.length === PORTFOLIOS.length}
              onChange={handleSelectAllPortfolios}
              style={{ 
                cursor: 'pointer',
                width: '16px',
                height: '16px',
                accentColor: '#ea580c'
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>Select All</span>
          </label>
        </div>
        {PORTFOLIOS.map((portfolio) => (
          <label
            key={portfolio}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px', marginBottom: '10px' }}
          >
            <input
              type="checkbox"
              checked={selectedPortfolios.includes(portfolio)}
              onChange={() => handlePortfolioChange(portfolio)}
              style={{ 
                cursor: 'pointer',
                width: '16px',
                height: '16px',
                accentColor: '#ea580c'
              }}
            />
            <span style={{ fontSize: '13px', color: '#4b5563' }}>{portfolio}</span>
          </label>
        ))}
      </div>

      {/* Color Legend */}
      <div style={{
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          margin: '0 0 14px 0', 
          fontSize: '13px', 
          fontWeight: '600',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          📈 Publication Count
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { color: '#3b82f6', label: '< 10' },
            { color: '#eab308', label: '10-20' },
            { color: '#ea580c', label: '20-50' },
            { color: '#dc2626', label: '> 50' }
          ].map(({ color, label }) => (
            <div key={color} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: color,
                border: '1px solid rgba(0,0,0,0.1)'
              }} />
              <span style={{ fontSize: '12px', color: '#6b7280' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;


import React, { useState } from 'react';

export interface FilterOptions {
  territories: string[];
  portfolios: string[];
}

interface FilterPanelProps {
  onFiltersChange: (filters: FilterOptions) => void;
}

const TERRITORY_STRUCTURE: Record<string, string[]> = {
  'Belgium/Lux': ['N101', 'N102', 'N106', 'N109'],
  'the Netherlands': ['N103', 'N104', 'N108', 'N110'],
};

const PORTFOLIOS = [
  'Sample Prep',
  'Cell Separation',
  'Cell Culture',
  'Cell Analysis',
  'Imaging',
  'Clinical',
];

const FilterPanel: React.FC<FilterPanelProps> = ({ onFiltersChange }) => {
  const [expandedCountry, setExpandedCountry] = useState<string | null>('Belgium/Lux');
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>(['N101', 'N102', 'N106', 'N109', 'N101', 'N103', 'N104', 'N108', 'N110']);
  const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>(PORTFOLIOS);

  const handleTerritoryChange = (territory: string) => {
    const newTerritories = selectedTerritories.includes(territory)
      ? selectedTerritories.filter(t => t !== territory)
      : [...selectedTerritories, territory];
    setSelectedTerritories(newTerritories);
    onFiltersChange({ territories: newTerritories, portfolios: selectedPortfolios });
  };

  const handleSelectAllTerritories = (country: string) => {
    const countryTerritories = TERRITORY_STRUCTURE[country];
    const allSelected = countryTerritories.every(t => selectedTerritories.includes(t));
    
    if (allSelected) {
      const newTerritories = selectedTerritories.filter(t => !countryTerritories.includes(t));
      setSelectedTerritories(newTerritories);
      onFiltersChange({ territories: newTerritories, portfolios: selectedPortfolios });
    } else {
      const newTerritories = [...selectedTerritories, ...countryTerritories.filter(t => !selectedTerritories.includes(t))];
      setSelectedTerritories(newTerritories);
      onFiltersChange({ territories: newTerritories, portfolios: selectedPortfolios });
    }
  };

  const handlePortfolioChange = (portfolio: string) => {
    const newPortfolios = selectedPortfolios.includes(portfolio)
      ? selectedPortfolios.filter(p => p !== portfolio)
      : [...selectedPortfolios, portfolio];
    setSelectedPortfolios(newPortfolios);
    onFiltersChange({ territories: selectedTerritories, portfolios: newPortfolios });
  };

  const handleSelectAllPortfolios = () => {
    if (selectedPortfolios.length === PORTFOLIOS.length) {
      setSelectedPortfolios([]);
      onFiltersChange({ territories: selectedTerritories, portfolios: [] });
    } else {
      setSelectedPortfolios(PORTFOLIOS);
      onFiltersChange({ territories: selectedTerritories, portfolios: PORTFOLIOS });
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

      {/* Territory Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          margin: '0 0 14px 0', 
          fontSize: '13px', 
          fontWeight: '600',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          🗺️ Territory
        </h3>
        
        {Object.entries(TERRITORY_STRUCTURE).map(([country, territories]) => {
          const isExpanded = expandedCountry === country;
          const allSelected = territories.every(t => selectedTerritories.includes(t));
          
          return (
            <div key={country} style={{ marginBottom: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  backgroundColor: isExpanded ? '#f3f4f6' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => setExpandedCountry(isExpanded ? null : country)}
              >
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {isExpanded ? '▼' : '▶'}
                </span>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: '8px',
                    flex: 1,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => handleSelectAllTerritories(country)}
                    style={{ 
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                      accentColor: '#ea580c'
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>{country}</span>
                </label>
              </div>
              
              {isExpanded && (
                <div style={{ paddingLeft: '24px', marginTop: '8px' }}>
                  {territories.map((territory) => (
                    <label
                      key={territory}
                      style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px', marginBottom: '8px' }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTerritories.includes(territory)}
                        onChange={() => handleTerritoryChange(territory)}
                        style={{ 
                          cursor: 'pointer',
                          width: '16px',
                          height: '16px',
                          accentColor: '#ea580c'
                        }}
                      />
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>{territory}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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


import React, { useState } from 'react';

export interface FilterOptions {
  regions: string[];
  portfolios: string[];
}

interface FilterPanelProps {
  onFiltersChange: (filters: FilterOptions) => void;
}

const REGIONS = [
  'Netherlands',
  'Belgium',
  'Luxembourg',
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
  const [selectedRegions, setSelectedRegions] = useState<string[]>(REGIONS);
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
    if (selectedRegions.length === REGIONS.length) {
      setSelectedRegions([]);
      onFiltersChange({ regions: [], portfolios: selectedPortfolios });
    } else {
      setSelectedRegions(REGIONS);
      onFiltersChange({ regions: REGIONS, portfolios: selectedPortfolios });
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
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #e0e0e0',
        padding: '20px',
        overflowY: 'auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>
        Filters
      </h2>

      {/* Regions Section */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
          Regions
        </h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <input
              type="checkbox"
              checked={selectedRegions.length === REGIONS.length}
              onChange={handleSelectAllRegions}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Select All</span>
          </label>
        </div>
        {REGIONS.map((region) => (
          <label
            key={region}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px', marginBottom: '8px' }}
          >
            <input
              type="checkbox"
              checked={selectedRegions.includes(region)}
              onChange={() => handleRegionChange(region)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px' }}>{region}</span>
          </label>
        ))}
      </div>

      {/* Portfolios Section */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
          Portfolios
        </h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <input
              type="checkbox"
              checked={selectedPortfolios.length === PORTFOLIOS.length}
              onChange={handleSelectAllPortfolios}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Select All</span>
          </label>
        </div>
        {PORTFOLIOS.map((portfolio) => (
          <label
            key={portfolio}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px', marginBottom: '8px' }}
          >
            <input
              type="checkbox"
              checked={selectedPortfolios.includes(portfolio)}
              onChange={() => handlePortfolioChange(portfolio)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px' }}>{portfolio}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterPanel;

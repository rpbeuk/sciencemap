import { useEffect, useState } from 'react';
import './App.css';
import BeneluxMap from './components/BeneluxMap';
import FilterPanel from './components/FilterPanel';
import type { FilterOptions } from './components/FilterPanel';
import { useData, DataProvider } from './context/DataContext';

function AppContent() {
  const { 
    institutions: supabaseInsts,
  } = useData();

  const defaultTerritories = ['N101', 'N102', 'N106', 'N109', 'N101', 'N103', 'N104', 'N108', 'N110'];
  const defaultPortfolios = ['Sample Prep', 'Cell Separation', 'Cell Culture', 'Cell Analysis', 'Imaging', 'Clinical'];

  // Initialize filters from localStorage or use defaults
  const [filters, setFilters] = useState<FilterOptions>(() => {
    try {
      const saved = localStorage.getItem('sciencemap-filters');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load filters from localStorage:', e);
    }
    return {
      territories: defaultTerritories,
      portfolios: defaultPortfolios,
    };
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sciencemap-filters', JSON.stringify(filters));
  }, [filters]);

  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  // Filter by territory
  const filteredInstitutions = supabaseInsts.filter(inst => {
    const pubsWithTerritory = inst.publications.filter((pub: any) => 
      filters.territories.includes(pub.territory)
    );
    
    return pubsWithTerritory.length > 0;
  });

  return (
    <div style={{ 
      display: 'flex',
      width: '100vw', 
      height: '100vh', 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden',
      backgroundColor: '#f5f5f5',
    }}>
      <FilterPanel onFiltersChange={setFilters} />
      
      <div style={{ 
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ 
          width: '1024px', 
          height: '800px', 
          overflow: 'hidden',
          border: '3px solid red',
          boxSizing: 'border-box',
          position: 'relative',
          flex: '0 0 auto',
          display: 'flex',
        }}>
          <div style={{ flex: 1 }}>
            <BeneluxMap
              institutions={filteredInstitutions}
              selectedInstitution={selectedInstitution}
              selectedDepartment={selectedDepartment}
              onInstitutionClick={setSelectedInstitution}
              onDepartmentClick={setSelectedDepartment}
            />
          </div>

          {selectedDepartment && (
            <div style={{
              width: '600px',
              height: '100%',
              backgroundColor: 'white',
              borderLeft: '1px solid #e5e7eb',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '16px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '13px',
            }}>
              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={() => setSelectedDepartment(null)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ea580c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  ✕ Close
                </button>
              </div>

              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>
                {selectedDepartment.name}
              </h3>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {selectedDepartment.publications.map((pub: any, idx: number) => (
                  <div 
                    key={idx} 
                    style={{
                      flex: '0 0 calc(50% - 6px)',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px',
                      minHeight: '250px',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Card Title (shows on hover) */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: '#ea580c',
                      color: 'white',
                      padding: '8px 12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      maxHeight: '60px',
                      overflowY: 'auto',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    }}
                    className="card-title"
                    >
                      {pub.title}
                    </div>

                    {/* Card Content */}
                    <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.6', flex: 1, paddingTop: '8px' }}>
                      {pub.crm_level_1 && (
                        <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                          <strong style={{ color: '#1f2937' }}>{pub.crm_level_1}</strong>
                        </div>
                      )}
                      
                      {pub.territory && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Territory:</strong> {pub.territory}
                        </div>
                      )}
                      
                      {pub.zipcode && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Zipcode:</strong> {pub.zipcode}
                        </div>
                      )}
                      
                      {pub.lastauthorcountry && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Country:</strong> {pub.lastauthorcountry}
                        </div>
                      )}
                      
                      {pub.summary && (
                        <div style={{ marginBottom: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontStyle: 'italic' }}>
                          <strong style={{ display: 'block', marginBottom: '4px' }}>Summary:</strong>
                          {pub.summary.substring(0, 150)}...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;

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
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'white',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '16px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '13px',
              zIndex: 1000,
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

              {/* CRM Level 1 - Institution Name */}
              {selectedDepartment.publications && selectedDepartment.publications.length > 0 && (
                <div style={{ 
                  marginBottom: '12px', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#666',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  {selectedDepartment.publications[0].crm_level_1}
                </div>
              )}

              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>
                {selectedDepartment.name}
              </h3>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingBottom: '24px' }}>
                {[...selectedDepartment.publications].reverse().map((pub: any, idx: number) => (
                  <div 
                    key={idx}
                    className="publication-card"
                    style={{
                      flex: '0 0 calc(25% - 9px)',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px',
                      minHeight: '400px',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
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
                    {/* Paper Title - Always Visible */}
                    <h4 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '11px', 
                      fontWeight: '600', 
                      lineHeight: '1.4',
                      color: '#1f2937',
                    }}>
                      {pub.title}
                    </h4>

                    {/* Properties - Always Visible */}
                    <div style={{ fontSize: '10px', color: '#666', lineHeight: '1.6', flex: 1 }}>
                      {pub.territory && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Territory:</strong> {pub.territory}
                        </div>
                      )}
                      
                      {pub.crm_level_3 && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Department:</strong> {pub.crm_level_3}
                        </div>
                      )}
                      
                      {pub.year && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Year:</strong> {pub.year}
                        </div>
                      )}
                      
                      {pub.journal && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Journal:</strong> {pub.journal}
                        </div>
                      )}
                    </div>

                    {/* Summary - Shows on Hover */}
                    <div 
                      style={{ 
                        fontSize: '9px', 
                        color: '#666', 
                        lineHeight: '1.4',
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid #e5e7eb',
                        maxHeight: 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease',
                      }}
                      className="card-summary"
                    >
                      {pub.summary && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong style={{ display: 'block', marginBottom: '3px' }}>Summary:</strong>
                          {pub.summary}
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

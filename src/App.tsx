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
          
          {selectedInstitution && !selectedDepartment && (
            <div style={{
              width: '300px',
              height: '100%',
              backgroundColor: 'white',
              borderLeft: '1px solid #e5e7eb',
              overflowY: 'auto',
              padding: '16px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '13px',
            }}>
              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={() => setSelectedInstitution(null)}
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

              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                {selectedInstitution.name}
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#666' }}>
                {selectedInstitution.city}, {selectedInstitution.country}
              </p>

              {selectedInstitution.departments && selectedInstitution.departments.length > 0 ? (
                selectedInstitution.departments.map((dept: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                      {dept.name}
                    </h4>
                    <div style={{ fontSize: '11px', marginTop: '8px', color: '#999', maxHeight: '120px', overflow: 'hidden' }}>
                      {dept.publications.map((pub: any, pidx: number) => (
                        <div key={pidx} style={{ marginBottom: '6px', lineHeight: '1.4' }}>
                          <strong>{pub.title.substring(0, 50)}{pub.title.length > 50 ? '...' : ''}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#999' }}>No departments</p>
              )}
            </div>
          )}

          {selectedDepartment && (
            <div style={{
              width: '600px',
              height: '100%',
              backgroundColor: 'white',
              borderLeft: '1px solid #e5e7eb',
              overflowY: 'auto',
              overflowX: 'auto',
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
                  <div key={idx} style={{
                    flex: '0 0 calc(50% - 6px)',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', lineHeight: '1.4' }}>
                      {pub.title}
                    </h4>
                    <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.6', flex: 1 }}>
                      {pub.sample_type && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Sample Type:</strong> {pub.sample_type}
                        </div>
                      )}
                      {pub.medium && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Medium:</strong> {pub.medium}
                        </div>
                      )}
                      {pub.starting_material_keywords && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Starting Material:</strong> {pub.starting_material_keywords}
                        </div>
                      )}
                      {pub.authors && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Authors:</strong> {typeof pub.authors === 'string' ? pub.authors.substring(0, 100) : JSON.stringify(pub.authors).substring(0, 100)}...
                        </div>
                      )}
                      {pub.year && (
                        <div>
                          <strong>Year:</strong> {pub.year}
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

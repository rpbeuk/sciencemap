import { useEffect, useState } from 'react';
import './App.css';
import BeneluxMap from './components/BeneluxMap';
import FilterPanel from './components/FilterPanel';
import type { FilterOptions } from './components/FilterPanel';
import { useData, DataProvider } from './context/DataContext';

function AppContent() {
  const { 
    institutions: supabaseInsts, 
    useSupabase, 
  } = useData();

  const [filters, setFilters] = useState<FilterOptions>({
    territories: ['N101', 'N102', 'N106', 'N109', 'N101', 'N103', 'N104', 'N108', 'N110'],
    portfolios: ['Sample Prep', 'Cell Separation', 'Cell Culture', 'Cell Analysis', 'Imaging', 'Clinical'],
  });

  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);

  useEffect(() => {
    console.log('Data loaded:', useSupabase);
    console.log('Total publications:', supabaseInsts.length);
  }, [useSupabase, supabaseInsts]);

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
              onInstitutionClick={setSelectedInstitution}
            />
          </div>
          
          {selectedInstitution && (
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
                {selectedInstitution.city} • {selectedInstitution.publications.length} publications
              </p>

              {selectedInstitution.departments && selectedInstitution.departments.length > 0 ? (
                selectedInstitution.departments.map((dept: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                      {dept.name}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                      {dept.publications.length} publication{dept.publications.length !== 1 ? 's' : ''}
                    </div>
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

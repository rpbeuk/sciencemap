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
    regions: ['Netherlands', 'Belgium', 'Luxembourg'],
    portfolios: ['Sample Prep', 'Cell Separation', 'Cell Culture', 'Cell Analysis', 'Imaging', 'Clinical'],
  });

  useEffect(() => {
    console.log('Supabase loaded:', useSupabase);
    console.log('Institutions count:', supabaseInsts.length);
  }, [useSupabase, supabaseInsts]);

  // Filter institutions based on selected filters
  const filteredInstitutions = supabaseInsts.filter(inst => {
    return filters.regions.includes(inst.country);
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
          flex: '0 0 auto'
        }}>
          <BeneluxMap
            institutions={filteredInstitutions}
            selectedInstitution={null}
            onInstitutionClick={() => {}}
          />
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

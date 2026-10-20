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
    regions: ['Belgium', 'Luxembourg', 'Netherlands'],
    portfolios: ['Sample Prep', 'Cell Separation', 'Cell Culture', 'Cell Analysis', 'Imaging', 'Clinical'],
  });

  useEffect(() => {
    console.log('Data loaded:', useSupabase);
    console.log('Total publications:', supabaseInsts.length);
  }, [useSupabase, supabaseInsts]);

  // Filter by country only - simple!
  const filteredInstitutions = supabaseInsts.filter(inst => {
    const countryLower = (inst.country || '').toLowerCase().trim();
    
    // Normalize country names
    if (countryLower === 'the netherlands' || countryLower === 'nl') {
      return filters.regions.includes('Netherlands');
    } else if (countryLower === 'belgium' || countryLower === 'be') {
      return filters.regions.includes('Belgium');
    } else if (countryLower === 'luxembourg' || countryLower === 'lu') {
      return filters.regions.includes('Luxembourg');
    }
    
    return false;
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

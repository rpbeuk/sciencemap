import { useEffect, useState } from 'react';
import './App.css';
import BeneluxMap from './components/BeneluxMap';
import FilterPanel from './components/FilterPanel';
import type { FilterOptions } from './components/FilterPanel';
import { useData, DataProvider } from './context/DataContext';

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

function AppContent() {
  const { 
    institutions: supabaseInsts, 
    useSupabase, 
  } = useData();

  const [filters, setFilters] = useState<FilterOptions>({
    regions: ['Belgium', 'Luxembourg', 'North Holland', 'South Holland', 'Utrecht', 'Gelderland', 'North Brabant', 'Limburg', 'Flevoland', 'Overijssel', 'Friesland', 'Groningen', 'Drenthe'],
    portfolios: ['Sample Prep', 'Cell Separation', 'Cell Culture', 'Cell Analysis', 'Imaging', 'Clinical'],
  });

  useEffect(() => {
    console.log('Supabase loaded:', useSupabase);
    console.log('Institutions count:', supabaseInsts.length);
  }, [useSupabase, supabaseInsts]);

  // Filter institutions based on selected filters
  const filteredInstitutions = supabaseInsts.filter(inst => {
    // Map country names to region names for filtering
    const countryLower = (inst.country || '').toLowerCase().trim();
    
    // Determine the region(s) this institution belongs to
    let regionMatches: string[] = [];
    
    if (countryLower === 'the netherlands' || countryLower === 'nl') {
      // For Netherlands, try to match city to province
      const city = (inst.city || '').trim();
      const matchedProvinces = Object.entries(DUTCH_PROVINCES)
        .filter(([_, cities]) =>
          cities.some(c => c.toLowerCase() === city.toLowerCase())
        )
        .map(([province]) => province);
      
      // If city matches a province, use that; otherwise accept institution if any NL province is selected
      if (matchedProvinces.length > 0) {
        regionMatches = matchedProvinces;
      } else if (city) {
        // City doesn't match hardcoded list, but institution is still Dutch
        // Accept it if ANY Dutch province filter is selected
        const dutchProvinces = Object.keys(DUTCH_PROVINCES);
        if (dutchProvinces.some(p => filters.regions.includes(p))) {
          regionMatches = dutchProvinces.filter(p => filters.regions.includes(p));
        }
      } else {
        // No city info, accept if any Dutch province is selected
        const dutchProvinces = Object.keys(DUTCH_PROVINCES);
        if (dutchProvinces.some(p => filters.regions.includes(p))) {
          regionMatches = dutchProvinces.filter(p => filters.regions.includes(p));
        }
      }
    } else if (countryLower === 'belgium' || countryLower === 'be') {
      regionMatches = ['Belgium'];
    } else if (countryLower === 'luxembourg' || countryLower === 'lu') {
      regionMatches = ['Luxembourg'];
    }
    
    // Check if any of the institution's regions are in the selected filters
    return regionMatches.length > 0 && regionMatches.some(r => filters.regions.includes(r));
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

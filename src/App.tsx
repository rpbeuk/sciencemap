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
    // Map country codes to region names
    let instCountry = inst.country;
    if (instCountry === 'NL') {
      // For Netherlands, check if city matches any province
      const city = inst.city;
      const matchedProvince = Object.entries(DUTCH_PROVINCES).find(([_, cities]) =>
        cities.some(c => c.toLowerCase() === city.toLowerCase())
      );
      const province = matchedProvince ? matchedProvince[0] : null;
      return province ? filters.regions.includes(province) : false;
    } else if (instCountry === 'BE') {
      instCountry = 'Belgium';
    } else if (instCountry === 'LU') {
      instCountry = 'Luxembourg';
    }
    
    return filters.regions.includes(instCountry);
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

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { getPublications, type Publication as SupabasePublication } from '../utils/supabaseClient';

// Helper function to get coordinates from country + zipcode using country-aware database
let zipcodeCountryDatabase: Record<string, any> = {};

const loadZipcodeCountryDatabase = async (): Promise<Record<string, any>> => {
  if (Object.keys(zipcodeCountryDatabase).length > 0) return zipcodeCountryDatabase;
  
  try {
    const response = await fetch('/sciencemap/zipcode_country_coordinates.json');
    if (response.ok) {
      zipcodeCountryDatabase = await response.json();
      console.log('Loaded country-aware zipcode database with', Object.keys(zipcodeCountryDatabase).length, 'entries');
      return zipcodeCountryDatabase;
    }
  } catch (err) {
    console.warn('Could not load country-aware zipcode database:', err);
  }
  
  return {};
};

const getCoordinatesForZipcodeAndCountry = (zipcode: string, country: string, db: Record<string, any>): [number, number] => {
  if (!zipcode || !country) return [51.5, 4.75]; // Default to Benelux center
  
  const cleanZip = String(zipcode).trim();
  
  // Try exact country-zipcode match first (highest priority)
  const countryZipKey = `${country}|${cleanZip}`;
  if (db[countryZipKey]?.coordinates) {
    return db[countryZipKey].coordinates;
  }
  
  // Fallback: try any zipcode match with this country (for partial matches)
  const countryMatches = Object.entries(db)
    .filter(([k]) => k.startsWith(`${country}|`) && k.includes(cleanZip))
    .map(([, v]: [string, any]) => v);
  
  if (countryMatches.length > 0 && countryMatches[0]?.coordinates) {
    return countryMatches[0].coordinates;
  }
  
  // Final fallback: return Benelux center
  return [51.5, 4.75];
};

export interface Publication {
  pmid: number;
  title: string;
  authors: string;
  lastAuthor?: string;
  year: number;
  journal: string;
  summary: string;
  city: string;
  institute: string;
  country: string;
  territory?: string;
  department?: string;
  sampleType?: string;
  enzymes?: string;
  instrument?: string;
  miltenyiProduct?: string;
}

export interface Department {
  name: string;
  publications: Publication[];
}

export interface Institution {
  name: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates: [number, number];
  publications: Publication[];
  departments: Department[];
}

interface DataContextType {
  publications: Publication[];
  institutions: Institution[];
  selectedInstitution: Institution | null;
  selectedPublication: Publication | null;
  setSelectedInstitution: (inst: Institution | null) => void;
  setSelectedPublication: (pub: Publication | null) => void;
  loading: boolean;
  error: string | null;
  useSupabase: boolean;
  loadSupabaseData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useSupabase, setUseSupabase] = useState(false);

  // Check if Supabase is available
  useEffect(() => {
    // First try to load enriched publications from JSON
    const loadEnrichedData = async () => {
      try {
        console.log('Loading enriched publications and geographic index...');
        
        // Load country-aware zipcode database
        const zipcodeDb = await loadZipcodeCountryDatabase();
        
        const [enrichedResponse, geoResponse] = await Promise.all([
          fetch('/sciencemap/enriched_publications.json'),
          fetch('/sciencemap/geo_index.json'),
        ]);
        
        if (!enrichedResponse.ok || !geoResponse.ok) {
          throw new Error('Failed to load enriched data');
        }
        
        const enrichedPubs = await enrichedResponse.json();
        const geoIndex = await geoResponse.json();
        
        console.log(`Loaded ${enrichedPubs.length} enriched publications with ${Object.keys(geoIndex).length} geographic locations`);
        
        // Load CRM mappings for department data
        let crmMappings: Record<number, string> = {};
        try {
          const mappingResponse = await fetch('/sciencemap/crm_mappings.json');
          const mappings: Array<{ pmid: number; crm_level_3: string }> = await mappingResponse.json();
          crmMappings = Object.fromEntries(mappings.map(m => [m.pmid, m.crm_level_3]));
          console.log('Loaded CRM mappings:', Object.keys(crmMappings).length);
        } catch (err) {
          console.warn('Could not load CRM mappings:', err);
        }
        
        // Group publications by ZIPCODE (location-based clustering)
        const locationMap = new Map<string, Institution>();
        
        enrichedPubs.forEach((pub: any) => {
          const zipcode = pub.zipcode ? String(parseInt(pub.zipcode)) : null;
          const instName = pub.crm_level_1 || 'Unknown Institute';
          const city = pub.lastauthorcity || 'Unknown City';
          const country = pub.lastauthorcountry || 'Unknown';
          
          if (!zipcode || !country) return; // Skip publications without zipcode or country
          
          // Use country-zipcode as the primary key for location clustering
          const locationKey = `${country}|${zipcode}`;
          
          if (!locationMap.has(locationKey)) {
            // Get coordinates using country-aware lookup
            const coords = getCoordinatesForZipcodeAndCountry(zipcode, country, zipcodeDb);
            locationMap.set(locationKey, {
              name: `${instName} (${zipcode})`,
              city: city,
              postalCode: zipcode,
              country: country,
              coordinates: coords,
              publications: [],
              departments: [],
            });
          }
          
          const location = locationMap.get(locationKey)!;
          const publication: Publication = {
            pmid: pub.pmid,
            title: pub.title || '',
            authors: '',
            year: new Date().getFullYear(),
            journal: '',
            summary: pub.summary || '',
            city: city,
            institute: instName,
            country: country,
            territory: pub.territory || '',
            department: pub.crm_level_3 || crmMappings[pub.pmid] || 'General',
          };
          location.publications.push(publication);
        });
        
        // Create departments for each location
        const institutions = Array.from(locationMap.values()).map(location => {
          const deptMap = new Map<string, Publication[]>();
          
          location.publications.forEach(pub => {
            const dept = pub.department || 'General';
            if (!deptMap.has(dept)) {
              deptMap.set(dept, []);
            }
            deptMap.get(dept)!.push(pub);
          });
          
          const departments: Department[] = Array.from(deptMap.entries())
            .map(([name, pubs]) => ({ name, publications: pubs }))
            .sort((a, b) => a.name.localeCompare(b.name));
          
          return {
            ...location,
            departments,
          };
        });
        
        setInstitutions(institutions);
        const allPubs = institutions.flatMap(inst => inst.publications);
        setPublications(allPubs);
        console.log(`Loaded ${institutions.length} unique zipcode locations with ${allPubs.length} total publications`);
        setUseSupabase(true);
        return;
      } catch (err) {
        console.warn('Could not load enriched data:', err);
      }
      
      // Fallback: load from institutions_data.json
      try {
        console.log('Falling back to institutions_data.json...');
        const response = await fetch('/sciencemap/institutions_data.json');
        if (!response.ok) throw new Error('Failed to load institutions data');
        
        const rawInstitutions = await response.json();
        console.log('Loaded institutions from JSON:', rawInstitutions.length);
        
        // Load CRM mappings
        let crmMappings: Record<number, string> = {};
        try {
          const mappingResponse = await fetch('/sciencemap/crm_mappings.json');
          const mappings: Array<{ pmid: number; crm_level_3: string }> = await mappingResponse.json();
          crmMappings = Object.fromEntries(mappings.map(m => [m.pmid, m.crm_level_3]));
        } catch (err) {
          console.warn('Could not load CRM mappings:', err);
        }

        // Transform institutions data
        const transformed: Institution[] = rawInstitutions.map((inst: any) => {
          const publications: Publication[] = inst.publications.map((pub: any) => ({
            pmid: pub.pmid,
            title: pub.title || '',
            authors: pub.authors || '',
            year: new Date().getFullYear(),
            journal: '',
            summary: '',
            city: inst.city,
            institute: inst.name,
            country: inst.country,
            department: crmMappings[pub.pmid] || pub.crm_level_3 || 'General',
          }));

          // Aggregate by department
          const deptMap = new Map<string, Publication[]>();
          publications.forEach(pub => {
            const dept = pub.department || 'General';
            if (!deptMap.has(dept)) {
              deptMap.set(dept, []);
            }
            deptMap.get(dept)!.push(pub);
          });

          const departments: Department[] = Array.from(deptMap.entries())
            .map(([name, pubs]) => ({ name, publications: pubs }))
            .sort((a, b) => a.name.localeCompare(b.name));

          return {
            name: inst.name,
            city: inst.city,
            postalCode: inst.postal || '',
            country: inst.country,
            coordinates: inst.coordinates as [number, number],
            publications,
            departments,
          };
        });

        setInstitutions(transformed);
        const allPubs = transformed.flatMap(inst => inst.publications);
        setPublications(allPubs);
        console.log('Successfully loaded institutions:', transformed.length);
        console.log('Total publications:', allPubs.length);
        setUseSupabase(true);
        return;
      } catch (err) {
        console.warn('Could not load from JSON, falling back to Supabase:', err);
      }

      // Fallback: Try to load from Supabase
      try {
        setUseSupabase(true);
        await loadSupabaseData();
      } catch (err) {
        console.error('Failed to load from both JSON and Supabase:', err);
        setError('No data available');
        setUseSupabase(false);
      }
    };

    loadEnrichedData();
  }, []);

  const loadSupabaseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getPublications();
      
      if (data.length > 0) {
        // Load CRM mappings from JSON file
        let crmMappings: Record<number, string> = {};
        try {
          const response = await fetch('/sciencemap/crm_mappings.json');
          const mappings: Array<{ pmid: number; crm_level_3: string }> = await response.json();
          crmMappings = Object.fromEntries(mappings.map(m => [m.pmid, m.crm_level_3]));
        } catch (err) {
          console.warn('Could not load CRM mappings from JSON:', err);
        }

        // Transform Supabase publications to app format
        const transformed: Publication[] = data.map((pub: SupabasePublication) => ({
          pmid: pub.pmid,
          title: pub.title || '',
          authors: pub.authors || '',
          year: pub.year || new Date().getFullYear(),
          journal: pub.journal || '',
          summary: pub.summary || '',
          city: pub.lastauthorcity || '',
          institute: '',
          country: pub.lastauthorcountry || '',
          department: crmMappings[pub.pmid] || pub.department || 'General',
          sampleType: pub.sampletype,
          enzymes: pub.enzymes,
          instrument: pub.instrument,
        }));

        setPublications(transformed);

        // Aggregate by institution (city + country) with department grouping
        const instMap = new Map<string, Institution>();
        transformed.forEach((pub) => {
          const key = `${pub.city}-${pub.country}`;
          if (!instMap.has(key)) {
            instMap.set(key, {
              name: pub.city,
              city: pub.city,
              postalCode: '',
              country: pub.country,
              coordinates: [50.8, 4.3], // Default center
              publications: [],
              departments: [],
            });
          }
          const inst = instMap.get(key)!;
          inst.publications.push(pub);
        });

        // Now aggregate publications by department within each institution
        const institutions = Array.from(instMap.values()).map(inst => {
          const deptMap = new Map<string, Publication[]>();
          
          inst.publications.forEach(pub => {
            const dept = pub.department || 'General';
            if (!deptMap.has(dept)) {
              deptMap.set(dept, []);
            }
            deptMap.get(dept)!.push(pub);
          });

          const departments: Department[] = Array.from(deptMap.entries()).map(
            ([name, publications]) => ({
              name,
              publications,
            })
          );

          return {
            ...inst,
            departments: departments.sort((a, b) => a.name.localeCompare(b.name)),
          };
        });

        setInstitutions(institutions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Supabase load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const value: DataContextType = {
    publications,
    institutions,
    selectedInstitution,
    selectedPublication,
    setSelectedInstitution,
    setSelectedPublication,
    loading,
    error,
    useSupabase,
    loadSupabaseData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

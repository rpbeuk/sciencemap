import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { getPublications, type Publication as SupabasePublication } from '../utils/supabaseClient';

// Helper function to get coordinates from zipcode using comprehensive database
let zipcodeDatabase: Record<string, [number, number]> = {};

const loadZipcodeDatabase = async (): Promise<Record<string, [number, number]>> => {
  if (Object.keys(zipcodeDatabase).length > 0) return zipcodeDatabase;
  
  try {
    const response = await fetch('/sciencemap/zipcode_coordinates.json');
    if (response.ok) {
      zipcodeDatabase = await response.json();
      console.log('Loaded zipcode database with', Object.keys(zipcodeDatabase).length, 'entries');
      return zipcodeDatabase;
    }
  } catch (err) {
    console.warn('Could not load zipcode database:', err);
  }
  
  return {};
};

const getCoordinatesForZipcode = (zipcode: string, db: Record<string, [number, number]>): [number, number] => {
  if (!zipcode) return [51.5, 4.75]; // Default to Benelux center
  
  const cleanZip = String(zipcode).trim();
  
  // Try exact match first
  if (db[cleanZip]) {
    return db[cleanZip];
  }
  
  // Try first 4 digits (for postal codes with letters like Dutch ones)
  const firstFour = cleanZip.substring(0, 4);
  if (db[firstFour]) {
    return db[firstFour];
  }
  
  // Try regional fallback (first 2 digits)
  const firstTwo = cleanZip.substring(0, 2);
  const regionEntries = Object.entries(db).filter(([k]) => k.startsWith(firstTwo));
  if (regionEntries.length > 0) {
    const avg: [number, number] = [
      regionEntries.reduce((sum, [, coords]) => sum + coords[0], 0) / regionEntries.length,
      regionEntries.reduce((sum, [, coords]) => sum + coords[1], 0) / regionEntries.length,
    ];
    return avg;
  }
  
  return [51.5, 4.75]; // Default to Benelux center
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
        
        // Load zipcode database first
        const zipcodeDb = await loadZipcodeDatabase();
        
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
        
        // Group publications by institution (CRM Level 1)
        const instMap = new Map<string, Institution>();
        
        enrichedPubs.forEach((pub: any) => {
          const instName = pub.crm_level_1 || 'Unknown Institute';
          const city = pub.lastauthorcity || 'Unknown City';
          const key = `${instName}-${city}`;
          
          if (!instMap.has(key)) {
            instMap.set(key, {
              name: instName,
              city: city,
              postalCode: pub.zipcode ? String(pub.zipcode) : '',
              country: pub.lastauthorcountry || 'Unknown',
              coordinates: [51.5, 4.75], // Default, will be updated
              publications: [],
              departments: [],
            });
          }
          
          const inst = instMap.get(key)!;
          const publication: Publication = {
            pmid: pub.pmid,
            title: pub.title || '',
            authors: '',
            year: new Date().getFullYear(),
            journal: '',
            summary: pub.summary || '',
            city: city,
            institute: instName,
            country: pub.lastauthorcountry || '',
            department: pub.crm_level_3 || crmMappings[pub.pmid] || 'General',
          };
          inst.publications.push(publication);
        });
        
        // Create departments for each institution
        const institutions = Array.from(instMap.values()).map(inst => {
          const deptMap = new Map<string, Publication[]>();
          
          inst.publications.forEach(pub => {
            const dept = pub.department || 'General';
            if (!deptMap.has(dept)) {
              deptMap.set(dept, []);
            }
            deptMap.get(dept)!.push(pub);
          });
          
          const departments: Department[] = Array.from(deptMap.entries())
            .map(([name, pubs]) => ({ name, publications: pubs }))
            .sort((a, b) => a.name.localeCompare(b.name));
          
          // Assign better coordinates if zipcode exists using loaded database
          const coordinates = inst.postalCode ? 
            getCoordinatesForZipcode(inst.postalCode, zipcodeDb) : 
            [51.5, 4.75];
          
          return {
            ...inst,
            coordinates: coordinates as [number, number],
            departments,
          };
        });
        
        setInstitutions(institutions);
        const allPubs = institutions.flatMap(inst => inst.publications);
        setPublications(allPubs);
        console.log(`Loaded ${institutions.length} institutions from ${allPubs.length} publications`);
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

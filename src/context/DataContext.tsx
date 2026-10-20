import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { getPublications, type Publication as SupabasePublication } from '../utils/supabaseClient';

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
    // First try to load institutions from matched publications JSON
    const loadFromJSON = async () => {
      try {
        const response = await fetch('/sciencemap/institutions_data.json');
        if (!response.ok) throw new Error('Failed to load institutions data');
        
        const rawInstitutions = await response.json();
        
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

    loadFromJSON();
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

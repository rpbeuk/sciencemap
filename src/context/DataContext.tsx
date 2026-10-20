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
  sampleType?: string;
  enzymes?: string;
  instrument?: string;
  miltenyiProduct?: string;
}

export interface Institution {
  name: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates: [number, number];
  publications: Publication[];
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
    // Try to load Supabase data
    const load = async () => {
      setUseSupabase(true);
      try {
        await loadSupabaseData();
      } catch (err) {
        console.error('Failed to load Supabase data:', err);
        setUseSupabase(false);
      }
    };
    load();
  }, []);

  const loadSupabaseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getPublications();
      
      if (data.length > 0) {
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
          sampleType: pub.sampletype,
          enzymes: pub.enzymes,
          instrument: pub.instrument,
        }));

        setPublications(transformed);

        // Aggregate by institution (city + country)
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
            });
          }
          instMap.get(key)!.publications.push(pub);
        });

        setInstitutions(Array.from(instMap.values()));
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

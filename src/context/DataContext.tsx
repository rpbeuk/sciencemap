import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

export interface Publication {
  pmid: number;
  title: string;
  authors: string;
  lastAuthor: string;
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [publications] = useState<Publication[]>([]);
  const [institutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);

  const value: DataContextType = {
    publications,
    institutions,
    selectedInstitution,
    selectedPublication,
    setSelectedInstitution,
    setSelectedPublication,
    loading: false,
    error: null,
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

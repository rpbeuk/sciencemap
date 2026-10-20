import { useState, useEffect } from 'react';
import './App.css';
import BeneluxMap from './components/BeneluxMap';
import PublicationBrowser from './components/PublicationBrowser';
import FileUpload from './components/FileUpload';
import { useData, DataProvider } from './context/DataContext';
import type { Publication, Institution } from './context/DataContext';
import { loadExcelData } from './utils/dataLoader';
import { MapPin } from 'lucide-react';

function AppContent() {
  const { 
    publications: supabasePubs, 
    institutions: supabaseInsts, 
    useSupabase, 
    loadSupabaseData,
  } = useData();
  
  const [_publications, setPublications] = useState<Publication[]>([]);
  const [_institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showPublications, setShowPublications] = useState(false);

  // Use Supabase data if available
  const displayInstitutions = useSupabase ? supabaseInsts : supabaseInsts;

  // Set dataLoaded when Supabase data becomes available
  useEffect(() => {
    if (useSupabase && supabasePubs.length > 0) {
      setDataLoaded(true);
    }
  }, [useSupabase, supabasePubs]);

  const handleFilesSelected = async (pubFile: File, accFile: File) => {
    setLoading(true);
    setError(null);
    try {
      const { publications: pubs, institutions: insts } = await loadExcelData(pubFile, accFile);
      setPublications(pubs);
      setInstitutions(insts);
      setDataLoaded(true);
      setSelectedInstitution(null);
      setSelectedPublication(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseUpload = (success: boolean, message: string) => {
    setUploadMessage(message);
    if (success) {
      loadSupabaseData();
      setSelectedInstitution(null);
      setSelectedPublication(null);
    }
    setTimeout(() => setUploadMessage(null), 5000);
  };

  const handleInstitutionClick = (institution: Institution) => {
    setSelectedInstitution(institution);
    setSelectedPublication(null);
    setShowPublications(true);
  };

  const handlePublicationClick = (pub: Publication) => {
    setSelectedPublication(pub);
  };

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <FileUpload 
          onFilesSelected={handleFilesSelected} 
          loading={loading} 
          error={error}
          useSupabase={useSupabase}
          onSupabaseUpload={handleSupabaseUpload}
        />
        {uploadMessage && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white ${
            uploadMessage.includes('Successfully') ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {uploadMessage}
          </div>
        )}
      </div>
    );
  }

  const selectedPublications = selectedInstitution?.publications || [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">ScienceMap Benelux</h1>
            {useSupabase && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Supabase</span>}
          </div>
          <button
            onClick={() => {
              setDataLoaded(false);
              setSelectedInstitution(null);
              setSelectedPublication(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Load Different Files
          </button>
        </div>
      </header>

      {/* Main Content - Map takes full height */}
      <div style={{ display: 'flex', height: 'calc(100vh - 120px)', position: 'relative' }}>
        {/* Map Container - Full viewport */}
        <div 
          style={{ 
            flex: 1,
            position: 'relative',
            minHeight: 0
          }}
        >
          <BeneluxMap
            institutions={displayInstitutions}
            selectedInstitution={selectedInstitution}
            onInstitutionClick={handleInstitutionClick}
          />
        </div>

        {/* Publication Browser - Overlay on right when visible */}
        {showPublications && (
          <div 
            className="bg-white shadow-2xl flex flex-col"
            style={{ 
              width: '350px',
              height: '100%',
              borderLeft: '1px solid #e5e7eb',
              zIndex: 10
            }}
          >
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-lg">Publications</h3>
              <button
                onClick={() => setShowPublications(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <PublicationBrowser
                publications={selectedPublications}
                selectedPublication={selectedPublication}
                onPublicationClick={handlePublicationClick}
              />
            </div>
          </div>
        )}
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

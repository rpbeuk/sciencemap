import { useState } from 'react';
import './App.css';
import BeneluxMap from './components/BeneluxMap';
import PublicationBrowser from './components/PublicationBrowser';
import FileUpload from './components/FileUpload';
import { DataProvider } from './context/DataContext';
import type { Publication, Institution } from './context/DataContext';
import { loadExcelData } from './utils/dataLoader';
import { MapPin } from 'lucide-react';

function AppContent() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

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

  const handleInstitutionClick = (institution: Institution) => {
    setSelectedInstitution(institution);
    setSelectedPublication(null);
  };

  const handlePublicationClick = (pub: Publication) => {
    setSelectedPublication(pub);
  };

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <FileUpload onFilesSelected={handleFilesSelected} loading={loading} error={error} />
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
          </div>
          <button
            onClick={() => setDataLoaded(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Load Different Files
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-96 lg:h-full min-h-96">
                <BeneluxMap
                  institutions={institutions}
                  selectedInstitution={selectedInstitution}
                  onInstitutionClick={handleInstitutionClick}
                />
              </div>
            </div>
          </div>

          {/* Publication Browser */}
          <div className="h-96 lg:h-full min-h-96">
            <PublicationBrowser
              publications={selectedPublications}
              selectedPublication={selectedPublication}
              onPublicationClick={handlePublicationClick}
            />
          </div>
        </div>

        {/* Statistics */}
        {selectedInstitution && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">{selectedInstitution.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {selectedInstitution.publications.length}
                </div>
                <div className="text-sm text-gray-600">Publications</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {new Set(selectedInstitution.publications.map((p) => p.year)).size}
                </div>
                <div className="text-sm text-gray-600">Years Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {selectedInstitution.city}
                </div>
                <div className="text-sm text-gray-600">Location</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {selectedInstitution.country}
                </div>
                <div className="text-sm text-gray-600">Country</div>
              </div>
            </div>
          </div>
        )}

        {/* Global Statistics */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4">Dataset Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{institutions.length}</div>
              <div className="text-sm text-gray-600">Institutions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{publications.length}</div>
              <div className="text-sm text-gray-600">Total Publications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {new Set(publications.map((p) => p.city)).size}
              </div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {Math.min(...publications.map((p) => p.year)) || 'N/A'} -
                {Math.max(...publications.map((p) => p.year)) || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Year Range</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {new Set(publications.map((p) => p.country)).size}
              </div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
          </div>
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

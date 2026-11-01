import { useEffect, useState } from 'react';
import './App.css';
import BeneluxMap from './components/BeneluxMap';
import FilterPanel from './components/FilterPanel';
import { LoginScreen } from './components/LoginScreen';
import type { FilterOptions } from './components/FilterPanel';
import type { User } from './utils/authClient';
import { getCurrentUser, logoutUser } from './utils/authClient';
import { useData, DataProvider } from './context/DataContext';
import { LogOut } from 'lucide-react';

// Mapping of portfolios to their tags
const PORTFOLIO_TAGS: Record<string, string[]> = {
  'Sample Prep': ['tissue digestion', 'cell therapy', 'regenerative medicine'],
  'Cell Separation': ['cell separation'],
  'Cell Culture': ['cell culture'],
  'Cell Analysis': ['cell analysis'],
  'Imaging': ['imaging'],
  'Clinical': ['clinical'],
};

// Mapping of dataset display names to database tags
const DATASET_TAGS: Record<string, string> = {
  'Tissue Digestion': 'tissue-digestion',
  'CGT - Regenerative Medicine': 'cgt-regenerative-medicine',
  'CGT - Translational': 'cgt-translational',
};

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  
  const { 
    institutions: supabaseInsts,
    loading: dataLoading,
    error: dataError,
  } = useData();

  const defaultTerritories = ['N101', 'N102', 'N106', 'N109', 'N101', 'N103', 'N104', 'N108', 'N110'];
  const defaultPortfolios = ['Sample Prep', 'Cell Separation', 'Cell Culture', 'Cell Analysis', 'Imaging', 'Clinical'];
  const defaultDatasets = ['Tissue Digestion', 'CGT - Regenerative Medicine', 'CGT - Translational'];

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    checkUser();
  }, []);

  // Always start with all territories, portfolios and datasets visible (FilterPanel also starts fully selected)
  const [filters, setFilters] = useState<FilterOptions>({
    territories: defaultTerritories,
    portfolios: defaultPortfolios,
    datasets: defaultDatasets,
  });

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  // Show loading state
  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />;
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen onLoginSuccess={setUser} />;
  }

  // Show error if data failed to load
  if (dataError) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fff', fontSize: '16px', color: '#c00', padding: '20px', textAlign: 'center' }}>
      <div>
        <h2>Error Loading Data</h2>
        <p>{dataError}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Reload Page
        </button>
      </div>
    </div>;
  }

  // Show loading if data is still loading
  if (dataLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f5f5', fontSize: '16px', color: '#666' }}>
      Loading map data...
    </div>;
  }

  // Get all tags from selected portfolios
  const selectedTags = filters.portfolios.flatMap(portfolio => PORTFOLIO_TAGS[portfolio] || []);

  // Get all dataset tags from selected datasets
  const selectedDatasetTags = (filters.datasets || defaultDatasets).map(dataset => DATASET_TAGS[dataset]).filter(Boolean);

  // Filter by territory, portfolio tags, and dataset tags
  const filteredInstitutions = supabaseInsts.filter(inst => {
    const pubsFiltered = inst.publications.filter((pub: any) => {
      // Check if publication matches selected territories
      const matchesTerritory = filters.territories.includes(pub.territory);
      
      // Check if publication has matching portfolio tags (if portfolios are selected)
      const pubTags = pub.tags || [];
      const hasMatchingTag = selectedTags.length === 0 || pubTags.some((tag: string) => selectedTags.includes(tag));
      
      // Check if publication matches selected datasets
      const matchesDataset = selectedDatasetTags.length === 0 || selectedDatasetTags.includes(pub.dataset_tag);
      
      return matchesTerritory && hasMatchingTag && matchesDataset;
    });
    
    return pubsFiltered.length > 0;
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
      position: 'relative',
    }}>
      {/* User Info & Logout Button */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'white',
        padding: '10px 14px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: '12px',
      }}>
        <span style={{ color: '#6b7280' }}>
          👤 {user.name}
        </span>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '6px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

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
          flex: '0 0 auto',
          display: 'flex',
        }}>
          <div style={{ flex: 1 }}>
            <BeneluxMap
              institutions={filteredInstitutions}
              selectedInstitution={selectedInstitution}
              selectedDepartment={selectedDepartment}
              onInstitutionClick={setSelectedInstitution}
              onDepartmentClick={setSelectedDepartment}
            />
          </div>

          {selectedDepartment && (
            <div style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'white',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '16px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '13px',
              zIndex: 1000,
            }}>
              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={() => setSelectedDepartment(null)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ea580c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  ✕ Close
                </button>
              </div>

              {/* CRM Level 1 - Institution Name */}
              {selectedDepartment.publications && selectedDepartment.publications.length > 0 && (
                <div style={{ 
                  marginBottom: '12px', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#666',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  {selectedDepartment.publications[0].crm_level_1}
                </div>
              )}

              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>
                {selectedDepartment.name}
              </h3>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingBottom: '24px' }}>
                {[...selectedDepartment.publications].reverse().map((pub: any, idx: number) => (
                  <div 
                    key={idx}
                    className="publication-card"
                    style={{
                      flex: '0 0 calc(25% - 9px)',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px',
                      minHeight: '400px',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Paper Title - Always Visible */}
                    <h4 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '11px', 
                      fontWeight: '600', 
                      lineHeight: '1.4',
                      color: '#1f2937',
                    }}>
                      {pub.title}
                    </h4>

                    {/* Properties - Always Visible */}
                    <div style={{ fontSize: '10px', color: '#666', lineHeight: '1.6', flex: 1 }}>
                      {pub.territory && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Territory:</strong> {pub.territory}
                        </div>
                      )}
                      
                      {pub.crm_level_3 && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Department:</strong> {pub.crm_level_3}
                        </div>
                      )}
                      
                      {pub.year && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Year:</strong> {pub.year}
                        </div>
                      )}
                      
                      {pub.journal && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong>Journal:</strong> {pub.journal}
                        </div>
                      )}
                    </div>

                    {/* Summary - Shows on Hover */}
                    <div 
                      style={{ 
                        fontSize: '9px', 
                        color: '#666', 
                        lineHeight: '1.4',
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid #e5e7eb',
                        maxHeight: 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease',
                      }}
                      className="card-summary"
                    >
                      {pub.summary && (
                        <div style={{ marginBottom: '6px' }}>
                          <strong style={{ display: 'block', marginBottom: '3px' }}>Summary:</strong>
                          {pub.summary}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

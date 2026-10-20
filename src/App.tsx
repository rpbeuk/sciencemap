import { useEffect } from 'react';
import './App.css';
import BeneluxMap from './components/BeneluxMap';
import { useData, DataProvider } from './context/DataContext';

function AppContent() {
  const { 
    institutions: supabaseInsts, 
    useSupabase, 
  } = useData();

  useEffect(() => {
    console.log('Supabase loaded:', useSupabase);
    console.log('Institutions count:', supabaseInsts.length);
  }, [useSupabase, supabaseInsts]);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <BeneluxMap
        institutions={supabaseInsts}
        selectedInstitution={null}
        onInstitutionClick={() => {}}
      />
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

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
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw', 
      height: '100vh', 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden',
      backgroundColor: '#f5f5f5',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        width: '1024px', 
        height: '800px', 
        overflow: 'hidden',
        border: '3px solid red',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        <BeneluxMap
          institutions={supabaseInsts}
          selectedInstitution={null}
          onInstitutionClick={() => {}}
        />
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

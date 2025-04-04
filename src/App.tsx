
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Index';
import Workouts from './pages/Workouts';
import Progress from './pages/Progress';
import Nutrition from './pages/Nutrition';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import BarcodeScanner from './components/nutrition/BarcodeScanner';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/nutrition/barcode" element={<BarcodeScanner />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;

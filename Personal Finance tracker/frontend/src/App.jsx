import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen">
        {/* Background Orbs */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <footer className="py-6 text-center text-slate-500 text-sm border-t border-white/10 mt-auto backdrop-blur-md bg-black/20">
            <p>&copy; {new Date().getFullYear()} FinanceTrack. PWA Ready & Offline Capable.</p>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;

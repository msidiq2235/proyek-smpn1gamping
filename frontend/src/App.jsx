import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './pages/Login';
import Beranda from './pages/Beranda';
import Profil from './pages/Profil';
import KartuTes from './pages/KartuTes';
import DataNilai from './pages/DataNilai';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/beranda" element={<Beranda />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/kartu-tes" element={<KartuTes />} />
        <Route path="/data-nilai" element={<DataNilai />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
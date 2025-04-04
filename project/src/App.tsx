import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Blog from './pages/Blog';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Sobre from './pages/Sobre';
import BlogPosts from './pages/admin/BlogPosts';
import AdminLayout from './components/AdminLayout';
import Servicos from './pages/Servicos';
import ServicosAdmin from './pages/admin/ServicosAdmin';
import Profissionais from './pages/Profissionais';
import ProfissionaisAdmin from './pages/admin/ProfissionaisAdmin';
import Home from './pages/Home';
import Analytics from './pages/admin/Analytics';
import Site from './pages/admin/Site';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog showHeader={true} />} />
        <Route path="sobre" element={<Sobre />} />
        <Route path="servicos" element={<Servicos />} />
        <Route path="profissionais" element={<Profissionais />} />
      </Route>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="site" element={<Site />} />
        <Route path="blog" element={<BlogPosts />} />
        <Route path="servicos" element={<ServicosAdmin />} />
        <Route path="profissionais" element={<ProfissionaisAdmin />} />
      </Route>
      <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
    </Routes>
  );
}

export default App;

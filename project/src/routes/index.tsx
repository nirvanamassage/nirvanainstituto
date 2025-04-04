import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import AdminLayout from '../components/AdminLayout';
import Login from '../pages/admin/Login';
import Professionals from '../pages/admin/Professionals';
import Blog from '../pages/Blog';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'sobre',
        element: <About />,
      },
      {
        path: 'contato',
        element: <Contact />,
      },
      {
        path: 'blog',
        element: <Blog />,
      },
    ],
  },
  {
    path: '/admin/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: 'profissionais',
        element: <Professionals />,
      },
    ],
  },
]);
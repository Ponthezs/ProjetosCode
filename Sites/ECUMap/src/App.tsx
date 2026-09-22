import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './layouts/AppLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Garage from './pages/Garage';
import VehicleForm from './pages/VehicleForm';
import VehicleProject from './pages/VehicleProject';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import EcuFiles from './pages/EcuFiles';
import MapEditor from './pages/MapEditor';
import FileCompare from './pages/FileCompare';
import MapLibrary from './pages/MapLibrary';
import EcuDatabase from './pages/EcuDatabase';
import Performance from './pages/Performance';
import Dyno from './pages/Dyno';
import Logs from './pages/Logs';
import Reports from './pages/Reports';
import ServiceOrders from './pages/ServiceOrders';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="garage" element={<Garage />} />
            <Route path="garage/:id" element={<VehicleProject />} />
            <Route path="vehicles/new" element={<VehicleForm />} />
            <Route path="clients" element={<Clients />} />
            <Route path="projects" element={<Projects />} />
            <Route path="ecu-files" element={<EcuFiles />} />
            <Route path="map-editor" element={<MapEditor />} />
            <Route path="file-compare" element={<FileCompare />} />
            <Route path="map-library" element={<MapLibrary />} />
            <Route path="ecu-database" element={<EcuDatabase />} />
            <Route path="performance" element={<Performance />} />
            <Route path="dyno" element={<Dyno />} />
            <Route path="logs" element={<Logs />} />
            <Route path="reports" element={<Reports />} />
            <Route path="service-orders" element={<ServiceOrders />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

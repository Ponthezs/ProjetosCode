import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStore } from '../hooks/useLocalStore';
import { vehicles as seedVehicles, clients as seedClients, serviceOrders as seedOrders, appUsers } from '../data/mock';
import type { Vehicle, Client, ServiceOrder, AppUser } from '../types';

interface AppContextValue {
  vehicles: Vehicle[];
  addVehicle: (v: Vehicle) => void;
  clients: Client[];
  addClient: (c: Client) => void;
  serviceOrders: ServiceOrder[];
  simulationMode: boolean;
  setSimulationMode: (v: boolean) => void;
  currentUser: AppUser;
  setCurrentUser: (u: AppUser) => void;
  authenticated: boolean;
  setAuthenticated: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useLocalStore<Vehicle[]>('remaptech.vehicles', seedVehicles);
  const [clients, setClients] = useLocalStore<Client[]>('remaptech.clients', seedClients);
  const [serviceOrders] = useLocalStore<ServiceOrder[]>('remaptech.serviceOrders', seedOrders);
  const [simulationMode, setSimulationMode] = useLocalStore<boolean>('remaptech.simulation', false);
  const [currentUser, setCurrentUser] = useLocalStore<AppUser>('remaptech.currentUser', appUsers[3]);
  const [authenticated, setAuthenticated] = useLocalStore<boolean>('remaptech.authenticated', false);

  const value = useMemo<AppContextValue>(() => ({
    vehicles,
    addVehicle: (v: Vehicle) => setVehicles(prev => [v, ...prev]),
    clients,
    addClient: (c: Client) => setClients(prev => [c, ...prev]),
    serviceOrders,
    simulationMode,
    setSimulationMode,
    currentUser,
    setCurrentUser,
    authenticated,
    setAuthenticated,
  }), [vehicles, clients, serviceOrders, simulationMode, currentUser, authenticated]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

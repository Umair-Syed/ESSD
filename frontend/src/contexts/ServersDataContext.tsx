import { useState, createContext, useContext, PropsWithChildren } from 'react';
import { ServerData } from '@/models/server-data';

interface ServersDataContextType {
    serversData: ServerData[];
    setServersData: React.Dispatch<React.SetStateAction<ServerData[]>>;
  }

export const ServersDataContext = createContext<ServersDataContextType | undefined>(undefined);

// will be wrapped around the components in layout.tsx
export function ServersDataProvider({ children }: PropsWithChildren) {
  const [serversData, setServersData] = useState<ServerData[]>([]);

  return (
    <ServersDataContext.Provider value={{ serversData, setServersData }}>
      {children}
    </ServersDataContext.Provider>
  );
}

// will be used in components to access the data
export function useServersData() {
  const context = useContext(ServersDataContext);
  if (context === undefined) {
    throw new Error('useServersData must be used within a ServerDataProvider');
  }
  return context;
}
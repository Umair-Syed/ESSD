import { useState, createContext, useContext, PropsWithChildren } from 'react';

interface SelectedFilterContextType {
  selectedFilter: string;
  setSelectedFilter: React.Dispatch<React.SetStateAction<string>>;
}

export const SelectedFilterContext = createContext<SelectedFilterContextType | undefined>(undefined);


export function SelectedFilterProvider({ children }: PropsWithChildren) {
  const [selectedFilter, setSelectedFilter] = useState<string>("All servers");

  return (
    <SelectedFilterContext.Provider value={{ selectedFilter, setSelectedFilter }}>
      {children}
    </SelectedFilterContext.Provider>
  );
}


export function useSelectedFilter() {
  const context = useContext(SelectedFilterContext);
  if (context === undefined) {
    throw new Error('useSelectedFilter must be used within a SelectedFilterProvider');
  }
  return context;
}

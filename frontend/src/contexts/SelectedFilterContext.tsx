'use client';
import { useState, createContext, useContext, PropsWithChildren, useEffect } from 'react';

interface SelectedFilterContextType {
  selectedFilter: string[];
  setSelectedFilter: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SelectedFilterContext = createContext<SelectedFilterContextType | undefined>(undefined);


export function SelectedFilterProvider({ children }: PropsWithChildren) {

  const parseStoredFilter = () => {
    const storedFilter = localStorage.getItem('selectedFilter');
    if (!storedFilter) {
      return ["All servers"];
    }
    try {
      const parsed = JSON.parse(storedFilter);
      if (Array.isArray(parsed)) {
        return parsed;
      } else {
        // If the parsed value isn't an array, convert it into one
        return [parsed];
      }
    } catch (error) {
      // If parsing fails, assuming it's a plain string and convert it into an array
      return [storedFilter];
    }
  };

  const [selectedFilter, setSelectedFilter] = useState<string[]>(parseStoredFilter);
  
  // Update localStorage whenever selectedFilter changes
  useEffect(() => {
    localStorage.setItem('selectedFilter', JSON.stringify(selectedFilter));
  }, [selectedFilter]);


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

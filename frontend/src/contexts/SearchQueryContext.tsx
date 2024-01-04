import { useState, createContext, useContext, PropsWithChildren } from 'react';

interface SearchQueryContextType {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const SearchQueryContext = createContext<SearchQueryContextType | undefined>(undefined);


export function SearchQueryProvider({ children }: PropsWithChildren) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <SearchQueryContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchQueryContext.Provider>
  );
}


export function useSearchQuery() {
  const context = useContext(SearchQueryContext);
  if (context === undefined) {
    throw new Error('useSearchQuery must be used within a SearchQueryProvider');
  }
  return context;
}

import { useState, createContext, useContext, PropsWithChildren } from 'react';


export const SearchQueryContext = createContext({
  searchQuery: "",
  setSearchQuery: (searchQuery: string) => { },
});


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

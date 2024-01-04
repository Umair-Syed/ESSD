import { useState, useEffect } from 'react';

/**
 * useDebounce hook
 * 
 * @param value - Value to be debounced
 * @param delay - Delay in ms for the debounce
 */
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;

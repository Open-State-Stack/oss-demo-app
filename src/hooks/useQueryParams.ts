import { useCallback } from 'react';
import { 
  useQueryState, 
  useQueryStates, 
  parseAsString, 
  parseAsInteger, 
  parseAsFloat, 
  parseAsBoolean, 
  parseAsArrayOf,
  parseAsIsoDateTime,
  type Parser
} from 'nuqs';

/**
 * Common query parameter options that can be applied to any parameter
 */
export interface QueryParamOptions {
  /** Whether to use shallow routing (default: true) */
  shallow?: boolean;
  /** History method to use (default: 'push') */
  history?: 'push' | 'replace';
  /** Throttle updates in milliseconds (default: 0) */
  throttleMs?: number;
  /** Whether to clear the parameter when it matches the default value (default: true) */
  clearOnDefault?: boolean;
}

/**
 * Pre-built parsers for common data types
 * These handle serialization/deserialization and provide type safety
 */
export const parsers = {
  /** String parser with optional default value */
  string: (defaultValue = '') => parseAsString.withDefault(defaultValue),
  
  /** Integer parser with optional default value */
  integer: (defaultValue = 0) => parseAsInteger.withDefault(defaultValue),
  
  /** Float parser with optional default value */
  float: (defaultValue = 0) => parseAsFloat.withDefault(defaultValue),
  
  /** Boolean parser with optional default value */
  boolean: (defaultValue = false) => parseAsBoolean.withDefault(defaultValue),
  
  /** String array parser with optional default value */
  stringArray: (defaultValue: string[] = []) => parseAsArrayOf(parseAsString).withDefault(defaultValue),
  
  /** Integer array parser with optional default value */
  integerArray: (defaultValue: number[] = []) => parseAsArrayOf(parseAsInteger).withDefault(defaultValue),
  
  /** Date parser with optional default value */
  date: (defaultValue?: Date) => parseAsIsoDateTime.withDefault(defaultValue || new Date()),
};

/**
 * Hook for managing a single query parameter with full type safety
 * 
 * @param key - The query parameter key (e.g., 'page', 'search')
 * @param parser - The parser that defines the type and default value
 * @param options - Optional configuration for the parameter behavior
 * 
 * @returns A tuple containing [currentValue, updateFunction, clearFunction]
 * 
 * @example
 * // Basic usage
 * const [page, setPage, clearPage] = useQueryParam('page', parsers.integer(1));
 * 
 * // Update the parameter
 * setPage(2); // URL becomes: ?page=2
 * 
 * // Clear the parameter
 * clearPage(); // Removes 'page' from URL
 * 
 * @example
 * // With custom options
 * const [search, setSearch] = useQueryParam('search', parsers.string(''), {
 *   history: 'replace', // Use replace instead of push
 *   throttleMs: 300,    // Throttle updates by 300ms
 * });
 */


export const useQueryParam = <T>(
  key: string,
  parser: Parser<T>,
  options?: QueryParamOptions
) => {
  const [value, setValue] = useQueryState(key, parser);
  
  /**
   * Update the query parameter value
   * @param newValue - The new value to set, or null to remove the parameter
   */
  const updateValue = useCallback((newValue: T | null) => {
    setValue(newValue as (T & {}) | null, options);
  }, [setValue, options]);

  /**
   * Clear the query parameter (removes it from the URL)
   */
  const clearValue = useCallback(() => {
    setValue(null, options);
  }, [setValue, options]);

  return [value, updateValue, clearValue] as const;
};

/**
 * Hook for managing multiple query parameters simultaneously with type safety
 * 
 * @param parserConfig - Object mapping parameter keys to their parsers
 * @param options - Optional configuration applied to all parameters
 * 
 * @returns Object with methods to manage all parameters
 * 
 * @example
 * // Define your parameters
 * const { values, updateValue, updateValues, clearValue, clearValues } = useQueryParams({
 *   page: parsers.integer(1),
 *   search: parsers.string(''),
 *   filters: parsers.stringArray([])
 * });
 * 
 * // Access current values
 * console.log(values.page, values.search, values.filters);
 * 
 * // Update a single parameter
 * updateValue('page', 2);
 * 
 * // Update multiple parameters at once
 * updateValues({ page: 1, search: 'hello' });
 * 
 * // Clear a specific parameter
 * clearValue('search');
 * 
 * // Clear all parameters
 * clearValues();
 */
export const useQueryParams = <T extends Record<string, any>>(
  parserConfig: { [K in keyof T]: Parser<T[K]> },
  options?: QueryParamOptions
) => {
  const [values, setValues] = useQueryStates(parserConfig);

  /**
   * Update multiple parameters at once
   * @param newValues - Partial object with the parameters to update
   */
  const updateValues = useCallback((newValues: Partial<T>) => {
    setValues(newValues, options);
  }, [setValues, options]);

  /**
   * Update a single parameter
   * @param key - The parameter key to update
   * @param value - The new value, or null to remove the parameter
   */
  const updateValue = useCallback(<K extends keyof T>(key: K, value: T[K] | null) => {
    setValues({ [key]: value } as Partial<T>, options);
  }, [setValues, options]);

  /**
   * Clear multiple parameters
   * @param keys - Array of parameter keys to clear. If not provided, clears all parameters
   */
  const clearValues = useCallback((keys?: (keyof T)[]) => {
    if (keys) {
      // Clear only specified keys
      const clearObj = Object.fromEntries(
        keys.map(key => [key, null])
      ) as Partial<T>;
      setValues(clearObj, options);
    } else {
      // Clear all parameters
      const clearObj = Object.fromEntries(
        Object.keys(parserConfig).map(key => [key, null])
      ) as Partial<T>;
      setValues(clearObj, options);
    }
  }, [setValues, parserConfig, options]);

  /**
   * Clear a single parameter
   * @param key - The parameter key to clear
   */
  const clearValue = useCallback((key: keyof T) => {
    setValues({ [key]: null } as Partial<T>, options);
  }, [setValues, options]);

  return {
    /** Current values of all parameters */
    values,
    /** Update multiple parameters at once */
    updateValues,
    /** Update a single parameter */
    updateValue,
    /** Clear multiple parameters */
    clearValues,
    /** Clear a single parameter */
    clearValue,
    /** Direct access to nuqs setValues function */
    setValues,
  };
};

 /**
 * Pre-configured parameter sets for common use cases
 * These provide ready-to-use configurations for typical scenarios
 */
export const commonParams = {
  /** Standard pagination parameters */
  pagination: {
    page: parsers.integer(1),      // Current page number
    limit: parsers.integer(10),    // Items per page
    offset: parsers.integer(0),    // Offset for pagination
  },
  
  /** Search and filtering parameters */
  search: {
    query: parsers.string(''),           // Search query string
    filters: parsers.stringArray([]),    // Applied filters
    sort: parsers.string(''),            // Sort field
    order: parsers.string('asc'),        // Sort order (asc/desc)
  },
  
  /** Date range parameters */
  dateRange: {
    startDate: parsers.date(),     // Start date
    endDate: parsers.date(),       // End date
  },
};


/**
 * Convenience hook for pagination state management
 * 
 * @param options - Optional configuration
 * @returns Object with pagination state and methods
 * 
 * @example
 * const pagination = usePagination();
 * 
 * // Access current values
 * console.log(pagination.values.page, pagination.values.limit);
 * 
 * // Update page
 * pagination.updateValue('page', 2);
 * 
 * // Reset pagination
 * pagination.clearValues();
 */
export const usePagination = (options?: QueryParamOptions) => {
  return useQueryParams(commonParams.pagination, options);
};


/**
 * Convenience hook for search and filtering state management
 * 
 * @param options - Optional configuration
 * @returns Object with search state and methods
 * 
 * @example
 * const search = useSearch();
 * 
 * // Update search query
 * search.updateValue('query', 'hello world');
 * 
 * // Add filters
 * search.updateValue('filters', ['category1', 'category2']);
 * 
 * // Update multiple search params
 * search.updateValues({ query: 'test', sort: 'date', order: 'desc' });
 */
export const useSearch = (options?: QueryParamOptions) => {
  return useQueryParams(commonParams.search, options);
};

/**
 * Convenience hook for date range state management
 * 
 * @param options - Optional configuration
 * @returns Object with date range state and methods
 * 
 * @example
 * const dateRange = useDateRange();
 * 
 * // Set date range
 * dateRange.updateValues({
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-12-31')
 * });
 */
export const useDateRange = (options?: QueryParamOptions) => {
  return useQueryParams(commonParams.dateRange, options);
};


export default useQueryParam;
import { useState, useEffect, useRef } from 'react';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const fetchData = async () => {
    // Prevent duplicate calls
    if (hasFetched.current && !options.forceRefetch) return;
    
    try {
      setLoading(true);
      setError(null);
      hasFetched.current = true;

      console.log(`📡 Fetching: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Request failed');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]); // Only refetch if URL changes

  const refetch = () => {
    hasFetched.current = false;
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};
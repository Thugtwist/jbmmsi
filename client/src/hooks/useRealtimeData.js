import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket.js';

export const useRealtimeData = (dataType) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, isConnected, addEventListener, removeEventListener } = useSocket();

  const API_BASE_URL = 'http://localhost:3001/api';

  // Define event names based on data type
  const eventConfig = {
    announcements: {
      endpoint: 'announcements',
      created: 'announcement_created',
      updated: 'announcement_updated',
      deleted: 'announcement_deleted'
    },
    schools: {
      endpoint: 'schools',
      created: 'school_created',
      updated: 'school_updated',
      deleted: 'school_deleted'
    }
  };

  const config = eventConfig[dataType];

  if (!config) {
    throw new Error(`Unsupported data type: ${dataType}`);
  }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📡 Fetching ${dataType} from API...`);
      
      const response = await fetch(`${API_BASE_URL}/${config.endpoint}`);
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Loaded ${result.data.length} ${dataType}`);
        setData(result.data);
      } else {
        throw new Error(result.message || `Failed to fetch ${dataType}`);
      }
    } catch (err) {
      console.error(`Error fetching ${dataType}:`, err);
      setError(`Failed to load ${dataType}. Please try again later.`);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dataType, config.endpoint]);

  // Set up real-time event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log(`🔌 Setting up real-time listeners for ${dataType}...`);

    const handleCreated = (newItem) => {
      console.log(`➕ New ${dataType} received:`, newItem);
      setData(prev => [newItem, ...prev]);
    };

    const handleUpdated = (updatedItem) => {
      console.log(`✏️ ${dataType} updated:`, updatedItem);
      setData(prev => 
        prev.map(item => 
          item._id === updatedItem._id ? updatedItem : item
        )
      );
    };

    const handleDeleted = (deletionData) => {
      console.log(`🗑️ ${dataType} deleted:`, deletionData.id);
      setData(prev => 
        prev.filter(item => item._id !== deletionData.id)
      );
    };

    // Add event listeners
    addEventListener(config.created, handleCreated);
    addEventListener(config.updated, handleUpdated);
    addEventListener(config.deleted, handleDeleted);

    // Clean up event listeners
    return () => {
      console.log(`🔌 Cleaning up ${dataType} listeners...`);
      removeEventListener(config.created, handleCreated);
      removeEventListener(config.updated, handleUpdated);
      removeEventListener(config.deleted, handleDeleted);
    };
  }, [socket, isConnected, dataType, config, addEventListener, removeEventListener]);

  // Fetch data on mount and when connection is restored
  useEffect(() => {
    fetchData();
  }, [fetchData, isConnected]);

  // Refetch data when connection is restored
  useEffect(() => {
    if (isConnected) {
      console.log(`🔄 Connection restored, refetching ${dataType}...`);
      fetchData();
    }
  }, [isConnected, fetchData, dataType]);

  const refetch = useCallback(() => {
    console.log(`🔄 Manual refetch triggered for ${dataType}`);
    fetchData();
  }, [fetchData, dataType]);

  return {
    data,
    loading,
    error,
    refetch,
    isConnected
  };
};
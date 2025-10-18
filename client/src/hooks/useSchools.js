import { useState, useEffect } from 'react';
import { useApi } from './useApi.js';
import { useSocket } from '../context/SocketContext.js';

export const useSchools = () => {
  const { data, loading, error, refetch } = useApi('http://localhost:3001/api/schools');
  const { on, off, isConnected } = useSocket();
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    if (data) {
      setSchools(data);
    }
  }, [data]);

  useEffect(() => {
    if (!isConnected) return;

    console.log('🔌 Setting up school listeners...');

    const handleNew = (newSchool) => {
      console.log('🏫 New school:', newSchool);
      setSchools(prev => [...prev, newSchool]);
    };

    const handleUpdate = (updatedSchool) => {
      console.log('🏫 Updated school:', updatedSchool);
      setSchools(prev => 
        prev.map(item => 
          item._id === updatedSchool._id ? updatedSchool : item
        )
      );
    };

    const handleDelete = (deletedData) => {
      console.log('🏫 Deleted school:', deletedData.id);
      setSchools(prev => 
        prev.filter(item => item._id !== deletedData.id)
      );
    };

    on('school_created', handleNew);
    on('school_updated', handleUpdate);
    on('school_deleted', handleDelete);

    return () => {
      off('school_created', handleNew);
      off('school_updated', handleUpdate);
      off('school_deleted', handleDelete);
    };
  }, [on, off, isConnected]);

  return {
    schools,
    loading,
    error,
    refetch,
    isConnected
  };
};
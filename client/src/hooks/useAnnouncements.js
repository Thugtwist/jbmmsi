import { useState, useEffect } from 'react';
import { useApi } from './useApi.js';
import { useSocket } from '../context/SocketContext.js';

export const useAnnouncements = () => {
  const { data, loading, error, refetch } = useApi('http://localhost:3001/api/announcements');
  const { on, off, isConnected } = useSocket();
  const [announcements, setAnnouncements] = useState([]);

  // Set data when API response comes
  useEffect(() => {
    if (data) {
      setAnnouncements(data);
    }
  }, [data]);

  // Real-time event listeners
  useEffect(() => {
    if (!isConnected) return;

    console.log('🔌 Setting up announcement listeners...');

    const handleNew = (newAnnouncement) => {
      console.log('📢 New announcement:', newAnnouncement);
      setAnnouncements(prev => [newAnnouncement, ...prev]);
    };

    const handleUpdate = (updatedAnnouncement) => {
      console.log('📢 Updated announcement:', updatedAnnouncement);
      setAnnouncements(prev => 
        prev.map(item => 
          item._id === updatedAnnouncement._id ? updatedAnnouncement : item
        )
      );
    };

    const handleDelete = (deletedData) => {
      console.log('📢 Deleted announcement:', deletedData.id);
      setAnnouncements(prev => 
        prev.filter(item => item._id !== deletedData.id)
      );
    };

    // Register listeners
    on('announcement_created', handleNew);
    on('announcement_updated', handleUpdate);
    on('announcement_deleted', handleDelete);

    // Cleanup
    return () => {
      off('announcement_created', handleNew);
      off('announcement_updated', handleUpdate);
      off('announcement_deleted', handleDelete);
    };
  }, [on, off, isConnected]);

  return {
    announcements,
    loading,
    error,
    refetch,
    isConnected
  };
};
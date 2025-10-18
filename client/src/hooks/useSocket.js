import { useSocketContext } from '../context/SocketContext.js';

export const useSocket = () => {
  return useSocketContext();
};
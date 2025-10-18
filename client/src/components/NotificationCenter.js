import React from 'react';
import { useSocket } from '../context/SocketContext.js';

const NotificationCenter = () => {
  const { notifications, removeNotification, isConnected } = useSocket();

  return (
    <div>
      <style>
        {`
          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: slideIn 0.3s ease;
            margin-bottom: 10px;
          }
          .notification.success { background: #4CAF50; }
          .notification.info { background: #2196F3; }
          .notification.warning { background: #ff9800; }
          .notification.error { background: #f44336; }
          .notification button {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            margin-left: 10px;
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .connection-status {
            position: fixed;
            top: 10px;
            left: 10px;
            padding: 5px 10px;
            border-radius: 15px;
            color: white;
            font-size: 12px;
            z-index: 10001;
            font-weight: bold;
          }
          .connection-status.connected { background: #4CAF50; }
          .connection-status.disconnected { background: #ff9800; }
        `}
      </style>


    
    </div>
  );
};

export default NotificationCenter;
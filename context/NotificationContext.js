// NotificationContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Subscribe to incoming notifications
    console.log("Subscribing notification");
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log("Notification tapped:", response);
    });

    // Cleanup subscription
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, setNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

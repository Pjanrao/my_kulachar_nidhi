'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; // Adjust import if needed

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export default function FCMProvider() {
    const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const setupNotifications = async () => {
            if (!isAuthenticated || typeof window === 'undefined') return;

            // Wait 2 seconds to ensure Capacitor bridge and device are stable
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Only attempt native push setup if we are on a native device (Android/iOS)
            if (Capacitor.isNativePlatform()) {
                try {
                    // Create a notification channel (Required for Android 8+)
                    await PushNotifications.createChannel({
                        id: 'push-notifications',
                        name: 'Push Notifications',
                        description: 'General push notifications',
                        importance: 5, // High importance
                        visibility: 1, // Public
                        sound: 'default',
                        vibration: true
                    });
                    console.log('Notification channel created/already exists');

                    // 1. Check and Request Permission (Triggers the Android 13+ popup)
                    let permStatus = await PushNotifications.checkPermissions();

                    if (permStatus.receive === 'prompt') {
                        permStatus = await PushNotifications.requestPermissions();
                    }

                    if (permStatus.receive !== 'granted') {
                        console.warn('User denied native push notification permissions. Current status:', permStatus.receive);
                        return;
                    }

                    console.log('Push Permissions granted. Registering...');

                    // 2. Register for Push Notifications
                    // On success, this will fire the 'registration' event below
                    await PushNotifications.register();

                    // 4. Send token to your backend
                    PushNotifications.addListener('registration', async (capacitorToken) => {
                        console.log('FCM Token obtained natively:', capacitorToken.value);

                        try {
                            const res = await fetch('/api/user/fcm-token', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ token: capacitorToken.value }),
                            });

                            if (res.ok) {
                                console.log('FCM Token registered successfully to backend MongoDB');
                            } else {
                                const errData = await res.json();
                                console.error('Backend rejected FCM token:', errData);
                            }
                        } catch (err) {
                            console.error('Failed to post native token to backend', err);
                        }
                    });

                    // 5. Handle Foreground Notifications (App is OPEN)
                    PushNotifications.addListener('pushNotificationReceived', (notification) => {
                        console.log('Push received while app in foreground:', JSON.stringify(notification, null, 2));
                        // Since we added presentationOptions: ["badge", "sound", "alert"] in capacitor.config.ts,
                        // the OS should show the notification even in foreground on most Android versions.
                    });

                    // 6. Handle notification click (User taps the notification in tray)
                    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                        console.log('Push action performed:', JSON.stringify(notification, null, 2));
                        // You can navigate to a specific page here based on notification.notification.data
                    });

                    // Utility listener for any registration errors natively
                    PushNotifications.addListener('registrationError', (error: any) => {
                        console.error('Error on native registration: ' + JSON.stringify(error));
                    });

                } catch (error) {
                    console.error('Error setting up Native Push:', error);
                }
            } else {
                console.log('Web environment detected or platform is not native. Capacitor isNative:', Capacitor.isNativePlatform());
            }
        };

        setupNotifications();

        // Cleanup listeners on unmount
        return () => {
            if (Capacitor.isNativePlatform()) {
                PushNotifications.removeAllListeners();
            }
        };
    }, [isAuthenticated, token]);

    return null; // This component doesn't render anything in the UI
}

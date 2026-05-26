'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '@/redux/slices/authSlice';

/**
 * AuthInterceptor component handles global 401 errors for axios requests.
 * It clears the session and redirects to the login page when a 401 Unauthorized
 * response is received, indicating an expired or invalid token.
 */
export default function AuthInterceptor() {
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                // Handle 401 Unauthorized errors
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    // Check if we are already logged in before trying to log out
                    // and avoid redirect loops if the login page itself gets a 401 (rare)
                    const currentPath = window.location.pathname;
                    const isTokenPresent = typeof window !== 'undefined' && !!localStorage.getItem('token');
                    
                    if (isTokenPresent && !currentPath.includes('/login')) {
                        console.log('AUTH INTERCEPTOR: 401/403 detected, logging out...');
                        dispatch(logout());
                        router.push('/login');
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [dispatch, router]);

    return null;
}

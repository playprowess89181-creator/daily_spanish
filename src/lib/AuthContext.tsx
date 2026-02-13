'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  native_language: string;
  nickname: string;
  gender: string;
  age?: number;
  profile_image: string;
  date_joined: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  referral_source?: string;
  legal_notice_accepted?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: true; user: User } | { success: false; error: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '') + '/api/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Get stored tokens
  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    }
    return null;
  };

  const getRefreshToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    }
    return null;
  };

  // Store tokens
  const storeTokens = (accessToken: string, refreshToken: string, rememberMe: boolean = false) => {
    if (typeof window !== 'undefined') {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', accessToken);
      storage.setItem('refresh_token', refreshToken);
      
      // Clear from the other storage
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('access_token');
      otherStorage.removeItem('refresh_token');
    }
  };

  // Determine active storage based on where the refresh token lives
  const getActiveStorage = (): Storage | null => {
    if (typeof window === 'undefined') return null;
    if (localStorage.getItem('refresh_token')) return localStorage;
    if (sessionStorage.getItem('refresh_token')) return sessionStorage;
    return localStorage; // default
  };

  // Persist and load user profile in storage to survive reloads/network hiccups
  const storeUser = (userData: User) => {
    if (typeof window !== 'undefined') {
      const storage = getActiveStorage();
      try {
        storage?.setItem('user_profile', JSON.stringify(userData));
      } catch (e) {
        console.error('Failed to store user profile:', e);
      }
    }
  };

  const getStoredUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    const storage = getActiveStorage();
    const raw = storage?.getItem('user_profile');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch (e) {
      console.error('Failed to parse stored user profile:', e);
      return null;
    }
  };

  // Clear tokens
  const clearTokens = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    }
  };

  // Refresh access token
  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const wasRemembered = localStorage.getItem('refresh_token') === refreshToken;
        const nextRefresh = (data && typeof data.refresh === 'string' && data.refresh.length > 0) ? data.refresh : refreshToken;
        storeTokens(data.access, nextRefresh, wasRemembered);
        return true;
      } else {
        clearTokens();
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearTokens();
      setUser(null);
      return false;
    }
  };

  // Fetch user profile
  const fetchUserProfile = async (): Promise<User | null> => {
    const accessToken = getAccessToken();
    if (!accessToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/profile/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        // Persist fresh user profile
        storeUser(userData);
        return userData;
      } else if (response.status === 401) {
        // Try to refresh token
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry with new token
          const newAccessToken = getAccessToken();
          const retryResponse = await fetch(`${API_BASE_URL}/profile/`, {
            headers: {
              'Authorization': `Bearer ${newAccessToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (retryResponse.ok) {
            const userData = await retryResponse.json();
            storeUser(userData);
            return userData;
          }
        }
        return null;
      } else {
        return null;
      }
    } catch {
      // Network/CSP/etc failure: fall back to stored user if available
      const cachedUser = getStoredUser();
      if (cachedUser) return cachedUser;
      return null;
    }
  };

  // Login function
  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<{ success: true; user: User } | { success: false; error: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        storeTokens(data.access_token, data.refresh_token, rememberMe);
        setUser(data.user);
        storeUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  // Logout function
  const logout = async () => {
    const refreshToken = getRefreshToken();
    
    // Call logout API to blacklist the refresh token
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }

    clearTokens();
    setUser(null);
    router.push('/login');
  };

  // Refresh user data
  const refreshUser = async () => {
    const userData = await fetchUserProfile();
    setUser(userData);
  };

  // Update profile
  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    const accessToken = getAccessToken();
    if (!accessToken) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`${API_BASE_URL}/profile/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        setUser(responseData.user);
        storeUser(responseData.user);
        return { success: true };
      } else if (response.status === 401) {
        // Try to refresh token and retry
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          const retryResponse = await fetch(`${API_BASE_URL}/profile/update/`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${getAccessToken()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          const retryData = await retryResponse.json();
          if (retryResponse.ok) {
            setUser(retryData.user);
            storeUser(retryData.user);
            return { success: true };
          }
        }
        return { success: false, error: 'Authentication failed' };
      } else {
        return { success: false, error: responseData.error || 'Update failed' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = getAccessToken();
      if (accessToken) {
        const userData = await fetchUserProfile();
        if (userData) {
          setUser(userData);
        } else {
          // Fall back to cached user (if any) to avoid logging out on transient errors
          const cached = getStoredUser();
          if (cached) {
            setUser(cached);
          } else {
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for route protection
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user) {
        if (!user.referral_source) {
          router.push('/hear-about-us');
          return;
        }
        if (!user.legal_notice_accepted) {
          router.push('/legal-notice');
          return;
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

// Admin-only route guard
export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AdminAuthenticatedComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/login');
        } else if (!user?.is_staff) {
          router.push('/profile');
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated || !user?.is_staff) {
      return null;
    }

    return <Component {...props} />;
  };
}

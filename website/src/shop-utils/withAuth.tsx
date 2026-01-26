'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// This is a Higher-Order Component (HOC) that wraps a component
// and checks for user authentication.
const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const WithAuthComponent = (props: P) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuth = () => {
        // Check for user data in localStorage
        const user = localStorage.getItem('user');
        
        if (!user) {
          // If no user data, redirect to the login page
          router.replace('/login');
        } else {
          // If user is authenticated, stop loading
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [router]);

    // While checking for authentication, you can show a loading spinner
    // or a blank screen. This prevents a flash of unauthenticated content.
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f3ea]">
          <p>Loading...</p>
        </div>
      );
    }

    // If authenticated, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  // Set a display name for the HOC for better debugging
  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
};

export default withAuth;

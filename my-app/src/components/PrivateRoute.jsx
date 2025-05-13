import { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = () => {
  const { user, isLoading, checkUserLoggedIn } = useContext(AuthContext);
  const location = useLocation();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkUserLoggedIn();
      setIsAuthChecked(true);
    };
    
    if (!isAuthChecked) {
      verifyAuth();
    }
  }, [checkUserLoggedIn, isAuthChecked]);

  if (isLoading || !isAuthChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
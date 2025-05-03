import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { useDispatch } from 'react-redux';


const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);


  return (
    <header className="container mx-auto px-6 pt-11 md:max-w-xl">
      <div className="flex justify-between items-center w-100">
        <h1 className="text-4xl font-bold uppercase tracking-[0.5em] text-orange-500">Tosky</h1>
        <div className="flex gap-4 items-center">
          
          <button
            type="button"
            onClick={handleLogout}
            className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
            aria-label="Se déconnecter"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

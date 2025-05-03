import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../redux/slices/authSlice';
import { useTaskFilters } from '../hooks/useTaskFilters';
import MainFilters from '../components/TodoFilter/MainFilters';
import DateRangeFilter from '../components/TodoFilter/DateRangeFilter';
import SortingOptions from '../components/TodoFilter/SortingOptions';
import CategorySelect from '../components/TodoFilter/CategorySelect';

/**
 * @description Composant principal de filtrage des tâches
 * @component
 */
const TodoFilter = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isOpen, setIsOpen] = useState(false);

  const {
    isLoading,
    currentFilter,
    currentCategory,
    currentSortType,
    currentSortOrder,
    handleFilterChange,
    handleCategoryChange,
    handleSort,
    handleReset,
    handleDateRangeFilter
  } = useTaskFilters(user?._id);

  // Gestionnaire de changement de dates qui met à jour l'état local et applique le filtre
  const handleDateChange = (newDateRange) => {
    setDateRange(newDateRange);
    // Applique le filtre avec les nouvelles dates
    handleDateRangeFilter(newDateRange);
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (!user || !user._id) {
        if (window.location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      }
      if (mounted) {
        setAuthChecked(true);
        setIsAuthChecking(false);
      }
    };

    checkAuth();
    return () => { mounted = false; };
  }, [user, navigate]);

  // Afficher un loader pendant la vérification
  if (!authChecked || isAuthChecking) {
    return (
      <div className="backdrop-filter backdrop-blur-md bg-white/20 dark:bg-gray-800/30 rounded-xl shadow-lg border border-white/20 p-4 m-2">
        <p className="text-gray-700 dark:text-gray-200 text-center">
          Vérification de l&apos;authentification...
        </p>
      </div>
    );
  }

  // Ne rendre le composant que si l'authentification est vérifiée et valide
  if (!user?._id) return null;

  return (
    <>
      {/* Overlay de fond pour mobile */}
      <div
        className={`fixed inset-0 bg-black/0 backdrop-blur-sm sm:mx-auto w-80 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      
      {/* Bouton toggle pour mobile */}
      <button
        className="fixed right-4 top-4 z-50 lg:hidden rounded-full bg-white/20 p-2 backdrop-blur-md border border-white/20 hover:bg-white/30 active:scale-95 transform transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle filters"
        aria-expanded={isOpen}
        title="Ouvrir les filtres de tâches"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      <section
        className={`fixed right-0 top-0 h-screen w-72 mx-auto sm:w-65 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        } lg:relative lg:transform-none lg:translate-x-0 lg:h-auto ${
          isLoading ? 'opacity-75' : ''
        }`}
        aria-hidden={!isOpen && window.innerWidth < 1080}
      >
        <div className="backdrop-filter backdrop-blur-md bg-white/20 dark:bg-gray-800/30 rounded-xl shadow-lg border border-white/20 p-4 transition-all duration-300 hover:shadow-xl z-10 relative mt-16 mx-2 lg:mx-auto motion-safe:hover:scale-[1.02]">
          <div className="space-y-20">
            <MainFilters
              currentFilter={currentFilter}
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
            />
            
            <DateRangeFilter
              dateRange={dateRange}
              onDateChange={handleDateChange}
              isLoading={isLoading}
            />

            <div className="bg-white/30 dark:bg-gray-700/30 p-3 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Trier par</h3>
              <SortingOptions
                currentSortType={currentSortType}
                currentSortOrder={currentSortOrder}
                onSort={handleSort}
                isLoading={isLoading}
              />
              <div title="Ce filtre n'affiche que les catégories présentes dans le tableau de bord">
                <CategorySelect
                  currentCategory={currentCategory}
                  onCategoryChange={handleCategoryChange}
                  onResetFilters={handleReset}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TodoFilter;
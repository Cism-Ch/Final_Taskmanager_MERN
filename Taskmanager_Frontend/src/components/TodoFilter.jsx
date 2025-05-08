import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../redux/slices/authSlice';
import { useTaskFilters } from '../hooks/useTaskFilters';
import MainFilters from '../components/TodoFilter/MainFilters';
import DateRangeFilter from '../components/TodoFilter/DateRangeFilter';
import SortingOptions from '../components/TodoFilter/SortingOptions';
import CategorySelect from '../components/TodoFilter/CategorySelect';
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineCalendarDays,
  HiOutlineArrowsUpDown,
  HiOutlineFunnel,
  HiOutlineTag,
} from 'react-icons/hi2';

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
  // if (!user?._id) return null;

  return (
    <>
      {/* Overlay de fond pour mobile */}
      <div
        className={`fixed inset-0 bg-gray-900/30 backdrop-blur-sm w-screen h-screen transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
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
        <HiOutlineAdjustmentsHorizontal className="h-6 w-6 text-gray-700 dark:text-gray-200" />
      </button>

      <section
        className={`fixed inset-0 px-auto transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } lg:relative lg:transform-none lg:translate-x-0 lg:h-auto ${isLoading ? 'opacity-75' : ''
          }`}
        aria-hidden={!isOpen && window.innerWidth < 1080}
      >
        <div className="backdrop-filter backdrop-blur-md bg-white/20 dark:bg-gray-800/30 rounded-xl border border-white/20  transition-all duration-300 z-10 py-4 relative mt-10 md:mt-16 m-4 px-4 motion-safe:hover:scale-[1.02] min-w-[200px] max-w-[700px] lg:max-w-[700px] h-[calc(100%-5rem)] md:h-[calc(100%-8rem)] overflow-y-auto">
          <div className="space-y-10">

            <div className="text-center mt-10">
              <div className="flex items-center gap-2 justify-center">
                <HiOutlineFunnel className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Filtrage des Taches</h2>
              </div>
              
            </div>

            <div className="bg-white/30 dark:bg-gray-700/40 p-3 rounded-lg hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineFunnel className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                <h3 className="font-medium text-gray-700 dark:text-gray-200">Filtres principaux</h3>
              </div>
              <MainFilters
                currentFilter={currentFilter}
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
              />
            </div>

            <div className="bg-white/30 dark:bg-gray-700/40 p-3 rounded-lg hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineCalendarDays className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                <h3 className="font-medium text-gray-700 dark:text-gray-200">Période</h3>
              </div>
              <DateRangeFilter
                dateRange={dateRange}
                onDateChange={handleDateChange}
                isLoading={isLoading}
              />
            </div>

            <div className="bg-white/30 dark:bg-gray-700/40 p-3 rounded-lg hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineArrowsUpDown className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                <h3 className="font-medium text-gray-700 dark:text-gray-200">Trier par</h3>
              </div>
              <SortingOptions
                currentSortType={currentSortType}
                currentSortOrder={currentSortOrder}
                onSort={handleSort}
                isLoading={isLoading}
              />
              <div title="Ce filtre n'affiche que les catégories présentes dans le tableau de bord" className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineTag className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-200">Catégories</h3>
                </div>
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
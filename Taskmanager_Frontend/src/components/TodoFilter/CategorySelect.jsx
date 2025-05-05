import { memo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  selectAvailableCategories,
  selectCurrentCategory,
  selectCategoryLoading,
  selectCategoryError,
  setCurrentCategory,
  fetchUserCategories
} from '../../redux/slices/categorySlice';
import {
  HiOutlineChevronUpDown,
  HiOutlineExclamationCircle
} from 'react-icons/hi2';

const CategorySelect = memo(({
  isLoading: externalLoading
}) => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAvailableCategories);
  const currentCategory = useSelector(selectCurrentCategory);
  const loading = useSelector(selectCategoryLoading);
  const error = useSelector(selectCategoryError);
  const isAuthenticated = useSelector(state => !!state.auth.token);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserCategories());
    }
  }, [dispatch, isAuthenticated]);

  const handleCategoryChange = (value) => {
    dispatch(setCurrentCategory(value));
  };

  if (error) {
    console.error('Erreur de chargement des catégories:', error);
  }

  return (
    <div className="flex flex-col gap-1 max-w-screen-lg">
      <div className="relative">
        
        <div className="relative">
          <select
            value={currentCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full rounded-md border-gray-300 bg-white/50 pl-10 pr-8 py-1.5
              text-sm text-gray-700 shadow-sm transition-all duration-300
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500
              dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200
              disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
            disabled={loading || externalLoading}
      >
            <option value="All">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <HiOutlineChevronUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
          <HiOutlineExclamationCircle className="w-4 h-4" />
          <p>Erreur de chargement des catégories</p>
        </div>
      )}

    </div>
  );
});

CategorySelect.propTypes = {
  onResetFilters: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
};

CategorySelect.displayName = 'CategorySelect';

export default CategorySelect;
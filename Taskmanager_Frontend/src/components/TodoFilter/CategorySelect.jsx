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
      <label className="text-sm text-gray-600 dark:text-gray-300">
        Catégorie :
      </label>
      <select
        value={currentCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="w-full rounded-md border-gray-300 bg-white/50 px-3 py-1.5
          text-sm text-gray-700 shadow-sm transition-all duration-300
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500
          dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200
          disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading || externalLoading}
      >
        <option value="All">Toutes</option>
        {categories.map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-xs text-red-500 mt-1">
          Erreur de chargement des catégories
        </p>
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
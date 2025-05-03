import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeFilter,
  changeSortOrder,
  changeSortType,
  resetFilters,
  getTasksSortedByTitle,
  getTasksSortedByDate,
  getTasksByDueDate,
  getTasksByStatus,
  getOwnerTasks,
  fetchImportantTasks
} from '../redux/slices/taskSlice';

import {
  setCurrentCategory,
  selectCurrentCategory
} from '../redux/slices/categorySlice';

export const useTaskFilters = (ownerId) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  
  // États actifs
  const currentFilter = useSelector(state => state.tasks.filter);
  const currentCategory = useSelector(selectCurrentCategory);
  const currentSortType = useSelector(state => state.tasks.sortType);
  const currentSortOrder = useSelector(state => state.tasks.sortOrder);

  // Gestionnaire de filtre principal - simplifié
  const handleFilterChange = useCallback(async (newFilter) => {
    setIsLoading(true);
    try {
      // Mise à jour du filtre
      dispatch(changeFilter(newFilter));

      // Appel API selon le filtre
      switch (newFilter) {
        case "Completed":
          await dispatch(getTasksByStatus({ ownerId, status: "done" }));
          break;
        case "Active":
          await dispatch(getTasksByStatus({ ownerId, status: "pending" }));
          break;
        case "Important":
          await dispatch(fetchImportantTasks({ ownerId }));
          break;
        default:
          await dispatch(getOwnerTasks(ownerId));
          break;
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, ownerId]);

  // Gestionnaire de filtrage par plage de dates unifié
  const handleDateRangeFilter = useCallback(async (dateRange) => {
    // Validation des dates
    if (!dateRange.start || !dateRange.end) return;
    
    setIsLoading(true);
    try {
      // Utilisation de getTasksByDueDate avec la plage de dates
      await dispatch(getTasksByDueDate({
        ownerId,
        startDate: dateRange.start,
        endDate: dateRange.end
      }));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, ownerId]);

  // Gestionnaire de catégories - simplifié
  const handleCategoryChange = useCallback(async (category) => {
    setIsLoading(true);
    try {
      dispatch(setCurrentCategory(category));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Gestionnaire de tri
  const handleSort = useCallback(async ({ type, order }) => {
    if (type === 'none' || order === 'none') {
      dispatch(changeSortType('none'));
      dispatch(changeSortOrder('none'));
      return;
    }

    setIsLoading(true);
    try {
      dispatch(changeSortType(type));
      dispatch(changeSortOrder(order));
      
      if (type === 'alpha') {
        await dispatch(getTasksSortedByTitle({ ownerId, order }));
      } else if (type === 'date') {
        await dispatch(getTasksSortedByDate({ ownerId, order }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, ownerId]);

  // Réinitialisation complète
  const handleReset = useCallback(() => {
    dispatch(resetFilters());
    dispatch(setCurrentCategory('All'));
  }, [dispatch]);

  return {
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
  };
};

export default useTaskFilters;
import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getTasksSortedByTitle, 
  getTasksSortedByDate,
  changeSortOrder,
  changeSortType
} from '../redux/slices/taskSlice';

export const useTaskSorting = (ownerId) => {
  const dispatch = useDispatch();
  const sortLoading = useSelector(state => state.tasks.sortLoading);
  const sortError = useSelector(state => state.tasks.sortError);
  const pagination = useSelector(state => state.tasks.pagination);
  const currentSortType = useSelector(state => state.tasks.sortType);
  const currentSortOrder = useSelector(state => state.tasks.sortOrder);
  
  const [currentPage, setCurrentPage] = useState(1);
  const timeoutRef = useRef(null);

  // Réinitialiser la page quand le tri change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentSortType, currentSortOrder]);

  // Fonction de tri avec debounce
  const executeSort = useCallback((sortFn, value) => {
    if (value === 'none') {
      dispatch(changeSortOrder('none'));
      dispatch(changeSortType('none'));
    } else {
      dispatch(sortFn({ ownerId, order: value, page: currentPage }));
    }
  }, [dispatch, ownerId, currentPage]);

  // Debounce des fonctions de tri (300ms)
  const debouncedSort = useMemo(() => {
    return (sortFn, value) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        executeSort(sortFn, value);
      }, 300);
    };
  }, [executeSort]);

  const handleAlphaSortChange = useCallback((value) => {
    if (value === 'none') {
      dispatch(changeSortOrder('none'));
      dispatch(changeSortType('none'));
    } else {
      dispatch(changeSortType('alpha'));
      dispatch(changeSortOrder(value));
      debouncedSort(getTasksSortedByTitle, value);
    }
  }, [dispatch, debouncedSort]);

  const handleDateSortChange = useCallback((value) => {
    if (value === 'none') {
      dispatch(changeSortOrder('none'));
      dispatch(changeSortType('none'));
    } else {
      dispatch(changeSortType('date'));
      dispatch(changeSortOrder(value));
      debouncedSort(getTasksSortedByDate, value);
    }
  }, [dispatch, debouncedSort]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    if (currentSortType === 'alpha') {
      dispatch(getTasksSortedByTitle({ 
        ownerId, 
        order: currentSortOrder, 
        page 
      }));
    } else if (currentSortType === 'date') {
      dispatch(getTasksSortedByDate({ 
        ownerId, 
        order: currentSortOrder, 
        page 
      }));
    }
  }, [dispatch, ownerId, currentSortType, currentSortOrder]);

  // Cleanup du debounce au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    sortLoading,
    sortError,
    pagination,
    currentPage,
    handleAlphaSortChange,
    handleDateSortChange,
    handlePageChange
  };
};
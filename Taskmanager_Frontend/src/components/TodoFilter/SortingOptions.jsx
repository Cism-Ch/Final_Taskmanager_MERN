import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineBars3BottomLeft,
  HiOutlineBars3Bottom,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineArrowPath
} from 'react-icons/hi2';

const SortingOptions = memo(({ 
  currentSortType,
  currentSortOrder,
  onSort,
  isLoading 
}) => {
  const handleAlphaSortChange = (value) => {
    onSort({ type: value === 'none' ? 'none' : 'alpha', order: value });
  };

  const handleDateSortChange = (value) => {
    onSort({ type: value === 'none' ? 'none' : 'date', order: value });
  };
  
  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex flex-col gap-4">
        {/* Tri alphabétique */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineBars3BottomLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Tri alphabétique
            </label>
          </div>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-md border-gray-300 bg-white/50 pl-10 pr-8 py-1.5
                text-sm text-gray-700 shadow-sm transition-all duration-300
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200
                disabled:opacity-50 disabled:cursor-not-allowed"
              onChange={(e) => handleAlphaSortChange(e.target.value)}
              value={currentSortType === 'alpha' ? currentSortOrder : 'none'}
              disabled={isLoading}
            >
              <option value="none">Aucun tri</option>
              <option value="desc">A à Z</option>
              <option value="asc">Z à A</option>
            </select>
            <HiOutlineBars3Bottom className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Tri par date */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineCalendarDays className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Tri par date
            </label>
          </div>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-md border-gray-300 bg-white/50 pl-10 pr-8 py-1.5
                text-sm text-gray-700 shadow-sm transition-all duration-300
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200
                disabled:opacity-50 disabled:cursor-not-allowed"
              onChange={(e) => handleDateSortChange(e.target.value)}
              value={currentSortType === 'date' ? currentSortOrder : 'none'}
              disabled={isLoading}
            >
              <option value="none">Aucun tri</option>
              <option value="asc">Plus ancien d&apos;abord</option>
              <option value="desc">Plus récent d&apos;abord</option>
            </select>
            <HiOutlineClock className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-2">
            <HiOutlineArrowPath className="w-4 h-4 animate-spin" />
            <span>Chargement...</span>
          </div>
        )}
      </div>
    </div>
  );
});

SortingOptions.displayName = 'SortingOptions';

SortingOptions.propTypes = {
  currentSortType: PropTypes.oneOf(['none', 'alpha', 'date']).isRequired,
  currentSortOrder: PropTypes.oneOf(['none', 'asc', 'desc']).isRequired,
  onSort: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

SortingOptions.defaultProps = {
  isLoading: false
};

export default SortingOptions;
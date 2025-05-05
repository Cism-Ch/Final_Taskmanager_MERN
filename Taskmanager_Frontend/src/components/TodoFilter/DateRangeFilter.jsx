import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineCalendarDays,
  HiOutlineArrowRight,
  HiOutlineArrowLeft
} from 'react-icons/hi2';

const DateRangeFilter = memo(({ 
  dateRange,
  onDateChange,
  isLoading 
}) => {
  const handleStartDateChange = (e) => {
    onDateChange({
      ...dateRange,
      start: e.target.value
    });
  };

  const handleEndDateChange = (e) => {
    onDateChange({
      ...dateRange,
      end: e.target.value
    });
  };

  return (
    <div className="bg-white/30 dark:bg-gray-700/0 p-3 rounded-lg">
      <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
        Filtrer par date
      </h3>
      <div className="space-y-4">
        <div className="relative">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
            <HiOutlineArrowRight className="w-4 h-4" />
            <span>Date début</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={dateRange.start}
              onChange={handleStartDateChange}
              className="w-full rounded-md border-gray-300 bg-white/50 pl-10 pr-3 py-1.5
                text-sm text-gray-700 shadow-sm transition-all duration-300
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              disabled={isLoading}
            />
            <HiOutlineCalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="relative">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>Date fin</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={dateRange.end}
              onChange={handleEndDateChange}
              className="w-full rounded-md border-gray-300 bg-white/50 pl-10 pr-3 py-1.5
                text-sm text-gray-700 shadow-sm transition-all duration-300
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              disabled={isLoading}
            />
            <HiOutlineCalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
});

DateRangeFilter.propTypes = {
  dateRange: PropTypes.shape({
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired
  }).isRequired,
  onDateChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
};

DateRangeFilter.displayName = 'DateRangeFilter';

export default DateRangeFilter;
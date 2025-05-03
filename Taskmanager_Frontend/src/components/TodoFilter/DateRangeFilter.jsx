import { memo } from 'react';
import PropTypes from 'prop-types';

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
    <div className="bg-white/30 dark:bg-gray-700/30 p-3 rounded-lg">
      <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
        Filtrer par date
      </h3>
      <div className="space-y-2">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Date début:
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={handleStartDateChange}
            className="w-full rounded-md border-gray-300 bg-white/50 px-3 py-1.5
              text-sm text-gray-700 shadow-sm transition-all duration-300
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500
              dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Date fin:
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={handleEndDateChange}
            className="w-full rounded-md border-gray-300 bg-white/50 px-3 py-1.5
              text-sm text-gray-700 shadow-sm transition-all duration-300
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500
              dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            disabled={isLoading}
          />
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
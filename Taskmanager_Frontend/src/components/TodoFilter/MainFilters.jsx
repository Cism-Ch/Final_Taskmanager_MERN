import { memo } from 'react';
import PropTypes from 'prop-types';

const MainFilters = memo(({ 
  currentFilter,
  onFilterChange,
  isLoading 
}) => {
  const filters = [
    { value: 'All', label: 'Toutes' },
    { value: 'Active', label: 'Actives' },
    { value: 'Completed', label: 'Terminées' },
    { value: 'Important', label: 'Importantes' }
  ];

  return (
    <div className="bg-white/30 dark:bg-gray-700/30 p-3 rounded-lg">
      <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
        Filtres principaux
      </h3>
      <div className="flex flex-col space-y-2">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`text-left px-3 py-2 rounded-md transition-all duration-300
              ${currentFilter === value
                ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                : 'text-gray-600 hover:bg-gray-500/10 dark:text-gray-300'
              }`}
            disabled={isLoading}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
});

MainFilters.propTypes = {
  currentFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
};

MainFilters.displayName = 'MainFilters';

export default MainFilters;
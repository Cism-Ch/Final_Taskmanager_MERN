import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineListBullet,
  HiOutlineClipboardDocument,
  HiOutlineCheckCircle,
  HiOutlineStar
} from 'react-icons/hi2';

const MainFilters = memo(({ 
  currentFilter,
  onFilterChange,
  isLoading 
}) => {
  const filters = [
    { value: 'All', label: 'Toutes', icon: HiOutlineListBullet },
    { value: 'Active', label: 'Actives', icon: HiOutlineClipboardDocument },
    { value: 'Completed', label: 'Terminées', icon: HiOutlineCheckCircle },
    { value: 'Important', label: 'Importantes', icon: HiOutlineStar }
  ];

  return (
    <div className="bg-white/30 dark:bg-gray-700/0 p-3 rounded-lg">
      <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
        Filtres principaux
      </h3>
      <div className="flex flex-col space-y-2">
        {filters.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 group
              ${currentFilter === value
                ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                : 'text-gray-600 hover:bg-gray-500/10 dark:text-gray-300'
              }`}
            disabled={isLoading}
          >
            <Icon className={`w-5 h-5 ${
              currentFilter === value
                ? 'text-blue-500'
                : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'
            }`} />
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
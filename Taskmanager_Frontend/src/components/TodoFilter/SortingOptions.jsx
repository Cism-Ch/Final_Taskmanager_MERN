import { memo } from 'react';
import PropTypes from 'prop-types';

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
    <div className="flex flex-col gap-4 px-4 mb-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-100 m-2">Tri alphabétique:</label>
          <select 
            className="bg-white dark:bg-gray-500/50 border rounded px-2 py-1"
            onChange={(e) => handleAlphaSortChange(e.target.value)}
            value={currentSortType === 'alpha' ? currentSortOrder : 'none'}
            disabled={isLoading}
          >
            <option value="none">Aucun</option>
            <option value="desc">A-Z</option>
            <option value="asc">Z-A</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-100 m-2">Tri par date:</label>
          <select
            className="bg-white dark:bg-gray-500/50 border rounded px-2 py-1"
            onChange={(e) => handleDateSortChange(e.target.value)}
            value={currentSortType === 'date' ? currentSortOrder : 'none'}
            disabled={isLoading}
          >
            <option value="none">Aucun</option>
            <option value="asc">Plus ancien</option>
            <option value="desc">Plus récent</option>
          </select>
        </div>

        {isLoading && (
          <div className="text-sm text-gray-500 mt-2">
            Chargement...
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
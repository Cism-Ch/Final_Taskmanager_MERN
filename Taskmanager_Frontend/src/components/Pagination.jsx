import { memo } from 'react';
import PropTypes from 'prop-types';

const Pagination = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  disabled 
}) => {
  return (
    <div className="flex items-center justify-center gap-4 mt-4 p-3 bg-white/30 dark:bg-gray-700/30 rounded-lg">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        className="px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-600/50 text-gray-700 dark:text-gray-200 
          border border-white/20 backdrop-blur-sm transition-all duration-200
          hover:bg-white/60 dark:hover:bg-gray-500/50
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95 transform motion-safe:hover:scale-[1.02]"
        aria-label="Page précédente"
      >
        Précédent
      </button>
      
      <div className="flex items-center gap-2">
        <span className="text-gray-700 dark:text-gray-200">
          Page {currentPage} sur {totalPages}
        </span>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        className="px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-600/50 text-gray-700 dark:text-gray-200 
          border border-white/20 backdrop-blur-sm transition-all duration-200
          hover:bg-white/60 dark:hover:bg-gray-500/50
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95 transform motion-safe:hover:scale-[1.02]"
        aria-label="Page suivante"
      >
        Suivant
      </button>
    </div>
  );
});

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

Pagination.displayName = 'Pagination';

export default Pagination;
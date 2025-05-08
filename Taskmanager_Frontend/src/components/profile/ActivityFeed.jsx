import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { selectRecentActivities } from '../../redux/selectors/profileSelectors';
import Spinner from '../spinner';
import { FaPencilAlt, FaCheckCircle, FaSync, FaTrashAlt, FaArrowRight } from 'react-icons/fa';

/**
 * @typedef {Object} Activity
 * @property {('create'|'complete'|'update'|'delete')} type - Type de l'activité
 * @property {string} title - Titre de l'activité
 * @property {string} date - Date de l'activité
 * @property {string} status - Statut de l'activité
 */

/**
 * Composant affichant un élément d'activité
 * @param {Object} props - Les propriétés du composant
 * @param {Activity['type']} props.type - Type de l'activité
 * @param {string} props.title - Titre de l'activité
 * @param {string} props.date - Date de l'activité
 * @param {string} props.status - Statut de l'activité
 */

const ActivityItem = memo(({ type, title, date, status }) => {
  const getIcon = () => {
    switch (type) {
      case 'create':
        return <FaPencilAlt className="text-blue-500" />;
      case 'complete':
        return <FaCheckCircle className="text-green-500" />;
      case 'update':
        return <FaSync className="text-amber-500" />;
      case 'delete':
        return <FaTrashAlt className="text-red-500" />;
      default:
        return <FaArrowRight className="text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'pending':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'deleted':
        return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default:
        return 'text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div className="flex items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300">
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-current opacity-10 rounded-full scale-150 animate-pulse"></div>
        <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-white dark:from-gray-700/20 dark:to-gray-700 shadow-md">
          {getIcon()}
        </div>
      </div>
      <div className="flex-grow min-w-0 ml-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate pr-4 pl-4">
            {title}
          </p>
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {status}
            </span>
            <time className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {new Date(date).toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
});

ActivityItem.displayName = 'ActivityItem';

ActivityItem.propTypes = {
  type: PropTypes.oneOf(['create', 'complete', 'update', 'delete']).isRequired,
  title: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired
};

/**
 * Composant affichant le flux d'activités récentes
 * avec gestion des états de chargement et des erreurs
 */
const ActivityFeed = memo(({ isLoading, error }) => {
  const activities = useSelector(selectRecentActivities);

  if (error) {
    return (
      <div role="alert" className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
        {error}
      </div>
    );
  }

  return (
    <section
      className="mt-6 bg-white dark:bg-gray-900/50 backdrop-filter backdrop-blur-md rounded-xl shadow-lg border border-gray-100 dark:border-gray-500"
      role="region"
      aria-label="Activités récentes"
    >
      <div className="border-b border-gray-100 dark:border-gray-800 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activités récentes
        </h3>
      </div>

      <div className="p-6">
        <div
          className="divide-y divide-gray-100 dark:divide-gray-700 p-2 max-h-96 overflow-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700"
          style={{
            scrollbarGutter: 'stable',
            scrollBehavior: 'smooth'
          }}
        >
        {isLoading ? (
          <div className="flex items-center justify-center py-8" role="status" aria-label="Chargement des activités">
            <Spinner className="w-8 h-8" />
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity, index) => (
            <ActivityItem
              key={`${activity.type}-${index}`}
              {...activity}
            />
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 animate-fadeIn">
              Aucune activité récente
            </p>
          </div>
        )}
      </div>
      </div>
    </section>
  );
});

ActivityFeed.displayName = 'ActivityFeed';

ActivityFeed.propTypes = {
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

export default ActivityFeed;
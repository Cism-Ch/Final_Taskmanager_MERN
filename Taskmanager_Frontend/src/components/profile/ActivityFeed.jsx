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
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'deleted':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-white/20 dark:bg-gray-800/30 rounded-2xl transition-all duration-300 hover:bg-white/30 dark:hover:bg-gray-800/40">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/30 dark:bg-gray-700/50">
        {getIcon()}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {title}
        </p>
        <p className={`text-sm ${getStatusColor()}`}>
          {status}
        </p>
        <time className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(date).toLocaleString()}
        </time>
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
      className="mt-6 bg-white/10 dark:bg-black/10 rounded-xl p-6 shadow-lg backdrop-blur-md border border-gray-200 dark:border-slate-500"
      role="region"
      aria-label="Activités récentes"
    >
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Activités récentes
      </h3>

      <div 
        className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
        style={{
          scrollbarGutter: 'stable',
          scrollBehavior: 'smooth'
        }}
      >
        {isLoading ? (
          <div className="py-4 flex justify-center" role="status" aria-label="Chargement des activités">
            <Spinner />
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity, index) => (
            <ActivityItem
              key={`${activity.type}-${index}`}
              {...activity}
            />
          ))
        ) : (
          <p className="py-4 text-center text-gray-500 dark:text-gray-400 animate-fadeIn">
            Aucune activité récente
          </p>
        )}
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
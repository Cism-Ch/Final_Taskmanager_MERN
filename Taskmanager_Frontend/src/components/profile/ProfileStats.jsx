import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { selectTaskStats } from '../../redux/selectors/profileSelectors';
import {
  MdAssignment,
  MdPendingActions,
  MdDeleteForever,
  MdStarRate,
  MdTaskAlt
} from 'react-icons/md';

const StatCard = ({ title, value, icon, description }) => (
  <div
    className="bg-white dark:bg-gray-900/70 rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-gray-100 dark:border-gray-800"
    role="article"
    aria-label={`Statistique: ${title}`}
  >
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-primary-500/10 dark:bg-primary-400/10 rounded-full scale-150 animate-pulse"></div>
      <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-white dark:from-primary-900 dark:to-primary-800 shadow-lg transform hover:scale-110 transition-all duration-300">
        <span
          className="text-primary-600 dark:text-primary-300"
          role="img"
          aria-label={`Icône ${title}`}
        >
          {icon}
        </span>
      </div>
    </div>
    
    <div>
      <span
        className="block text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-300 dark:from-black-400 dark:to-black-300 mb-4"
        aria-label={`${value} ${title}`}
      >
        {value}
      </span>
      <h4 className="text-base font-medium text-gray-600 dark:text-gray-300 mb-2">
        {title}
      </h4>
      {description && (
        <p
          className="text-sm text-gray-500 dark:text-gray-400"
          aria-label={description}
        >
          {description}
        </p>
      )}
    </div>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.node.isRequired,
  description: PropTypes.string
};

const ProfileStats = () => {
  const stats = useSelector(selectTaskStats);
  
  const statCards = useMemo(() => [
    {
      title: "Total des tâches",
      value: stats?.total || 0,
      icon: <MdAssignment className="text-2xl" />,
      description: "Nombre total de tâches"
    },
    {
      title: "Tâches en attente",
      value: stats?.pending || 0,
      icon: <MdPendingActions className="text-2xl" />,
      description: "Tâches en cours de traitement"
    },
    {
      title: "Tâches supprimées",
      value: stats?.deleted || 0,
      icon: <MdDeleteForever className="text-2xl" />,
      description: "Tâches supprimées jusqu'à présent"
    },
    {
      title: "Tâches importantes",
      value: stats?.important || 0,
      icon: <MdStarRate className="text-2xl" />,
      description: "Tâches marquées comme importantes"
    },
    {
      title: "Tâches terminées",
      value: stats?.completed || 0,
      icon: <MdTaskAlt className="text-2xl" />,
      description: "Tâches complétées avec succès"
    }
  ], [stats?.total, stats?.pending, stats?.deleted, stats?.important, stats?.completed]);

  return (
    <section className="py-6" role="region" aria-label="Statistiques utilisateur">
      <div className="container mx-auto px-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Statistiques
        </h3>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProfileStats;
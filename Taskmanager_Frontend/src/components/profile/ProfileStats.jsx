import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { selectTaskStats } from '../../redux/selectors/profileSelectors';
import { FaClipboardList, FaHourglass, FaTrash, FaStar, FaCheckCircle } from 'react-icons/fa';

const StatCard = ({ title, value, icon, description }) => (
  <div
    className="flex items-center w-full bg-white/50 dark:bg-gray-900/40 rounded-full shadow-lg py-3 px-4 hover:bg-white/10 dark:hover:bg-gray-900/50 transition-all duration-300 backdrop-blur-sm hover:shadow-xl motion-safe:hover:scale-[1.02]"
    role="article"
    aria-label={`Statistique: ${title}`}
  >
    <span
      className="text-xl text-primary-500 dark:text-primary-400 mr-3"
      role="img"
      aria-label={`Icône ${title}`}
    >
      {icon}
    </span>
    <div className="flex flex-grow justify-between items-center">
      <div className="flex items-center gap-2">
        <span
          className="text-xl font-bold text-gray-900 dark:text-white"
          aria-label={`${value} ${title}`}
        >
          {value}
        </span>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h4>
      </div>
      {description && (
        <p
          className="text-xs text-gray-600 dark:text-gray-400 ml-auto"
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
  
  console.group('ProfileStats - Debug');
  console.log('Stats reçues:', stats);
  console.log('Détail des stats:', {
    total: stats?.total,
    deleted: stats?.deleted,
    completed: stats?.completed,
    important: stats?.important
  });
  console.groupEnd();
  
  const statCards = useMemo(() => [
    {
      title: "Total des tâches",
      value: stats?.total || 0,
      icon: <FaClipboardList />,
      description: "Nombre total de tâches"
    },
    {
      title: "Tâches en attente",
      value: stats?.pending || 0,
      icon: <FaHourglass />,
      description: "Tâches en cours de traitement"
    },
    {
      title: "Tâches supprimées",
      value: stats?.deleted || 0,
      icon: <FaTrash />,
      description: "Tâches supprimées jusqu'à présent"
    },
    {
      title: "Tâches importantes",
      value: stats?.important || 0,
      icon: <FaStar />,
      description: "Tâches marquées comme importantes"
    },
    {
      title: "Tâches terminées",
      value: stats?.completed || 0,
      icon: <FaCheckCircle />,
      description: "Tâches complétées avec succès"
    }
  ], [stats?.total, stats?.pending, stats?.deleted, stats?.important, stats?.completed]);

  return (
    <section
      className="m-12 p-6 rounded-xl"
      role="region"
      aria-label="Statistiques utilisateur"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Statistiques
      </h3>
      <div className="flex flex-col gap-3">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </section>
  );
};

export default ProfileStats;
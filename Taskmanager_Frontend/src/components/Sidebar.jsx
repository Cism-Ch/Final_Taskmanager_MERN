import { useSelector, useDispatch } from 'react-redux';
import { selectAllTasks } from '../redux/slices/taskSlice';
import {
  selectAvailableCategories,
  selectCurrentCategory,
  setCurrentCategory
} from '../redux/slices/categorySlice';
import { Link } from 'react-router-dom';
import ProfileHeader from './profile/ProfileHeader';

const Sidebar = () => {
  const tasks = useSelector(selectAllTasks);
  const categories = useSelector(selectAvailableCategories);
  const currentCategory = useSelector(selectCurrentCategory);
  const dispatch = useDispatch();

  // Calculer les statistiques
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  // Calculer le nombre de tâches par catégorie
  const tasksByCategory = categories.reduce((acc, category) => {
    acc[category] = tasks.filter(t => t.category === category).length;
    return acc;
  }, {});

  // Générer une couleur unique par catégorie
  const getCategoryColor = (category, index) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-amber-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  // Formater la date
  const formatDate = (date) => {
    if (!date) return '';
    const options = { 
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="backdrop-filter backdrop-blur-md bg-white/20 dark:bg-gray-800/30 rounded-xl shadow-lg border border-white/20 p-4 lg:p-3 xl:p-4 transition-all duration-300 hover:shadow-xl  motion-safe:hover:scale-[1.02] z-10 relative  mx-2 my-16 md:mb-4 lg:mx-4">
      <div className="flex flex-col space-y-6 lg:space-y-5 xl:space-y-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center sm:p-2">
          <Link to="/profile" className="transform hover:scale-105 transition-transform duration-200">
            <ProfileHeader size="small" showActions={false} className="mb-2" />
          </Link>
          <div className="text-center mt-1">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Tableau de bord</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gérer vos tâches</p>
          </div>
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-700" />
        
        {/* Stats Section */}
        <div className="bg-white/30 dark:bg-gray-700/30 p-3 lg:p-2.5 xl:p-3 rounded-lg hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
          <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Statistiques</h3>
          <div className="grid grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2">
            <div className="bg-blue-500/20 p-3 lg:p-2.5 xl:p-3 rounded-md flex-1 hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
              <p className="font-bold text-gray-800 dark:text-white">{totalTasks}</p>
            </div>
            <div className="bg-green-500/20 p-3 lg:p-2.5 xl:p-3 rounded-md flex-1 hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
              <p className="text-sm text-gray-600 dark:text-gray-300">Terminées</p>
              <p className="font-bold text-gray-800 dark:text-white">{completedTasks}</p>
            </div>
            <div className="bg-yellow-500/20 p-3 lg:p-2.5 xl:p-3 rounded-md flex-1 hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
              <p className="text-sm text-gray-600 dark:text-gray-300">En cours</p>
              <p className="font-bold text-gray-800 dark:text-white">{pendingTasks}</p>
            </div>
          </div>
        </div>
        
        {/* Section Catégories */}
        <div className="bg-white/30 dark:bg-gray-700/30 p-3 rounded-lg hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all ">
          <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Catégories</h3>
          <ul className="space-y-1 grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-2">
            <li 
              onClick={() => dispatch(setCurrentCategory('All'))}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                currentCategory === 'All'
                  ? 'bg-white/40 dark:bg-gray-600/40' 
                  : 'hover:bg-white/30 dark:hover:bg-gray-600/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-sm text-gray-700 dark:text-gray-200">Toutes</span>
              </div>
              <span className="text-xs bg-gray-500/20 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
                {totalTasks}
              </span>
            </li>
            {categories.map((category, index) => (
              <li 
                key={category}
                onClick={() => dispatch(setCurrentCategory(category))}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                  currentCategory === category
                    ? 'bg-white/40 dark:bg-gray-600/40' 
                    : 'hover:bg-white/30 dark:hover:bg-gray-600/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(category, index)}`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">{category}</span>
                </div>
                <span className="text-xs bg-gray-500/20 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
                  {tasksByCategory[category]}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Activité Récente */}
        <div className="bg-white/30 dark:bg-gray-700/30 p-3 rounded-lg hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
          <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Activité Récente</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {tasks.slice(0, 3).map((task) => (
              <div key={task._id} className="text-xs p-2 bg-white/30 dark:bg-gray-600/30 rounded-md">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {task.title}
                  </span>
                  <div className="flex flex-wrap gap-2 items-center">
                    {task.category && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300">
                        {task.category}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      task.status === 'done' 
                        ? 'bg-green-500/20 text-green-700 dark:text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {task.status === 'done' ? 'Terminée' : 'En cours'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllTasks } from '../redux/slices/taskSlice';
import { selectUser } from '../redux/slices/authSlice';
import {
  selectAvailableCategories,
  selectCurrentCategory,
  setCurrentCategory
} from '../redux/slices/categorySlice';
import { Link } from 'react-router-dom';
import ProfileHeader from './profile/ProfileHeader';
import {
  HiOutlineSquares2X2,
  HiOutlineChartBar,
  HiOutlineTag,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineChartBarSquare,
  HiOutlineClipboardDocumentList
} from 'react-icons/hi2';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const tasks = useSelector(selectAllTasks);
  const categories = useSelector(selectAvailableCategories);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
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
    const colorSets = [
      { bg: 'bg-blue-500/20', text: 'text-blue-500', icon: 'text-blue-600' },
      { bg: 'bg-green-500/20', text: 'text-green-500', icon: 'text-green-600' },
      { bg: 'bg-purple-500/20', text: 'text-purple-500', icon: 'text-purple-600' },
      { bg: 'bg-amber-500/20', text: 'text-amber-500', icon: 'text-amber-600' },
      { bg: 'bg-pink-500/20', text: 'text-pink-500', icon: 'text-pink-600' },
      { bg: 'bg-indigo-500/20', text: 'text-indigo-500', icon: 'text-indigo-600' },
      { bg: 'bg-teal-500/20', text: 'text-teal-500', icon: 'text-teal-600' },
      { bg: 'bg-orange-500/20', text: 'text-orange-500', icon: 'text-orange-600' }
    ];
    return colorSets[index % colorSets.length];
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


  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (!user || !user._id) {
        if (window.location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      }
      if (mounted) {
        setAuthChecked(true);
        setIsAuthChecking(false);
      }
    };

    checkAuth();
    return () => { mounted = false; };
  }, [user, navigate]);
  // Afficher un loader pendant la vérification
  if (!authChecked || isAuthChecking) {
    return (
      <div className="backdrop-filter backdrop-blur-md bg-white/20 dark:bg-gray-800/30 rounded-xl shadow-lg border border-white/20 p-4 m-2">
        <p className="text-gray-700 dark:text-gray-200 text-center">
          Vérification de l&apos;authentification...
        </p>
      </div>
    );
  }

  return (
    <div className="backdrop-filter backdrop-blur-md bg-white/20 dark:bg-gray-800/30 rounded-xl shadow-lg border border-white/20 p-4 lg:p-3 xl:p-4 transition-all duration-300 hover:shadow-xl  motion-safe:hover:scale-[1.02] z-10 relative  mx-2 my-16 md:mb-4 lg:mx-4">
      <div className="flex flex-col space-y-6 lg:space-y-5 xl:space-y-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center sm:p-2">
          <Link to="/profile" className="transform hover:scale-105 transition-transform duration-200">
            <ProfileHeader size="small" showActions={false} className="mb-2" />
          </Link>
          <div className="text-center mt-1">
            <div className="flex items-center gap-2 justify-center">
              <HiOutlineSquares2X2 className="w-6 h-6 text-gray-800 dark:text-white" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Tableau de bord</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 justify-center mt-1">
              <HiOutlineClipboardDocumentList className="w-4 h-4" />
              <span>Gérer vos tâches</span>
            </p>
          </div>
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-700" />

        {/* Stats Section */}
        <div className="bg-white/30 dark:bg-gray-700/30 p-3 lg:p-2.5 xl:p-3 rounded-lg hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineChartBarSquare className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Statistiques</h3>
          </div>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
            <div className="bg-blue-500/20 p-3 lg:p-2.5 xl:p-3 rounded-md flex-1 hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-2">
                <HiOutlineChartBar className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
              </div>
              <p className="justify-items-end font-bold text-gray-800 dark:text-white mt-1">{totalTasks}</p>
            </div>
            <div className="bg-green-500/20 p-3 lg:p-2.5 xl:p-3 rounded-md flex-1 hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-2">
                <HiOutlineCheck className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Terminées</p>
              </div>
              <p className="font-bold text-gray-800 dark:text-white mt-1">{completedTasks}</p>
            </div>
            <div className="bg-yellow-500/20 p-3 lg:p-2.5 xl:p-3 rounded-md flex-1 hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-2">
                <HiOutlineClock className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <p className="text-sm text-gray-600 dark:text-gray-300">En cours</p>
              </div>
              <p className="font-bold text-gray-800 dark:text-white mt-1">{pendingTasks}</p>
            </div>
          </div>
        </div>

        {/* Section Catégories */}
        <div className="bg-white/30 dark:bg-gray-700/30 p-3 rounded-lg hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all ">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineTag className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Catégories</h3>
          </div>
          <ul className="space-y-1 grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-2">
            <li
              onClick={() => dispatch(setCurrentCategory('All'))}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${currentCategory === 'All'
                  ? 'bg-white/40 dark:bg-gray-600/40'
                  : 'hover:bg-white/30 dark:hover:bg-gray-600/30'
                }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-500/20 flex items-center justify-center">
                  <HiOutlineClipboardDocumentList className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                </div>
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
                className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-300 ${currentCategory === category
                    ? 'bg-white/40 dark:bg-gray-600/40'
                    : 'hover:bg-white/30 dark:hover:bg-gray-600/30'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${getCategoryColor(category, index).bg} flex items-center justify-center transition-all duration-300 group-hover:ring-2 ring-offset-2 ring-offset-white/20 dark:ring-offset-gray-800/30 ${getCategoryColor(category, index).text.replace('text-', 'ring-')}`}>
                    <HiOutlineTag className={`w-3.5 h-3.5 ${getCategoryColor(category, index).icon}`} />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">{category}</span>
                </div>
                <span className="text-xs bg-gray-500/20 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300 group-hover:bg-gray-500/30 transition-colors duration-300">
                  {tasksByCategory[category]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Activité Récente */}
        <div className="bg-white/30 dark:bg-gray-700/30 p-3 rounded-lg hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineChartBarSquare className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Activité Récente</h3>
          </div>
          <div className="space-y-2 max-h-50 overflow-y-auto">
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
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <HiOutlineClock className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${task.status === 'done'
                        ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                        : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                      }`}>
                      <span className="flex items-center gap-1">
                        {task.status === 'done' ? (
                          <>
                            <HiOutlineCheck className="w-3 h-3" />
                            <span>Terminée</span>
                          </>
                        ) : (
                          <>
                            <HiOutlineClock className="w-3 h-3" />
                            <span>En cours</span>
                          </>
                        )}
                      </span>
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

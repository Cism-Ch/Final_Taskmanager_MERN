import { useState } from 'react';
import { Header, TodoComputed, TodoCreate, TodoFilter, TodoList, Sidebar, Footer } from '../components';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllTasks, getFilter, getOwnerTasks } from '../redux/slices/taskSlice';
import { selectUser } from '../redux/slices/authSlice';
import { useEffect } from 'react';

const Home = () => {
  const dispatch = useDispatch();
  const tasks = useSelector(selectAllTasks);
  const user = useSelector(selectUser);
  const filter = useSelector(getFilter);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  
  const itemsLeft = tasks.filter((task) => task.status === 'pending').length;

  useEffect(() => {
    if (user && user._id) {
      dispatch(getOwnerTasks(user._id));
    }
  }, [dispatch, user]);
  
  const filteredTasks = () => {
    switch (filter) {
      case 'all': return tasks;
      case 'active': return tasks.filter((task) => task.status === 'pending');
      case 'completed': return tasks.filter((task) => task.status === 'done');
      default: return tasks;
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleFilter = () => setFilterOpen(!filterOpen);

  return (
    <div className="min-h-screen bg-gray-300 dark:bg-black dark:bg-[url('./assets/images/bg-dark02.jpg')] bg-cover bg-no-repeat">
      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent"></div>
      
      {/* Layout Grid */}
      <div className="relative grid min-h-screen
        grid-cols-1 lg:grid-cols-[1fr,2fr,1fr]
        grid-rows-[1fr,auto]">
        
        {/* Mobile Controls */}
        <div className="lg:hidden fixed bottom-4 right-4 flex flex-col gap-3 z-50">
          <button
            onClick={toggleSidebar}
            className="p-3 bg-white/20 dark:bg-gray-800/30 backdrop-blur-md rounded-full shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200"
            aria-label="Ouvrir le menu latéral"
            aria-expanded={sidebarOpen}
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={toggleFilter}
            className="p-3 bg-white/20 dark:bg-gray-800/30 backdrop-blur-md rounded-full shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200"
            aria-label="Ouvrir les filtres"
            aria-expanded={filterOpen}
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
 
        {/* Overlay mobile avec fermeture au clic et animation */}
        {(sidebarOpen || filterOpen) && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-30 opacity-0 animate-fadeIn"
            onClick={() => {
              setSidebarOpen(false);
              setFilterOpen(false);
            }}
            role="presentation"
            aria-hidden="true"
          />
        )}

        {/* Sidebar - Mobile order: 2 */}
        <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:row-start-1 lg:col-start-1 lg:translate-x-0 transition-all duration-300 ease-out bg-gradient-to-r via-black/10 from-black/60 to-transparent z-40 w-72 lg:w-auto overflow-y-auto`}>
          <Sidebar />
        </aside>

        {/* Main Content - Mobile order: 1 */}
        <main className="relative row-start-1 lg:col-start-2 p-4 space-y-4 overflow-y-auto min-h-[calc(100vh-4rem)]">
          <Header />
          <TodoCreate />
          <TodoList tasks={filteredTasks()} />
          {itemsLeft > 0 && <TodoComputed itemsLeft={itemsLeft} />}
        </main>

        {/* TodoFilter - Mobile order: 3 */}
        <aside className={`fixed inset-y-0 right-0 transform ${filterOpen ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:row-start-1 lg:col-start-3 lg:translate-x-0 transition-all duration-300 ease-out bg-gradient-to-l via-black/10 from-black/60 to-transparent z-40 w-72 lg:w-auto overflow-y-auto`}>
          <TodoFilter />
        </aside>

        {/* Footer - Mobile order: 4 */}
        <footer className="row-start-2 col-span-full bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg mt-auto">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default Home;

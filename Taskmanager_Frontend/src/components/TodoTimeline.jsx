import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { IconCross } from './icons';
import { selectTaskStats, selectRecentActivities } from '../redux/selectors/profileSelectors';
import { LuCalendarDays, LuCalendarCheck2, LuActivity } from 'react-icons/lu';
import { BsFilterLeft } from 'react-icons/bs';

const TimeFilters = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month'
};

const TodoTimeline = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const tasks = useSelector(selectRecentActivities);
  const stats = useSelector(selectTaskStats);

  const [selectedFilter, setSelectedFilter] = useState(TimeFilters.WEEK);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleClose = useCallback(() => {
    if (previousFocusRef.current) { 
      previousFocusRef.current.focus();
    }
    onClose();
  }, [onClose]);

  // Filtrage des tâches selon la période sélectionnée
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      return taskDate >= start && taskDate <= end;
    });
  }, [tasks, dateRange]);

  // Groupement des tâches par date
  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce((groups, task) => {
      const date = new Date(task.date).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
      return groups;
    }, {});
  }, [filteredTasks]);

  // Gestion des filtres rapides
  const handleQuickFilter = (filter) => {
    const now = new Date();
    let start = new Date();

    switch (filter) {
      case TimeFilters.TODAY:
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case TimeFilters.WEEK:
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case TimeFilters.MONTH:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return;
    }

    setSelectedFilter(filter);
    setDateRange({
      start: start.toISOString(),
      end: new Date(now.setHours(23, 59, 59, 999)).toISOString()
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    if (modalRef.current) {
      modalRef.current.focus();
    }

    document.body.style.overflow = 'hidden';

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className="relative w-full max-w-5xl h-[80vh] backdrop-filter backdrop-blur-md bg-white/20 dark:bg-black/60 overflow-y-auto mx-auto transform rounded-xl p-6 shadow-lg border border-orange-500/50 transition-all duration-300 hover:shadow-xl motion-safe:hover:scale-[1.02]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timeline-title"
        tabIndex={-1}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 dark:text-gray-100 dark:hover:text-orange-300 transition-colors duration-200"
          aria-label="Fermer"
        >
          <IconCross />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar avec filtres et stats */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BsFilterLeft className="w-6 h-6 text-gray-700 dark:text-gray-100" />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">
                  Filtres
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.values(TimeFilters).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleQuickFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedFilter === filter
                        ? 'bg-white/40 dark:bg-gray-600/40 text-gray-800 dark:text-white shadow-lg scale-105'
                        : 'bg-white/20 dark:bg-gray-700/20 text-gray-700 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-600/30 hover:shadow-md hover:scale-105'
                    } transform hover:translate-y-[-2px]`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {filter === TimeFilters.TODAY ? (
                        <>
                          <LuCalendarCheck2 className="w-4 h-4" />
                          <span>Aujourd&apos;hui</span>
                        </>
                      ) : filter === TimeFilters.WEEK ? (
                        <>
                          <LuCalendarDays className="w-4 h-4" />
                          <span>Cette semaine</span>
                        </>
                      ) : (
                        <>
                          <LuActivity className="w-4 h-4" />
                          <span>Ce mois</span>
                        </>
                      )}
                    </span>
                  </button>
                ))}
              </div>

            </div>

            <div className="bg-white/30 dark:bg-gray-700/30 rounded-lg p-4 space-y-6 hover:shadow-xl motion-safe:hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-2">
                <LuActivity className="w-5 h-5 text-gray-700 dark:text-gray-100" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                  Progression
                </h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Total des tâches</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{stats.total}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 dark:bg-blue-400 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Tâches complétées</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {stats.completed} ({Math.round((stats.completed / stats.total) * 100) || 0}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Tâches en cours</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      {stats.pending} ({Math.round((stats.pending / stats.total) * 100) || 0}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 dark:bg-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline principale */}
          <div className="lg:col-span-3">
            <h2 
              id="timeline-title"
              className="flex items-center gap-2 text-2xl font-semibold text-gray-700 dark:text-gray-100 mb-6"
            >
              <LuCalendarDays className="w-7 h-7" />
              <span>Timeline des tâches</span>
            </h2>

            <div className="relative">
              <div
                className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200/50 dark:bg-gray-700/50"
                role="presentation"
              />

              <div className="space-y-8">
                {Object.entries(groupedTasks).map(([date, tasksForDate]) => (
                  <div key={date} className="relative">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-blue-500/70 dark:bg-blue-400/70 rounded-full absolute left-[1.125rem] transform -translate-x-1/2 transition-all duration-300 hover:scale-125" />
                      <span className="ml-12 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {new Date(date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="ml-12 space-y-4">
                      {tasksForDate.map((task, index) => (
                        <div
                          key={`${date}-${index}`}
                          className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-xl motion-safe:hover:scale-[1.02] ${
                            task.status === 'completed'
                              ? 'bg-green-50/50 dark:bg-green-900/20 border-green-200/50 dark:border-green-800/50'
                              : task.status === 'deleted'
                              ? 'bg-red-50/50 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/50'
                              : 'bg-white/30 dark:bg-gray-800/30 border-gray-200/50 dark:border-gray-700/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                {task.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className="inline-flex items-center gap-1">
                                  {task.type === 'create' ? (
                                    <>
                                      <LuCalendarCheck2 className="w-4 h-4" />
                                      <span>Créée</span>
                                    </>
                                  ) : task.type === 'update' ? (
                                    <>
                                      <LuActivity className="w-4 h-4" />
                                      <span>Mise à jour</span>
                                    </>
                                  ) : task.type === 'complete' ? (
                                    <>
                                      <LuCalendarCheck2 className="w-4 h-4" />
                                      <span>Terminée</span>
                                    </>
                                  ) : (
                                    <>
                                      <IconCross className="w-4 h-4" />
                                      <span>Supprimée</span>
                                    </>
                                  )}
                                </span>
                              </p>
                            </div>
                            <span className={`text-sm ${
                              task.status === 'completed'
                                ? 'text-green-600 dark:text-green-400'
                                : task.status === 'deleted'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-orange-600 dark:text-orange-400'
                            }`}>
                              {task.status === 'completed' ? '✓ Terminée' :
                               task.status === 'deleted' ? '× Supprimée' : '◌ En cours'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {Object.keys(groupedTasks).length === 0 && (
                  <div className="flex justify-center items-center h-40">
                    <p className="text-gray-500 dark:text-gray-400">
                      Aucune tâche pour cette période
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

TodoTimeline.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default TodoTimeline;
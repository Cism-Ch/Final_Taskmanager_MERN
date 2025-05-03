import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { selectUserProfile, selectUserInfo } from '../../redux/selectors/profileSelectors';
import { getUserStats, getProfile } from '../../redux/slices/authSlice';
import ProfileUpdateModal from './ProfileUpdateModal';
import { useProfileUpdate } from '../../hooks/useProfileUpdate';
import Skeleton from '../spinner';
import { FaGithub, FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa";
import { SiNotion } from "react-icons/si";
import { MdEmail } from "react-icons/md";

/**
 * @typedef {Object} User
 * @property {string} username - Nom d'utilisateur
 * @property {string} email - Email de l'utilisateur
 * @property {string} firstName - Prénom de l'utilisateur
 * @property {string} lastName - Nom de l'utilisateur
 * @property {string} dateOfBirth - Date de naissance
 * @property {string} gender - Genre
 * @property {string} profession - Profession
 * @property {string} job - Emploi actuel
 * @property {Object} location - Localisation
 * @property {string} location.city - Ville
 * @property {string} location.country - Pays
 * @property {string} description - Description
 * @property {string} createdAt - Date d'inscription
 * @property {string} lastLogin - Dernière connexion
 * @property {boolean} isVerified - Statut de vérification
 */

/**
 * Composant affichant les informations détaillées du profil utilisateur
 * avec gestion des états de chargement et des erreurs
 */

const ProfileInfo = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector(selectUserProfile);
  const userInfo = useSelector(selectUserInfo);
  const loadingStatus = useSelector(state => state.auth.status);
  const profileUpdateStatus = useSelector(state => state.auth.updateStatus);

  const {
    isModalOpen,
    closeModal,
    handleUpdateProfile,
    handleUpdateAvatar,
    error: updateError,
    isLoading: updateLoading
  } = useProfileUpdate();

  const isLoading = loadingStatus === 'loading' || updateLoading;

  // Chargement initial du profil
  useEffect(() => {
    if (!userProfile && loadingStatus !== 'loading') {
      console.log('Chargement initial du profil...');
      dispatch(getProfile());
    }
  }, [dispatch, userProfile, loadingStatus]);

  // Recharger après une mise à jour réussie
  useEffect(() => {
    if (profileUpdateStatus === 'succeeded') {
      console.log('Mise à jour réussie, rechargement du profil...');
      dispatch(getProfile());
    }
  }, [dispatch, profileUpdateStatus]);
  
  useEffect(() => {
    let mounted = true;
    
    const loadStats = async () => {
      if (!mounted || !userProfile?._id) return;
      
      try {
        console.log('Chargement des stats...');
         dispatch(getUserStats());
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
      }
    };
    
    loadStats();
    
    return () => { mounted = false; };
  }, [dispatch, userProfile?._id]); // Se recharge quand l'ID change

  // Effet pour recharger après une mise à jour réussie
  useEffect(() => {
    if (profileUpdateStatus === 'succeeded') {
      dispatch(getProfile());
    }
  }, [dispatch, profileUpdateStatus]);

  // Information de base mémoïsées
  const basicInfos = useMemo(() => [
    { label: "Nom d'utilisateur", value: userInfo?.username || userProfile?.username || '-' },
    { label: "Email", value: userInfo?.email || userProfile?.email || '-' },
    { label: "Date d'inscription", value: userInfo?.createdAt || (userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : '-') },
  ], [userInfo, userProfile]);

  // Informations détaillées mémoïsées
  const detailedInfos = useMemo(() => [
    { label: "Prénom", value: userInfo?.firstName || userProfile?.firstName || '-' },
    { label: "Nom", value: userInfo?.lastName || userProfile?.lastName || '-' },
    { label: "Date de naissance", value: userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : '-' },
    { label: "Genre", value: userInfo?.gender || (userProfile?.gender ?
      ({
        'homme': 'Homme',
        'femme': 'Femme',
        'autre': 'Autre',
        'non_specifie': 'Non spécifié'
      })[userProfile.gender] : '-')
    },
    { label: "Profession", value: userInfo?.profession || userProfile?.profession || '-' },
    { label: "Ville", value: userInfo?.location?.city || userProfile?.location?.city || '-' },
    { label: "Pays", value: userInfo?.location?.country || userProfile?.location?.country || '-' },
    { label: "Description", value: userInfo?.description || userProfile?.description || '-' },
  ], [userInfo, userProfile]);

  return (
    <div
      className="transition-all duration-300 animate-fadeIn"
      role="region"
      aria-label="Informations personnelles"
      aria-busy={isLoading}
    >
      {/* Gestion des erreurs */}
      {(updateError || (!userProfile && loadingStatus === 'failed')) && (
        <div role="alert" className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm text-red-700 dark:text-red-300 p-4 rounded-lg mb-4 border border-red-200/50 dark:border-red-800/50 shadow-sm animate-fadeIn">
          {updateError || 'Erreur lors du chargement du profil'}
        </div>
      )}

      {/* État de chargement initial */}
      {!userProfile && loadingStatus === 'loading' && (
        <div className="flex items-center justify-center p-8">
          <Skeleton className="w-full h-32" />
        </div>
      )}
      
      {/* Vertical Card Stack */}
      <div className="flex flex-col space-y-5">
        {/* Card 1: Informations personnelles */}
        <div className="bg-white/10 dark:bg-gray-900/80 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-gray-200/60 dark:border-slate-500/30 shadow-md hover:shadow-lg transition-all duration-300 w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200/60 dark:border-gray-100/40 flex items-center gap-2">
            <span className="inline-block w-1.5 h-6 bg-blue-500 rounded-full mr-1.5"></span>
            Informations personnelles
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {basicInfos.map(({ label, value }) => (
              <div key={label} className="group">
                <dt className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                  {label}
                </dt>
                <dd className="text-sm font-semibold text-gray-800 dark:text-gray-200 break-words bg-white/20 dark:bg-gray-800/30 p-2 rounded-md group-hover:bg-white/30 dark:group-hover:bg-gray-800/40 transition-colors duration-200">
                  {isLoading ? (
                    <Skeleton className="w-24 h-5" />
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Informations détaillées */}
        <div className="bg-white/10 dark:bg-gray-900/80 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-gray-200/60 dark:border-slate-500/30 shadow-md hover:shadow-lg transition-all duration-300 w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200/60 dark:border-gray-200/40 flex items-center gap-2">
            <span className="inline-block w-1.5 h-6 bg-blue-500 rounded-full mr-1.5"></span>
            Informations détaillées
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {detailedInfos.map(({ label, value }) => (
              <div key={label} className="group">
                <dt className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                  {label}
                </dt>
                <dd className="text-sm font-semibold text-gray-800 dark:text-gray-200 break-words bg-white/20 dark:bg-gray-800/30 p-2 rounded-md group-hover:bg-white/30 dark:group-hover:bg-gray-800/40 transition-colors duration-200">
                  {isLoading ? (
                    <Skeleton className="w-24 h-5" />
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Réseaux sociaux */}
        <div className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-gray-200/60 dark:border-slate-200/30 shadow-md hover:shadow-lg transition-all duration-300 w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200/60 dark:border-gray-700/40 flex items-center gap-2">
            <span className="inline-block w-1.5 h-6 bg-blue-500 rounded-full mr-1.5"></span>
            Mes réseaux sociaux
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            <a 
              href="https://notion.so/your-profile" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 h-10 rounded-lg border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-800/40 transition-all duration-200 group justify-center"
              aria-label="Notion"
            >
              <div className="w-7 h-7 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                <SiNotion className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </div>
              
            </a>
            
            <a 
              href="https://github.com/your-username" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 h-10 rounded-lg border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-800/40 transition-all duration-200 group justify-center"
              aria-label="GitHub"
            >
              <div className="w-7 h-7 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                <FaGithub className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </div>
              
            </a>
            
            <a 
              href="https://linkedin.com/in/your-profile" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 h-10 rounded-lg border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-800/40 transition-all duration-200 group justify-center"
              aria-label="LinkedIn"
            >
              <div className="w-7 h-7 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                <FaLinkedin className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </div>
              
            </a>
            
            <a 
              href="mailto:your-email@gmail.com" 
              className="flex items-center gap-2 p-2 h-10 rounded-lg border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-800/40 transition-all duration-200 group justify-center"
              aria-label="Gmail"
            >
              <div className="w-7 h-7 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                <MdEmail className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </div>
              
            </a>
            
            <a 
              href="https://instagram.com/your-username" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 h-10 rounded-lg border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-800/40 transition-all duration-200 group justify-center"
              aria-label="Instagram"
            >
              <div className="w-7 h-7 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                <FaInstagram className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </div>
              
            </a>
            
            <a 
              href="https://facebook.com/your-profile" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 h-10 rounded-lg border border-gray-200/30 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-800/40 transition-all duration-200 group justify-center"
              aria-label="Facebook"
            >
              <div className="w-7 h-7 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                <FaFacebook className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </div>
              
            </a>
          </div>
        </div>
      </div>
      
      <ProfileUpdateModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleUpdateProfile}
        onUpdateAvatar={handleUpdateAvatar}
        error={updateError}
        isLoading={isLoading}
      />
    </div>
  );
};


ProfileInfo.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

export default ProfileInfo;
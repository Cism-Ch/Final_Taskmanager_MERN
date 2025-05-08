import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectUserProfile } from '../../redux/selectors/profileSelectors';
import ProfileUpdateModal from './ProfileUpdateModal';
import { useProfileUpdate } from '../../hooks/useProfileUpdate';
import { PROFILE_IMAGES } from '../../config/constants';

const ProfileHeader = ({ size = 'large', showActions = true }) => {
  const userProfile = useSelector(selectUserProfile);
  const {
    isModalOpen,
    openModal,
    closeModal,
    handleUpdateProfile,
    handleUpdateAvatar,
    error,
    isLoading
  } = useProfileUpdate();

  return (
    <div className="p-4 sm:p-6 rounded-xl overflow-hidden">
      <div className={`flex flex-col sm:flex-row items-center bg-white/5 dark:bg-gray-900/80 rounded-2xl shadow-lg ${
        size === 'large' ? 'gap-4 sm:gap-6 p-4 sm:p-6' : 'gap-3 sm:gap-4 p-3 sm:p-4'
      } transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]`}>
      <div className={`relative ${
        size === 'large' ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-16 h-16'
      } transform hover:scale-[1.05] transition-all duration-300`}>
        <div className="relative w-full h-full transform transition-all duration-300 hover:rotate-3">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 rounded-full opacity-75 animate-pulse"></div>
          <img
            src={PROFILE_IMAGES.DEFAULT}
            alt={`Avatar de ${userProfile?.username || 'Utilisateur'}`}
            className="relative rounded-full w-full h-full object-cover border-2 border-white dark:border-gray-700 shadow-lg transition-all duration-300"
          />
        </div>
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
          aria-label="En ligne"
        >
          <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
        </div>
      </div>
      
      <div className="flex flex-col items-center sm:items-start transform hover:scale-[1.02] transition-all duration-300">
        <h2 className={`font-bold text-gray-700 dark:text-gray-200 ${
          size === 'large' ? 'text-xl sm:text-2xl' : 'text-base'
        } truncate max-w-[200px] sm:max-w-[250px] transition-all duration-300`}>
          {userProfile?.username || 'Utilisateur'}
        </h2>
        <p className="text-sm sm:text-base text-center sm:text-left text-gray-500 dark:text-gray-400 transition-all duration-300 mt-1">
          {userProfile?.email || 'Aucun email'}
        </p>
      </div>

      {showActions && (
        <div className="mt-4 sm:mt-0 sm:ml-auto flex gap-2 transform hover:scale-[1.02] transition-all duration-300">
          <button
            className="px-3 sm:px-4 py-2 text-sm sm:text-base font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 bg-white/20 dark:bg-gray-100/30 rounded-lg hover:bg-white/30 dark:hover:bg-gray-400/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 transform hover:scale-[1.05]"
            aria-label="Modifier le profil"
            onClick={openModal}
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'Modifier'}
          </button>
          
        </div>
      )}
      <ProfileUpdateModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleUpdateProfile}
        onUpdateAvatar={handleUpdateAvatar}
        error={error}
        isLoading={isLoading}
      />
      </div>
    </div>
  );
};

ProfileHeader.propTypes = {
  size: PropTypes.oneOf(['small', 'large']),
  showActions: PropTypes.bool
};

export default ProfileHeader;
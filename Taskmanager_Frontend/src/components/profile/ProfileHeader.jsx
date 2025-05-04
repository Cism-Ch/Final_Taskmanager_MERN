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
    <div className={`m-12 p-6 rounded-xl  overflow-auto max-h-80`}>
      <div className={`flex items-center bg-white/5 dark:bg-gray-900/80 rounded-2xl shadow-lg ${size === 'large' ? 'gap-6 p-6' : 'gap-4 p-4'} transition-all duration-300 hover:shadow-xl motion-safe:hover:scale-[1.02]`}>
      <div className={`relative ${size === 'large' ? 'w-24 h-24' : 'w-16 h-16'} md:mb-2  motion-safe:hover:scale-[1.02] transition-all` }>
        <img
          src={PROFILE_IMAGES.DEFAULT}
          alt={`Avatar de ${userProfile?.username || 'Utilisateur'}`}
          className="rounded-full w-full h-full object-cover border-2 border-gray-200 dark:border-gray-600 transition-all duration-300"
        />
        <div 
          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-1 border-gray-200"
          aria-label="En ligne"
        />
      </div>
      
      <div className="flex flex-col motion-safe:hover:scale-[1.02] transition-all">
        <h2 className={`font-bold text-gray-700 dark:text-gray-200 ${
          size === 'large' ? 'text-2xl' : 'text-base'
        } truncate max-w-[150px] transition-all duration-300`}>
          {userProfile?.username || 'Utilisateur'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 transition-all duration-300">
          {userProfile?.email || 'Aucun email'}
        </p>
      </div>

      {showActions && (
        <div className="ml-auto flex gap-2 motion-safe:hover:scale-[1.02] transition-all">
          <button
            className="px-4 py-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 bg-white/20 dark:bg-gray-100/30 rounded-lg hover:bg-white/30 dark:hover:bg-gray-400/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
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
import { Helmet } from 'react-helmet-async';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileInfo from '../components/profile/ProfileInfo';
import ProfileStats from '../components/profile/ProfileStats';
import ActivityFeed from '../components/profile/ActivityFeed';
import Footer from '../components/Footer';

const Profile = () => {
  return (
    <>
      <Helmet>
        <title>Profil utilisateur | TaskManager</title>
        <meta name="description" content="Gérez votre profil et suivez vos activités sur TaskManager" />
      </Helmet>

      <div className="container-full mx-auto px-8 py-8 bg-cover bg-black/50  bg-no-repeat dark:bg-[url('./assets/images/bg-dark02.jpg')]">
        <div className="grid grid-cols-12 gap-6">
          {/* En-tête du profil - occupe toute la largeur */}
          <div className="col-span-12 sm:col-span-12 bg-white dark:bg-gray-900/20 backdrop-blur-md rounded-xl shadow-lg">
            <ProfileHeader />
          </div>

          {/* Colonne principale - informations et statistiques */}
          <div className="col-span-12 sm:col-span-12 lg:col-span-6 space-y-6 ">
            {/* Zone des statistiques */}
            <div className="bg-white dark:bg-gray-800/20 backdrop-blur-md border border-gray-500 rounded-xl shadow-lg p-2">
              <ProfileStats />
            </div>

            {/* Flux d'activité */}
            <ActivityFeed />
          </div>

          {/* Barre latérale - informations personnelles */}
          <div className="col-span-12 lg:col-span-6 sm:col-span-12 min-w-[300px]">
            <ProfileInfo />
          </div>
          <div className="col-span-12">
            <Footer />
          </div>
          
        </div>
      </div>

      {/* Portal pour les modales de modification */}
      <div id="modal-root"></div>
    </>
  );
};

export default Profile;
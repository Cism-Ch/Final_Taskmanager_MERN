import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, updateAvatar } from '../redux/slices/authSlice';
import { validateImage } from '../utils/validation';
import { PROFILE_IMAGES, UPLOAD_CONFIG, getMediaUrl, MEDIA_URL } from '../config/constants';

function Profile_avatar() {
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageClick = () => {
        if (!isLoading) {
            fileInputRef.current?.click();
        }
    };

    const handleImageChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsLoading(true);
            setError(null);

            const validationError = await validateImage(file);
            if (validationError) {
                setError(validationError);
                return;
            }

            const formData = new FormData();
            formData.append('avatar', file);

            const result = await dispatch(updateAvatar(formData)).unwrap();
            console.log('Réponse du serveur pour updateAvatar:', {
                success: result.success,
                avatar: result.avatar,
                message: result.message
            });
            if (!result.success) {
                throw new Error(result.message || 'Erreur lors de la mise à jour');
            }
        } catch (err) {
            setError(err.message || 'Erreur lors de la mise à jour de l\'avatar');
            console.error('Erreur:', err);
        } finally {
            setIsLoading(false);
            // Réinitialiser l'input file
            event.target.value = '';
        }
    };

    return (
        <div className="relative">
            <div className={`relative ${isLoading ? 'opacity-50' : ''}`}>
                <img
                    onClick={handleImageClick}
                    className={`w-32 h-32 border-2 ${
                        isLoading ? 'border-gray-400' : 'border-blue-700 hover:border-blue-400'
                    } rounded-full transition-all duration-200 ${
                        !isLoading && 'hover:border-4 hover:cursor-pointer'
                    }`}
                    src={getMediaUrl(user?.avatar)}
                    onError={(e) => {
                        console.warn('Erreur de chargement de l\'image:', {
                            tentative: e.target.src,
                            avatar: user?.avatar,
                            mediaUrl: MEDIA_URL
                        });
                        e.target.src = PROFILE_IMAGES.DEFAULT;
                    }}
                    alt="Photo de profil"
                />
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                onChange={handleImageChange}
                accept={UPLOAD_CONFIG.ACCEPTED_TYPES.join(',')}
                className="hidden"
                disabled={isLoading}
            />

            {error && (
                <div className="absolute top-full mt-2 w-full text-center">
                    <p className="text-sm text-red-500 bg-red-100 px-2 py-1 rounded">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}

export default Profile_avatar;
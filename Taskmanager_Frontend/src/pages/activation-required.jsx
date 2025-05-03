import { useState } from 'react';
import { Link } from 'react-router-dom';
import accountImg from '../assets/images/Account.png';

const ActivationRequired = () => {
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    const handleResendActivation = async () => {
        setIsResending(true);
        setResendMessage('');
        try {
            // TODO: Implémenter l'action de renvoi du mail d'activation
            setResendMessage('Un nouveau mail d\'activation a été envoyé. Veuillez vérifier votre boîte de réception.');
        } catch (err) {
            setResendMessage('Erreur lors de l\'envoi du mail d\'activation. Veuillez réessayer plus tard.');
        }
        setIsResending(false);
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md backdrop-filter rounded-xl shadow-2xl transition-all duration-300 border border-white/20 p-6 md:p-8">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="rounded-full bg-white/20 p-4 mb-4 shadow-lg">
                        <img 
                            src={accountImg} 
                            alt="Compte non activé" 
                            className="w-20 h-20 object-contain transform transition-transform hover:scale-110 duration-300"
                        />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Activation requise
                    </h2>
                    <p className="text-gray-200 mb-6">
                        Votre compte n&apos;est pas encore activé. Veuillez vérifier votre email et cliquer sur le lien d&apos;activation.
                    </p>
                    {resendMessage && (
                        <div className={`mb-4 p-4 rounded-lg ${
                            resendMessage.includes('Erreur') 
                                ? 'bg-red-500/30 border-red-400/50' 
                                : 'bg-green-500/30 border-green-400/50'
                        } text-white`}>
                            {resendMessage}
                        </div>
                    )}
                    <button
                        onClick={handleResendActivation}
                        disabled={isResending}
                        className={`px-6 py-2 rounded-full bg-indigo-600/70 hover:bg-indigo-500 text-white font-semibold 
                            transition-all duration-300 hover:shadow-lg transform hover:scale-105 
                            backdrop-blur-sm border border-indigo-400/30 
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                            disabled:opacity-50 disabled:cursor-not-allowed
                            w-full max-w-xs mb-4`}
                    >
                        {isResending ? 'Envoi en cours...' : 'Renvoyer l\'email d\'activation'}
                    </button>
                    <Link
                        to="/login"
                        className="text-indigo-300 hover:text-indigo-200 transition-colors duration-300"
                    >
                        Retour à la page de connexion
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ActivationRequired;
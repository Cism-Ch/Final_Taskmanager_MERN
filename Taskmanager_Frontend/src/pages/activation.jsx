import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import accountImg from '../assets/images/Account.svg'
import { activation } from '../redux/slices/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../components/spinner'

const Activation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userId, token } = useParams();
    const { status, error, message, isActive } = useSelector(state => state.auth);
    const [countdown, setCountdown] = useState(3);

    const startCountdown = useCallback(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/security/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);

    useEffect(() => {
        console.log('Activation - Paramètres reçus:', { userId, token });
        if (userId && token) {
            const decodedToken = decodeURIComponent(token);
            dispatch(activation({ id: userId, token: decodedToken }))
                .unwrap()
                .then((result) => {
                    console.log('Activation réussie:', result);
                    startCountdown();
                })
                .catch((error) => {
                    console.error('Erreur d\'activation:', error);
                });
        }
    }, [dispatch, userId, token, startCountdown]);

    if (status === 'loading') {
        return <Spinner />;
    }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md backdrop-filter rounded-xl shadow-2xl transition-all duration-300 border border-white/20 p-6 md:p-8 animate-fadeIn">
        <div className="flex flex-col justify-center mb-8 items-center text-center">
          <div className="rounded-full bg-white/20 p-4 mb-4 shadow-lg animate-pulse">
            <img 
              src={accountImg} 
              alt="Compte" 
              width="100" 
              height="100" 
              className="align-text-top transform transition-transform hover:scale-110 duration-300" 
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-4 animate-fadeIn">
            Activation du compte
          </h1>
        </div>

        <div className="animate-fadeIn transition-all duration-300">
            {error && (
                <div className="mb-6 rounded-lg p-4 text-base backdrop-blur-sm bg-red-500/30 border border-red-400/50 text-white shadow-lg transform hover:scale-[1.01] transition-all duration-300" role="alert">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p>{error}</p>
                    </div>
                </div>
            )}
            {isActive && (
                <div className="mb-6 rounded-lg p-4 text-base backdrop-blur-sm bg-green-500/30 border border-green-400/50 text-white shadow-lg transform hover:scale-[1.01] transition-all duration-300" role="alert">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <p>{message}</p>
                    </div>
                </div>
            )}
        </div>

        <div className="mt-8">
            {error && (
                <div className="mb-6">
                    <div className="text-center mb-4">
                        <p className="text-red-400">{error}</p>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate('/security/login')}
                            className="px-6 py-2 rounded-full bg-indigo-600/70 hover:bg-indigo-500 text-white font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105 backdrop-blur-sm border border-indigo-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            Retour au login
                        </button>
                    </div>
                </div>
            )}
            {isActive && (
                <div className="text-center">
                    <div className="mb-4">
                        <p className="text-green-400">{message}</p>
                    </div>
                    <p className="text-white text-sm">
                        Redirection vers la page de connexion dans {countdown} seconde{countdown !== 1 ? 's' : ''}...
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default Activation
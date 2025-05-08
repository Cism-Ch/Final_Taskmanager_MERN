import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuthState, register as createAccount, setStatusToIdle } from '../redux/slices/authSlice';
import { notifications } from '../services/notifications';
import Spinner from './spinner';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function RegisterForm() {
    const [showPwd, setShowPwd] = useState(false)
    const {register, handleSubmit, formState: {errors}, getValues} = useForm()
    const {status, message} = useSelector(selectAuthState)
    const dispatch = useDispatch()

    const onHandleSubmit = (data) => {
      dispatch(createAccount(data))
        .unwrap()
        .then(() => {
          notifications.success("Inscription réussie! Un email d'activation a été envoyé.")
        })
        .catch((error) => {
          notifications.error(error?.message || "Échec de l'inscription")
        });
    };

    useEffect(() => {
      // Vérification des erreurs de validation
      Object.keys(errors).forEach(key => {
        notifications.warning(errors[key].message);
      });
    }, [errors]);
    
    useEffect(() => {
      if (['success', 'failed'].includes(status)) {
        if (status === 'success') {
          notifications.success(message || "Inscription réussie!");
        } else if (status === 'failed') {
          notifications.error(message || "Échec de l'inscription");
        }
        setTimeout(() => {
          dispatch(setStatusToIdle())
        }, 6000);
      }
    }, [dispatch, status, message]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto px-4 sm:px-6"
    >
      {(status === 'loading') && (
        <div className="flex justify-center my-6">
          <Spinner />
        </div>
      )}
      
      {/* Form with glassmorphism effect */}
      <form onSubmit={handleSubmit(onHandleSubmit)} className="backdrop-blur-lg bg-black/40 rounded-2xl shadow-lg p-8 sm:p-10 border border-white/10 relative overflow-hidden">
        {/* Glassmorphism elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>
        
        <h2 className="text-3xl font-bold text-gray-100 mb-8 text-center">Tosky</h2>
        
        <div className="space-y-6">
          {/* Email field */}
          <motion.div 
            className="relative"
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="text"
              name="email"
              {...register("email", {
                required: "Email obligatoire",
                pattern: {
                  value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                  message: "Email invalide"
                }
              })}
              className="w-full h-14 px-5 py-4 text-gray-100 bg-gray-800/50 rounded-full border border-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 outline-none backdrop-blur-sm"
              placeholder="Email"
            />
            {errors.email && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1 text-xs text-red-400 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.email.message}
              </motion.p>
            )}
          </motion.div>
          
          {/* Name field */}
          <motion.div 
            className="relative"
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="text"
              name="name"
              {...register("name", {
                required: "Veuillez entrer votre nom",
                maxLength: {
                  value: 15,
                  message: "Le nom doit tenir sur 15 caractères maximum." 
                }
              })}
              className="w-full h-14 px-5 py-4 text-gray-100 bg-gray-800/50 rounded-full border border-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 outline-none backdrop-blur-sm"
              placeholder="Nom"
            />
            {errors.name && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1 text-xs text-red-400 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.name.message}
              </motion.p>
            )}
          </motion.div>
          
          {/* Password field */}
          <motion.div 
            className="relative"
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                {...register("password", {
                  required: "Entrez votre mot de passe",
                  minLength: {
                    value: 6,
                    message: "Le mot de passe doit avoir 6 caractères au moins"
                  },
                  maxLength: {
                    value: 15,
                    message: "Le mot de passe doit avoir 15 caractères au plus"
                  }
                })}
                className="w-full h-14 px-5 py-4 text-gray-100 bg-gray-800/50 rounded-full border border-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 outline-none backdrop-blur-sm pr-12"
                placeholder="Mot de passe"
              />
              <button 
                type='button' 
                onClick={()=> setShowPwd(!showPwd)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-100 transition-all"
              >
                <i className={`fa icon ${!showPwd ? "fa-eye": "fa-eye-slash"}`}></i>
              </button>
            </div>
            {errors.password && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-red-500 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.password.message}
              </motion.p>
            )}
          </motion.div>
          
          {/* Confirm Password field */}
          <motion.div 
            className="relative"
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                name="cpassword"
                {...register("cpassword", {
                  required: "Confirmer le mot de passe!",
                  validate: (value) => {
                    const { password } = getValues();
                    return password === value || "Les mots de passe doivent correspondre!";
                  }  
                })}
                className="w-full h-14 px-5 py-4 text-gray-100 bg-gray-800/50 rounded-full border border-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 outline-none backdrop-blur-sm pr-12"
                placeholder="Confirmer le mot de passe"
              />
              <button 
                type='button' 
                onClick={()=> setShowPwd(!showPwd)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-100 transition-all"
              >
                <i className={`fa icon ${!showPwd ? "fa-eye": "fa-eye-slash"}`}></i>
              </button>
            </div>
            {errors.cpassword && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1 text-xs text-red-400 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.cpassword.message}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Form buttons */}
        <div className="mt-8 space-y-4">
          <motion.button 
            type="submit"  
            className="w-full h-14 bg-gradient-to-r from-gray-600 to-gray-600 hover:from-orange-700 hover:to-orange-700 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-400 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            S&apos;inscrire
          </motion.button>
          
          <div className="text-center">
            <Link 
              to="/security/login" 
              className="text-gray-300 hover:text-white font-medium text-sm transition-all duration-200 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour au login
            </Link>
          </div>
        </div>
      </form>
    </motion.div>
  )
}

export default RegisterForm
import { useState, useEffect } from 'react'
import { useForm } from "react-hook-form";
import { isFormInvalid } from '../utils/isFormInvalide';
import { useDispatch, useSelector } from 'react-redux'
import { authenticate, selectAuthState } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function LoginForm() {
    const [showPwd, setShowPwd] = useState(false)
    const {register, handleSubmit, formState: {errors}} = useForm()  
    const navigate = useNavigate()  
    const dispatch = useDispatch()

    const {status, isAuthenticated} = useSelector(selectAuthState)

    const onHandleSubmit = (data) => {
      dispatch(authenticate(data))
    };

    useEffect(() => {
      if (status === 'success' && isAuthenticated) {
        navigate("/home")
      }
    }, [status, isAuthenticated, navigate]);

    useEffect(() => {
      if (isFormInvalid(errors)) {
        document.getElementById('loginSubmit').classList.add(["hover:cursor-not-allowed"])
      } else {
        document.getElementById('loginSubmit').classList.remove(["hover:cursor-not-allowed"])
      }
    })

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto px-4 sm:px-6"
    >
      {/* Form with glassmorphism effect */}
      <form onSubmit={handleSubmit(onHandleSubmit)} className="backdrop-blur-md bg-black/40 rounded-2xl shadow-lg p-10 sm:p-10 border border-white/30 relative overflow-hidden">
        {/* Glassmorphism elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/30 rounded-full blur-3xl"></div>
        
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
                required: "l'Email est obligatoire!",
                pattern: {
                  value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                  message: "l'Email est invalide"
                } 
              })}
              className="w-full h-14 px-5 py-4 text-gray-100 bg-gray-800/50 rounded-full border border-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-amber-500/80 transition-all duration-200 outline-none backdrop-blur-sm"
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
                  required: "le mot de passe obligatoire.",
                  minLength: {
                    value: 6,
                    message: 'le mot de passe doit comporter au moins 6 caracteres!!'
                  }
                })}
                className="w-full h-14 px-5 py-4 text-gray-100 bg-gray-800/50 rounded-full border border-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-amber-500/50 transition-all duration-200 outline-none backdrop-blur-sm pr-12"
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
                className="mt-1 text-xs text-red-400 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.password.message}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Form buttons */}
        <div className="mt-8 space-y-4">
          <motion.button 
            type="submit"  
            id="loginSubmit"
            className="w-full h-14 bg-gradient-to-r from-gray-100 to-gray-300 hover:from-orange-700 hover:to-orange-700 text-black font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isFormInvalid(errors)}
          >
            Connexion
          </motion.button>
          
          <div className="text-center">
            <Link 
              to="/security/register" 
              className="text-gray-300 hover:text-white font-medium text-sm transition-all duration-200 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Je crée mon compte
            </Link>
          </div>
        </div>
      </form>
    </motion.div>
  )
}

export default LoginForm

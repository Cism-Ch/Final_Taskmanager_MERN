import {useEffect} from 'react'
// import { useNavigate } from 'react-router-dom'
import login from '../assets/images/undraw_login.svg'
import LoginForm from '../components/loginForm'
import { useDispatch, useSelector } from 'react-redux'
import { selectAuthState, setStatusToIdle } from '../redux/slices/authSlice'
import Spinner from '../components/spinner'


function Login() {

  // let navigate = useNavigate()

  // const handleClick = () => navigate('/security/register');

  const {status, message} = useSelector(selectAuthState)

  const dispatch = useDispatch()

  useEffect(() => {
    if (['success', 'failed'].includes(status)) {
      setTimeout(() => {
        dispatch(setStatusToIdle())
      }, 4000);
    }
    
  }, [status,dispatch]);


  return (
    <div className="w-full max-w-4xl   p-4 md:p-8 ">
        <div className="flex flex-col justify-center items-center text-center">
          <img src={login} alt="Logo" width="200" height="200" className="align-text-top" />
          <h4  className=" mt-6 mb-8 pb-1 uppercase text-2xl text-white font-semibold {connectionError ? 'mb-4': 'mb-12'} ">
            Connexion
          </h4>
         {
          (status === 'failed' && message) && (
          <div className="dark:bg-red-400 text-dark-800 p-2 text-sm rounded-full border border-red-500 ">
            { message }
          </div>)
         }
        </div>
         {
          (status === 'loading') && ( <div className="my-6"><Spinner /></div> )
         }
        <LoginForm />
    </div>
  )
}


export default Login
import registerImg from '../assets/images/login.png'
import RegisterForm from '../components/registerForm'

function Register() {
  return (
    <div className="md:mx- ">
        <div className="flex flex-col justify-center items-center text-center">
          <img src={registerImg} alt="Logo" width="100" height="100" className="align-text-top" />
          <h4  className=" mt-2 mb-4 uppercase pb-1 text-xl text-white font-semibold {connectionError ? 'mb-4': 'mb-12'} ">
            Creation de compte
          </h4>
        </div>
        <RegisterForm />
    </div>
  )
}

export default Register
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectIsAuthenticated } from '../redux/slices/authSlice'
import PropTypes from 'prop-types'

function PrivateRoute({children}) {
  const connected = useSelector(selectIsAuthenticated)
    
  return (
    connected ? children : <Navigate to={'/security/login'} replace />
  )
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
}

export default PrivateRoute
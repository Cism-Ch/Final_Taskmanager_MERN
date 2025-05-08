import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const notifications = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.info(message),
  warning: (message) => toast.warning(message)
};

export default notifications;
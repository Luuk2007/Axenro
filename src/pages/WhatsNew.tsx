import SplashScreen from '@/components/update/SplashScreen';
import { useNavigate } from 'react-router-dom';

export default function WhatsNew() {
  const navigate = useNavigate();
  return <SplashScreen forceOpen hideLoading onDismiss={() => navigate('/')} />;
}

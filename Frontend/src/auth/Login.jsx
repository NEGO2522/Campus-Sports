import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { setAuth } from '../utils/auth';
import api from '../utils/api';
import { toast } from 'react-toastify';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const redirectAfterLogin = (user) => {
    if (!user.profileCompleted) {
      navigate('/complete-profile');
    } else {
      navigate(location.state?.from?.pathname || '/dashboard');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const { token, user } = await api.post('/auth/google', {
        idToken: credentialResponse.credential,
      });
      setAuth(token, user);
      toast.success('Welcome to CampusLeague!');
      redirectAfterLogin(user);
    } catch (err) {
      toast.error(err.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6 relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ccff00] opacity-[0.05] blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 opacity-[0.05] blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="absolute inset-0 bg-[#111] rounded-[2.5rem] border border-white/10 rotate-2 scale-105" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-[#111] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ccff00] rounded-2xl text-black mb-6 rotate-3">
                <Trophy size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter mb-2">
                WELCOME TO <span className="text-[#ccff00]">CAMPUS</span>LEAGUE
              </h1>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">
                Sign up or log in with your college Google account
              </p>
            </div>

            {isLoading ? (
              <div className="py-12 text-center">
                <div className="w-10 h-10 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 font-black italic text-sm uppercase">Logging in...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google login failed')}
                    theme="filled_black"
                    size="large"
                    shape="pill"
                    text="continue_with"
                    width="320"
                  />
                </div>

                <div className="bg-[#ccff00]/5 border border-[#ccff00]/20 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Zap size={18} className="text-[#ccff00] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Login with your college email — you will only see and be able to join events from your college.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaSpinner, FaGoogle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Zap, ArrowRight } from 'lucide-react';
import { signInWithEmailLinkAuth, signInWithGoogle, completeEmailLinkSignIn } from '../firebase/firebase';
import { isProfileComplete } from '../utils/profileUtils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  const backgroundImage = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1950&q=80';

  const checkAndRedirect = async (user) => {
    try {
      const profileComplete = await isProfileComplete(user.uid);
      if (profileComplete) {
        navigate(location.state?.from?.pathname || '/dashboard');
      } else {
        navigate('/form');
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
      navigate('/form');
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      const { user, error: googleError } = await signInWithGoogle();
      if (googleError) throw new Error(googleError);
      if (user) await checkAndRedirect(user);
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const verifyEmailLink = async () => {
      if (window.location.href.includes('mode=signIn') || window.location.href.includes('__/auth/action')) {
        try {
          setIsLoading(true);
          const { user, error } = await completeEmailLinkSignIn(email, window.location.href);
          if (error) throw new Error(error);
          if (user) await checkAndRedirect(user);
        } catch (err) {
          setError(err.message || 'Failed to complete sign in');
          setIsLoading(false);
        }
      }
    };
    verifyEmailLink();
  }, [email]);

  const handleEmailLink = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const { success, error: emailError } = await signInWithEmailLinkAuth(email);
      if (emailError) throw new Error(emailError);
      if (success) setEmailSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send sign-in link');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#ccff00] selection:text-black font-sans flex items-center justify-center p-6 overflow-hidden relative">
      
      {/* --- BACKGROUND LAYER (Animation Removed) --- */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          className="w-full h-full object-cover grayscale opacity-20"
          alt="Sports Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        
        {/* Neon Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ccff00] opacity-[0.05] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 opacity-[0.05] blur-[120px] rounded-full" />
      </div>

      {/* --- LOGIN CARD --- */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* Decorative Slanted Border */}
        <div className="absolute inset-0 bg-[#111] rounded-[2.5rem] border border-white/10 rotate-2 scale-105" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-[#111] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ccff00] rounded-2xl text-black mb-6 rotate-3">
              <Trophy size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter mb-2">
              WELCOME <span className="text-[#ccff00]">BACK</span>
            </h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">
              The Arena Awaits You
            </p>
          </div>

          {isLoading && !emailSent ? (
            <div className="py-12 text-center">
              <FaSpinner className="animate-spin text-4xl text-[#ccff00] mx-auto mb-4" />
              <p className="text-gray-400 font-black italic">SYNCING STATS...</p>
            </div>
          ) : !emailSent ? (
            <div className="space-y-6">
              {/* Google Button */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full group relative flex items-center justify-center gap-3 py-4 bg-white text-black rounded-xl font-black uppercase text-sm transition-transform hover:scale-[1.02] active:scale-95"
              >
                <FaGoogle className="text-lg" />
                Continue with Google
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-gray-600 text-[10px] font-black tracking-widest uppercase">OR USE EMAIL</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailLink} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="CAMPUS EMAIL"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-gray-600 focus:outline-none focus:border-[#ccff00] transition-colors"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-[10px] font-black uppercase tracking-tight bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#ccff00] text-black py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  SEND MAGIC LINK <ArrowRight size={18} />
                </button>
              </form>
            </div>
          ) : (
            /* Success State */
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                <Zap size={40} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black italic mb-2 uppercase">Check Inbox</h3>
              <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                We've sent a link to <br/><span className="text-white">{email}</span>
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-[#ccff00] text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                Wrong Email? Go Back
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Floating Tag */}
        <div className="absolute -bottom-6 -right-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-black italic text-[10px] uppercase -rotate-6 shadow-xl">
          Secure Access
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-[10px] font-black text-gray-700 tracking-[0.3em] uppercase">
        Campus League — Authorization Protocol
      </div>
    </div>
  );
};

export default Login;
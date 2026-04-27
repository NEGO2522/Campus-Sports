import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Lock, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <Eye size={24} />,
      title: "Data Collection",
      content: "We collect information you provide directly to us, such as when you create an account, join a league, or communicate with other athletes. This includes your name, email, and campus sports stats."
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "How We Use Data",
      content: "Your data is used to maintain your player profile, generate tournament brackets, and provide real-time analytics. We never sell your personal information to third parties."
    },
    {
      icon: <Lock size={24} />,
      title: "Security",
      content: "We employ industry-standard encryption to protect your data. Your athletic legacy is safe with our secure Firebase-backed infrastructure."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#ccff00] selection:text-black font-sans">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black italic tracking-tighter mb-12 uppercase"
        >
          Privacy <span className="text-[#ccff00]">Protocol</span>
        </motion.h1>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#111] border border-white/10 p-8 rounded-[2rem] group hover:border-[#ccff00]/50 transition-colors"
            >
              <div className="text-[#ccff00] mb-4">{section.icon}</div>
              <h3 className="text-2xl font-black italic uppercase mb-4 tracking-tight">{section.title}</h3>
              <p className="text-gray-400 leading-relaxed font-medium">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <footer className="mt-20 pt-10 border-t border-white/5 text-center">
          <p className="text-gray-600 text-[10px] font-bold tracking-[0.3em] uppercase">
            Last Updated: 2025 Season
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
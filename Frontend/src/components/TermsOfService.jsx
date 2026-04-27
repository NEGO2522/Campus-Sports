import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Zap, UserX, Award, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const TermsOfService = () => {
  const navigate = useNavigate();

  const rules = [
    {
      icon: <Zap size={24} />,
      title: "User Conduct",
      content: "Campus League is a community for athletes. Harassment, cheating in scores, or unsportsmanlike behavior will result in an immediate ban from the league."
    },
    {
      icon: <Award size={24} />,
      title: "League Ownership",
      content: "Organizers are responsible for the accuracy of the matches they create. Campus League provides the OS, but the glory is earned by the players."
    },
    {
      icon: <UserX size={24} />,
      title: "Account Termination",
      content: "We reserve the right to suspend accounts that violate our community standards or attempt to exploit the platform's automation systems."
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
          Rules of <span className="text-[#ccff00]">Engagement</span>
        </motion.h1>

        <div className="grid gap-6">
          {rules.map((rule, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative overflow-hidden bg-[#111] border border-white/10 p-10 rounded-[2.5rem]"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 text-[#ccff00]">
                <Scale size={120} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[#ccff00] rounded-xl flex items-center justify-center text-black mb-6">
                  {rule.icon}
                </div>
                <h3 className="text-3xl font-black italic uppercase mb-3 tracking-tighter">{rule.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">{rule.content}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-[2rem] border border-dashed border-white/20 text-center">
          <p className="text-gray-500 font-medium italic">
            By entering the platform, you agree to play fair, play hard, and build the community.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
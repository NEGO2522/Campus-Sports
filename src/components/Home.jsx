import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { FaUsers, FaCalendarAlt, FaRunning, FaTableTennis, FaTrophy, FaRegClock, FaUserFriends } from 'react-icons/fa';
import { GiCricketBat, GiSoccerBall, GiBasketballBasket, GiVolleyballBall } from 'react-icons/gi';

// Single background image
const heroImage = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80';

const sports = [
  { 
    name: 'Football', 
    icon: <GiSoccerBall className="text-5xl" />,
    color: 'from-green-500 to-green-600',
    bg: 'bg-gradient-to-br from-green-500/10 to-green-600/20'
  },
  { 
    name: 'Basketball', 
    icon: <GiBasketballBasket className="text-5xl" />,
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-gradient-to-br from-orange-500/10 to-orange-600/20'
  },
  { 
    name: 'Table Tennis', 
    icon: <FaTableTennis className="text-4xl" />,
    color: 'from-yellow-500 to-yellow-600',
    bg: 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/20'
  },
  { 
    name: 'Badminton', 
    icon: <FaRunning className="text-5xl" />,
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-gradient-to-br from-purple-500/10 to-purple-600/20'
  },
  { 
    name: 'Cricket', 
    icon: <GiCricketBat className="text-5xl" />,
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-gradient-to-br from-amber-500/10 to-amber-600/20'
  },
  { 
    name: 'Kabaddi', 
    icon: <FaUserFriends className="text-5xl" />,
    color: 'from-red-500 to-red-600',
    bg: 'bg-gradient-to-br from-red-500/10 to-red-600/20'
  },
  { 
    name: 'Volleyball', 
    icon: <GiVolleyballBall className="text-5xl" />,
    color: 'from-indigo-500 to-indigo-600',
    bg: 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/20'
  },
];

const features = [
  {
    icon: <FaUsers className="text-5xl mb-4" />,
    title: 'Find Teammates',
    description: 'Connect with players who share your passion for sports and form teams easily.',
    color: 'from-blue-500 to-blue-600',
    iconColor: 'text-blue-500'
  },
  {
    icon: <FaCalendarAlt className="text-5xl mb-4" />,
    title: 'Schedule Games',
    description: 'Plan and organize matches during your free time with our easy scheduling system.',
    color: 'from-green-500 to-green-600',
    iconColor: 'text-green-500'
  },
  {
    icon: <FaTrophy className="text-5xl mb-4" />,
    title: 'Compete & Win',
    description: 'Join tournaments and compete with other teams to showcase your skills.',
    color: 'from-amber-500 to-amber-600',
    iconColor: 'text-amber-500'
  },
  {
    icon: <FaRegClock className="text-5xl mb-4" />,
    title: 'Save Time',
    description: 'Quickly find and join games without the hassle of manual coordination.',
    color: 'from-purple-500 to-purple-600',
    iconColor: 'text-purple-500'
  }
];

const Home = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const featuresRef = useRef(null);
  
  // Configure smooth scroll behavior
  useEffect(() => {
    window.scrollTo(0, 0);
    const html = document.documentElement;
    html.style.scrollBehavior = 'smooth';
    return () => {
      html.style.scrollBehavior = '';
    };
  }, []);
  
  const handleGetStarted = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Animation variants for page sections
  const pageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: [0.6, 0.05, 0.01, 0.9],
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-x-hidden">
      {/* Hero Section with Full Viewport */}
      <motion.section 
        className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center">
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 text-white">
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Connect. </span>
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">Play. </span>
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Excel.</span>
            </h1>
          </motion.div>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl lg:text-3xl mb-10 max-w-4xl mx-auto text-gray-200 font-medium leading-relaxed"
          >
            The ultimate platform for college athletes to connect, compete, and create unforgettable sports experiences.
          </motion.p>
          
          <motion.div variants={itemVariants} className="mt-12">
            <button 
              onClick={handleGetStarted}
              className="relative group bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-5 px-12 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/30 flex items-center space-x-3 cursor-pointer mx-auto text-lg"
            >
              <span className="relative z-10">Get Started</span>
              <motion.span 
                animate={{ x: [0, 4, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="relative z-10 text-xl"
              >
                →
              </motion.span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </motion.div>
          

        </div>
      </motion.section>
      
      {/* Features Section */}
      <motion.section 
        ref={featuresRef}
        className="relative w-full min-h-screen flex items-center justify-center py-20 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <span className="px-4 py-1 text-sm font-medium text-blue-400 bg-gray-900 rounded-lg">
                WHY CHOOSE US
              </span>
            </div>
            
            <motion.h2 
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mt-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Elevate Your Game
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Everything you need to connect, compete, and grow as an athlete
            </motion.p>
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <button 
                onClick={() => navigate('/dashboard')}
                className="relative group bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-8 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/30 flex items-center space-x-2 cursor-pointer mx-auto text-lg"
              >
                <span className="relative z-10">Start Now</span>
                <motion.span 
                  animate={{ x: [0, 4, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                  className="relative z-10 text-xl"
                >
                  →
                </motion.span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </motion.div>
          </motion.div>
        
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -15, scale: 1.02 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.2 + (index * 0.1),
                  type: "spring",
                  stiffness: 100
                }}
                className={`relative p-8 rounded-3xl overflow-hidden group ${feature.bg} border-2 border-white/10 hover:border-${feature.color.split('to-')[1].split('-')[1]}/40 transition-all duration-500`}
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-white/5 to-transparent transform rotate-45 group-hover:scale-150 group-hover:opacity-50 transition-all duration-700"></div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 ${feature.color} shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                    {React.cloneElement(feature.icon, { className: `text-4xl text-white` })}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 flex-grow">{feature.description}</p>
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;

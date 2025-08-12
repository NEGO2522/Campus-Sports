import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaChartBar, FaUsers, FaStar, FaUser, FaRunning, FaTrophy, FaBell } from 'react-icons/fa';
import Navbar from './Navbar';

const Home = () => {
  const navigate = useNavigate();
  
  // Animated text phrases
  const animatedPhrases = [
    'Leagues',
    'Create Events',
    'Join Events', 
    'Join Community',
    'Find Teammates'
  ];
  
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [activePreview, setActivePreview] = useState(0); // 0: Dashboard, 1: Events, 2: Teams

  // Animated text effect
  useEffect(() => {
    const textInterval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentPhraseIndex((prevIndex) => 
          (prevIndex + 1) % animatedPhrases.length
        );
        setIsVisible(true);
      }, 300);
      
    }, 2000);

    return () => clearInterval(textInterval);
  }, [animatedPhrases.length]);

  // Preview cycling effect
  useEffect(() => {
    const previewInterval = setInterval(() => {
      setActivePreview((prev) => (prev + 1) % 3);
    }, 3000); // Changed from 5000ms to 3000ms

    return () => clearInterval(previewInterval);
  }, []);

  const handleCreateGroup = () => {
    navigate('/dashboard');
  };

  const handleRequestDemo = () => {
    navigate('/contact');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span 
                  className={`text-green-600 transition-opacity duration-300 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ minHeight: '1.2em', display: 'inline-block' }}
                >
                  {animatedPhrases[currentPhraseIndex]}
                </span>
                <br />
                Campus League
              </h1>
              <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                The ultimate platform for managing all your campus sports activities in one place
              </p>
              
              {/* Feature Highlights */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-600 flex items-center justify-center">
                    ✓
                  </div>
                  <p className="ml-3 text-lg text-gray-700">
                    <span className="font-semibold">Create & Manage Events</span> - Easily organize and schedule sports events
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-600 flex items-center justify-center">
                    ✓
                  </div>
                  <p className="ml-3 text-lg text-gray-700">
                    <span className="font-semibold">Track Participation</span> - See who's attending and manage rosters
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-600 flex items-center justify-center">
                    ✓
                  </div>
                  <p className="ml-3 text-lg text-gray-700">
                    <span className="font-semibold">Real-time Updates</span> - Stay informed with instant notifications
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleCreateGroup}
                className="bg-green-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors cursor-pointer"
              >
                Play More, Stress Less.
              </button>
              <button 
                onClick={handleRequestDemo}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Right Column - App Previews */}
          <div className="relative h-[300px] sm:h-[350px] w-full max-w-[320px] mx-auto mt-12 md:mt-8 lg:mt-0">
            {/* Dashboard Preview Card */}
            <div 
              className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 absolute inset-0 transition-all duration-500 ease-in-out transform scale-90 hover:scale-95 ${
                activePreview === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-gray-500 ml-2">Dashboard</span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Active Events</p>
                    <p className="text-xl font-bold">12</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Total Teams</p>
                    <p className="text-xl font-bold">24</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{width: '65%'}}></div>
                </div>
                <p className="text-xs text-center mt-2 text-gray-500">Upcoming: Basketball Tournament (3 days)</p>
              </div>
            </div>

            {/* Events Preview */}
            <div 
              className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 absolute inset-0 transition-all duration-500 ease-in-out transform scale-90 hover:scale-95 ${
                activePreview === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-xs font-medium text-gray-500">Events</span>
                  </div>
                  <span className="text-xs text-blue-500 font-medium">View All</span>
                </div>
              </div>
              <div className="p-4">
                {['Basketball Tournament', 'Cricket League', 'Badminton Open'].map((event, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-xs font-medium">{event[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event}</p>
                        <p className="text-xs text-gray-500">{index + 1} day{index !== 0 ? 's' : ''} from now</p>
                      </div>
                    </div>
                    <button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                      {index % 2 === 0 ? 'Join' : 'View'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Teams Preview */}
            <div 
              className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 absolute inset-0 transition-all duration-500 ease-in-out transform scale-90 hover:scale-95 ${
                activePreview === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-xs font-medium text-gray-500">Teams</span>
                  </div>
                  <span className="text-xs text-blue-500 font-medium">View All</span>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {['Basketball Team', 'Soccer Club', 'Tennis Group'].map((team, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold mr-3">
                          {team[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{team}</p>
                          <p className="text-xs text-gray-500">{5 + index * 2} members</p>
                        </div>
                      </div>
                      <button className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {index === 0 ? 'Manage' : 'View'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Preview Navigation Dots */}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center space-x-2 z-20">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setActivePreview(index)}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    activePreview === index ? 'bg-green-600 w-6' : 'bg-gray-300'
                  }`}
                  aria-label={`Show preview ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Campus League?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Join thousands of students who are already managing their sports activities with ease</p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaUsers className="text-3xl text-green-600" />,
                title: 'Connect with Peers',
                description: 'Find and connect with fellow sports enthusiasts in your campus.'
              },
              {
                icon: <FaCalendarAlt className="text-3xl text-green-600" />,
                title: 'Easy Scheduling',
                description: 'Schedule and manage games and tournaments with just a few clicks.'
              },
              {
                icon: <FaChartBar className="text-3xl text-green-600" />,
                title: 'Track Progress',
                description: 'Monitor your team\'s performance and track your personal progress.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;

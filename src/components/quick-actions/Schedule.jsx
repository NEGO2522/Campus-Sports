import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaChevronLeft, FaChevronRight, FaPlus, FaSpinner } from 'react-icons/fa';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';

// Setup the localizer by providing moment
const localizer = momentLocalizer(moment);

// Color mapping for different sports
const sportColors = {
  'Football': '#10B981', // emerald-500
  'Basketball': '#F59E0B', // amber-500
  'Tennis': '#3B82F6', // blue-500
  'Volleyball': '#8B5CF6', // violet-500
  'default': '#6B7280' // gray-500
};

// Custom event component
const EventComponent = ({ event }) => {
  return (
    <div 
      className="p-2 text-white text-sm rounded border-l-4" 
      style={{ 
        backgroundColor: `${event.color}CC`, // Add some transparency
        borderLeftColor: event.color,
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <div className="font-medium truncate">{event.title}</div>
      <div className="text-xs opacity-90">
        {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
      </div>
    </div>
  );
};

// Custom toolbar component
const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const label = () => {
    const date = moment(toolbar.date);
    return (
      <span className="text-lg font-semibold">
        {date.format('MMMM YYYY')}
      </span>
    );
  };

  return (
    <div className="mb-3 sm:mb-4 flex flex-col xs:flex-row justify-between items-start xs:items-center space-y-2 xs:space-y-0">
      <div className="flex items-center space-x-1 xs:space-x-2">
        <h1 className="text-xl xs:text-2xl font-bold text-gray-900 mr-2 xs:mr-4">Schedule</h1>
        <div className="flex rounded-lg overflow-hidden border border-gray-300 divide-x divide-gray-300">
          <button
            onClick={() => toolbar.onView('month')}
            className={`px-2 xs:px-3 py-1 text-xs xs:text-sm ${toolbar.view === 'month' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Month
          </button>
          <button
            onClick={() => toolbar.onView('week')}
            className={`px-2 xs:px-3 py-1 text-xs xs:text-sm ${toolbar.view === 'week' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Week
          </button>
          <button
            onClick={() => toolbar.onView('day')}
            className={`px-2 xs:px-3 py-1 text-xs xs:text-sm ${toolbar.view === 'day' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Day
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 xs:space-x-2">
        <button
          onClick={goToBack}
          className="p-1.5 xs:p-2 rounded-full hover:bg-gray-100"
        >
          <FaChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <button
          onClick={goToCurrent}
          className="px-2 xs:px-3 py-1 text-xs xs:text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
        >
          Today
        </button>
        <button
          onClick={goToNext}
          className="p-1.5 xs:p-2 rounded-full hover:bg-gray-100"
        >
          <FaChevronRight className="h-4 w-4 text-gray-600" />
        </button>
        <span className="text-sm text-gray-500 hidden sm:block">
          {label()}
        </span>
      </div>
    </div>
  );
};

const Schedule = () => {
  const [view, setView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Create a query for upcoming events where the user is a participant
    const q = query(
      collection(db, 'events'),
      where('participants', 'array-contains', user.uid),
      where('status', '==', 'upcoming'),
      orderBy('dateTime')
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData = [];
      const now = new Date();
      
      querySnapshot.forEach((doc) => {
        const eventData = { id: doc.id, ...doc.data() };
        const eventDate = eventData.dateTime?.toDate ? eventData.dateTime.toDate() : new Date(eventData.dateTime);
        
        // Only include future events
        if (eventDate >= now) {
          eventsData.push({
            id: eventData.id,
            title: eventData.eventName || 'New Event',
            start: eventDate,
            end: eventData.endTime?.toDate ? eventData.endTime.toDate() : new Date(eventDate.getTime() + 2 * 60 * 60 * 1000), // Default 2 hours duration
            location: eventData.location || 'Location not specified',
            sport: eventData.sport || 'General',
            players: `${eventData.participants?.length || 0}/${eventData.playersNeeded || 0}`,
            organizer: eventData.organizer || 'Organizer not specified',
            color: eventData.sport ? (sportColors[eventData.sport] || sportColors.default) : sportColors.default,
            description: eventData.description || 'No description provided.'
          });
        }
      });
      
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error('Error getting events:', error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleNavigate = (newDate) => {
    setSelectedDate(newDate);
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        cursor: 'default', 
      },
    };
  };

  return (
    <div className="w-full py-3 sm:py-4 md:py-6 px-2 xs:px-3 sm:px-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-6 w-full">
        <div className="w-full overflow-x-auto -mx-2 xs:-mx-3 sm:mx-0">
          <div className="min-w-[300px] sm:min-w-[600px] md:min-w-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No upcoming events found.</p>
                <p className="text-sm text-gray-400 mt-1">Create an event or join one to see it here.</p>
              </div>
            ) : (
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ 
                  minHeight: '500px',
                  height: 'calc(100vh - 200px)',
                  minWidth: '300px',
                  maxWidth: '100%'
                }}
                view={view}
                onView={setView}
                onNavigate={handleNavigate}
                date={selectedDate}
                components={{
                  event: EventComponent,
                  toolbar: CustomToolbar,
                }}
                eventPropGetter={eventStyleGetter}
                selectable
                popup
                showMultiDayTimes
                step={60}
                timeslots={window.innerWidth < 640 ? 1 : 2}
                defaultView={window.innerWidth < 640 ? 'day' : 'week'}
                min={new Date(0, 0, 0, 8, 0, 0)} // 8:00 AM
                max={new Date(0, 0, 0, 22, 0, 0)} // 10:00 PM
                dayLayoutAlgorithm="no-overlap"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;


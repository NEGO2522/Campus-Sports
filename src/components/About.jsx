import React, { useEffect } from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Avatar, Divider, Button, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  EmojiEvents, SportsSoccer, Groups, School, LocationOn, Code, DesignServices, 
  SportsBasketball, SportsVolleyball, FitnessCenter, SportsEsports, SportsCricket, 
  SportsTennis, SportsKabaddi, SportsHandball, SportsHockey, SportsMartialArts, 
  Pool, SportsGymnastics, SportsMma, SportsMotorsports, SportsRugby, SportsScore, 
  SportsGolf, SportsBaseball, VideogameAsset 
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import AOS from 'aos';
import 'aos/dist/aos.css';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  margin: '0 auto',
  border: '4px solid white',
  boxShadow: theme.shadows[10],
  animation: `${float} 6s ease-in-out infinite`,
  [theme.breakpoints.up('sm')]: {
    width: theme.spacing(18),
    height: theme.spacing(18),
  },
  '&:hover': {
    animation: `${float} 3s ease-in-out infinite`,
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  background: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-10px) scale(1.02)',
    boxShadow: `0 20px 40px -10px ${theme.palette.primary.main}40`,
    '& .feature-icon': {
      transform: 'scale(1.1) rotate(5deg)',
      color: theme.palette.primary.main,
    },
  },
  [theme.breakpoints.down('sm')]: {
    margin: '0 0 16px 0',
    borderRadius: '12px',
  },
}));

const TeamMember = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  borderRadius: '16px',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #1e1e1e, #2a2a2a)' 
    : 'linear-gradient(145deg, #ffffff, #f5f5f5)',
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 15px 30px -5px ${theme.palette.primary.main}20`,
    '& .MuiAvatar-root': {
      transform: 'scale(1.05)',
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  const stats = [
    { number: '1000+', label: 'Active Users' },
    { number: '50+', label: 'Campus Events' },
    { number: '20+', label: 'Sports Categories' },
    { number: '24/7', label: 'Support' },
  ];

  const sportsCategories = [
    { icon: <SportsSoccer sx={{ fontSize: 40 }} />, name: 'Football' },
    { icon: <SportsBasketball sx={{ fontSize: 40 }} />, name: 'Basketball' },
    { icon: <SportsVolleyball sx={{ fontSize: 40 }} />, name: 'Volleyball' },
    { icon: <FitnessCenter sx={{ fontSize: 40 }} />, name: 'Fitness' },
    { icon: <SportsEsports sx={{ fontSize: 40 }} />, name: 'E-Sports' },
    { icon: <VideogameAsset sx={{ fontSize: 40 }} />, name: 'Gaming' },
    { icon: <SportsRugby sx={{ fontSize: 40 }} />, name: 'Rugby' },
    { icon: <SportsCricket sx={{ fontSize: 40 }} />, name: 'Cricket' },
    { icon: <SportsTennis sx={{ fontSize: 40 }} />, name: 'Tennis' },
    { icon: <SportsKabaddi sx={{ fontSize: 40 }} />, name: 'Kabaddi' },
    { icon: <SportsHandball sx={{ fontSize: 40 }} />, name: 'Handball' },
    { icon: <SportsHockey sx={{ fontSize: 40 }} />, name: 'Hockey' },
    { icon: <SportsMartialArts sx={{ fontSize: 40 }} />, name: 'Martial Arts' },
    { icon: <Pool sx={{ fontSize: 40 }} />, name: 'Swimming' },
    { icon: <SportsGymnastics sx={{ fontSize: 40 }} />, name: 'Gymnastics' },
    { icon: <SportsMma sx={{ fontSize: 40 }} />, name: 'MMA' },
    { icon: <SportsMotorsports sx={{ fontSize: 40 }} />, name: 'Motorsports' },
    { icon: <SportsScore sx={{ fontSize: 40 }} />, name: 'Athletics' },
    { icon: <SportsGolf sx={{ fontSize: 40 }} />, name: 'Golf' },
    { icon: <SportsBaseball sx={{ fontSize: 40 }} />, name: 'Baseball' },
  ];
  const features = [
    {
      icon: <SportsSoccer sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Sports Events',
      description: 'Discover and participate in various sports events happening across campuses.'
    },
    {
      icon: <Groups sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Team Building',
      description: 'Connect with fellow students and form teams for different sports competitions.'
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Tournaments',
      description: 'Compete in exciting tournaments and showcase your sports skills.'
    },
  ];


  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: theme.palette.mode === 'dark' ? '#181818' : '#f7f7f7',
      overflow: 'hidden',
      pt: { xs: 4, sm: 6, md: 10 },
      pb: { xs: 6, sm: 8, md: 10 },
      px: { xs: 2, sm: 3 },
      position: 'relative',
    }}>
      {/* Our Story Section */}
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, position: 'relative' }}>
        
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} data-aos="fade-up">
            <Box sx={{
              boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 24px #2228'
                : '0 4px 24px #e0e0e0',
              borderRadius: '18px',
              background: theme.palette.mode === 'dark'
                ? '#232323'
                : '#fff',
              p: { xs: 2, sm: 4, md: 5 },
              mb: 2,
              position: 'relative',
            }}>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                component="h3"
                fontWeight={700}
                gutterBottom
                sx={{
                  mb: 2,
                  letterSpacing: 0.5,
                  color: theme.palette.primary.main,
                  textShadow: `0 1px 6px ${theme.palette.primary.light}40`,
                }}
              >
                What is Campus League?
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    lineHeight: 1.8,
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    color: theme.palette.text.secondary,
                  }}
                >
                  Campus League is a modern web platform designed to simplify and energize college sports management. Our website enables students, organizers, and teams to easily create, join, and manage sports events and tournaments on campus.
                </Typography>
                
                <Box component="ul" sx={{ 
                  ml: 3, 
                  mb: 2, 
                  fontSize: '1rem', 
                  color: theme.palette.secondary.main, 
                  fontWeight: 600,
                  '& li': {
                    mb: 1,
                    '&:last-child': {
                      mb: 0
                    }
                  }
                }}>
                  <li>Event creation and registration for multiple sports</li>
                  <li>Team building and participation management</li>
                  <li>Live match updates, scores, and notifications</li>
                  <li>Role-based access for organizers and players</li>
                  <li>Real-time dashboards and activity feeds</li>
                  <li>Secure login and college-only access</li>
                </Box>
                
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    mt: 2
                  }}
                >
                  Whether you're a student athlete, a team leader, or an event organizer, Campus League provides all the tools you need to make campus sports more organized, engaging, and fun.
                </Typography>
              </Box>
              <Box sx={{ mt: 4 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(3, 1fr)',
                      md: 'repeat(4, 1fr)',
                      lg: 'repeat(5, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  {sportsCategories.slice(0, isMobile ? 6 : sportsCategories.length).map((sport, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: { xs: 1.5, sm: 2.5 },
                        borderRadius: '14px',
                        background: theme.palette.mode === 'dark' ? '#222' : '#f5f5f5',
                        boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px #1116' : '0 2px 8px #e0e0e0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          transform: 'translateY(-4px) scale(1.03)',
                          boxShadow: theme.palette.mode === 'dark' ? '0 8px 24px #111a' : '0 8px 24px #e0e0e0',
                          background: theme.palette.mode === 'dark' ? '#292929' : '#ededed',
                        },
                      }}
                    >
                      <Box sx={{
                        color: theme.palette.text.secondary,
                        mb: 1,
                        '& .MuiSvgIcon-root': {
                          fontSize: { xs: '36px', sm: '44px' },
                        },
                      }}>
                        {sport.icon}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          fontWeight: 700,
                          fontSize: { xs: '0.8rem', sm: '1rem' },
                          textAlign: 'center',
                          color: theme.palette.primary.main,
                          letterSpacing: 0.5,
                        }}
                      >
                        {sport.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                {isMobile && sportsCategories.length > 6 && (
                  <Typography
                    variant="body2"
                    sx={{
                      textAlign: 'center',
                      mt: 2,
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      fontWeight: 500,
                    }}
                  >
                    and many more...
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
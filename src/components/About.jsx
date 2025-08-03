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
  width: theme.spacing(18),
  height: theme.spacing(18),
  margin: '0 auto',
  border: '4px solid white',
  boxShadow: theme.shadows[10],
  animation: `${float} 6s ease-in-out infinite`,
  [theme.breakpoints.down('sm')]: {
    width: theme.spacing(15),
    height: theme.spacing(15),
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
    margin: '0 8px',
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
    padding: theme.spacing(3, 2),
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
    <Box sx={{ bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Our Story Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Box 
            textAlign="center" 
            mb={8}
            data-aos="fade-up"
          >
            <Typography 
              variant="h4" 
              component="h2" 
              fontWeight={800}
              sx={{
                display: 'inline-block',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '60px',
                  height: '4px',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  borderRadius: '2px',
                }
              }}
            >
              Our Story
            </Typography>
          </Box>
          
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} data-aos="fade-up">
              <Box>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  fontWeight={700} 
                  gutterBottom
                  color="primary"
                >
                  Where Passion Meets Innovation
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 3, lineHeight: 1.8 }}>
                  Founded in 2023, Campus League emerged from a shared vision to revolutionize how students engage with sports on campus. 
                  We recognized the untapped potential of student athletes and the lack of a unified platform to bring them together.
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 4, lineHeight: 1.8 }}>
                  What began as a passion project between two developers from Jaipur has evolved into a comprehensive platform 
                  connecting thousands of students across multiple institutions. We're proud to be at the intersection of 
                  sports and technology, making it easier than ever for students to discover, participate in, and organize 
                  athletic activities.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 4 }}>
                  {sportsCategories.map((sport, index) => (
                    <Box 
                      key={index}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: '12px',
                        background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 5px 15px ${theme.palette.primary.main}20`,
                        },
                      }}
                    >
                      <Box sx={{ color: 'primary.main' }}>{sport.icon}</Box>
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>{sport.name}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>


    </Box>
  );
};

export default About;
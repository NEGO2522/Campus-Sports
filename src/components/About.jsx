import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Divider, 
  Button, 
  useMediaQuery, 
  useTheme,
  Paper,
  alpha,
  Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  EmojiEvents, 
  SportsSoccer, 
  Groups, 
  School, 
  LocationOn, 
  Code, 
  DesignServices, 
  SportsBasketball, 
  SportsVolleyball, 
  FitnessCenter,
  People,
  Event,
  SportsEsports
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import AOS from 'aos';
import 'aos/dist/aos.css';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(20),
  height: theme.spacing(20),
  margin: '0 auto',
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[10],
  animation: `${float} 6s ease-in-out infinite, ${pulse} 4s infinite`,
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('sm')]: {
    width: theme.spacing(16),
    height: theme.spacing(16),
  },
  '&:hover': {
    animation: `${float} 3s ease-in-out infinite, ${pulse} 2s infinite`,
    transform: 'scale(1.05)',
  },
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '20px',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(4, 3),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 15px 30px -5px ${alpha(theme.palette.primary.main, 0.2)}`,
    '&::before': {
      opacity: 1,
    },
    '& .feature-icon': {
      transform: 'scale(1.1) rotate(5deg)',
      background: theme.palette.mode === 'dark' 
        ? alpha(theme.palette.primary.main, 0.2) 
        : alpha(theme.palette.primary.light, 0.2),
    },
  },
  '& .feature-icon': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    marginBottom: theme.spacing(3),
    transition: 'all 0.3s ease',
    background: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.primary.main, 0.1) 
      : alpha(theme.palette.primary.light, 0.1),
    color: theme.palette.primary.main,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2),
    '& .feature-icon': {
      width: '70px',
      height: '70px',
    },
  },
}));

const TeamMember = styled(Paper)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4, 3, 3),
  borderRadius: '20px',
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 15px 30px -5px ${alpha(theme.palette.primary.main, 0.15)}`,
    '& .MuiAvatar-root': {
      transform: 'scale(1.05)',
      boxShadow: `0 5px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2, 2),
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
    { number: '1000+', label: 'Active Users', icon: <People sx={{ fontSize: 32 }} /> },
    { number: '50+', label: 'Campus Events', icon: <Event sx={{ fontSize: 32 }} /> },
    { number: '20+', label: 'Sports Categories', icon: <SportsEsports sx={{ fontSize: 32 }} /> },
    { number: '24/7', label: 'Support', icon: <EmojiEvents sx={{ fontSize: 32 }} /> },
  ];

  const sportsCategories = [
    { icon: <SportsSoccer sx={{ fontSize: 40 }} />, name: 'Football' },
    { icon: <SportsBasketball sx={{ fontSize: 40 }} />, name: 'Basketball' },
    { icon: <SportsVolleyball sx={{ fontSize: 40 }} />, name: 'Volleyball' },
    { icon: <FitnessCenter sx={{ fontSize: 40 }} />, name: 'Fitness' },
  ];
  const features = [
    {
      icon: <SportsSoccer className="feature-icon" sx={{ fontSize: 40 }} />,
      title: 'Sports Events',
      description: 'Discover and participate in various sports events happening across campuses.'
    },
    {
      icon: <Groups className="feature-icon" sx={{ fontSize: 40 }} />,
      title: 'Team Building',
      description: 'Connect with fellow students and form teams for different sports competitions.'
    },
    {
      icon: <EmojiEvents className="feature-icon" sx={{ fontSize: 40 }} />,
      title: 'Tournaments',
      description: 'Compete in exciting tournaments and showcase your sports skills.'
    },
  ];

  const teamMembers = [
    {
      name: 'Kshitij Jain',
      role: 'Co-founder & Technical Developer',
      location: 'Jaipur, Rajasthan'
    },
    {
      name: 'Harsh Agarwal',
      role: 'Founder & Technical Developer',
      location: 'Jaipur, Rajasthan'
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box 
        sx={{
          pt: 15,
          pb: 10,
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[100]} 100%)`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.5,
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box 
            textAlign="center" 
            data-aos="fade-up"
            sx={{ mb: { xs: 6, md: 8 } }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              fontWeight={800}
              gutterBottom
              sx={{
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                mb: 2,
                [theme.breakpoints.down('sm')]: {
                  fontSize: '2.2rem',
                },
              }}
            >
              Welcome to Campus Sports
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              maxWidth="700px" 
              mx="auto"
              mb={6}
            >
              Connecting students through the power of sports and fostering a healthy, active campus community.
            </Typography>
            
            {/* Stats */}
            <Grid container spacing={3} justifyContent="center" sx={{ mb: 8 }}>
              {stats.map((stat, index) => (
                <Grid item xs={6} sm={3} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                  <Paper 
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: '16px',
                      background: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.03)' 
                        : 'rgba(0, 0, 0, 0.02)',
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 10px 20px -5px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                    }}
                  >
                    <Box 
                      sx={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        mx: 'auto',
                        background: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.primary.light, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" component="div" fontWeight={700} gutterBottom>
                      {stat.number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
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
              What We Offer
            </Typography>
          </Box>
          
          <Grid container spacing={6} alignItems="center" sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <FeatureCard elevation={3}>
                  <Box className="feature-icon-container">
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Our Team Section */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
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
              Meet Our Team
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              maxWidth="700px" 
              mx="auto"
              mt={3}
              mb={6}
            >
              Passionate individuals dedicated to bringing the best sports experience to your campus.
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <TeamMember elevation={2}>
                  <StyledAvatar 
                    alt={member.name}
                    src={`/team/${member.name.toLowerCase().split(' ')[0]}.jpg`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=' + member.name.replace(/ /g, '+') + '&size=200&background=random';
                    }}
                  />
                  <Box mt={3}>
                    <Typography variant="h6" component="h3" fontWeight={600}>
                      {member.name}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight={500} mt={1}>
                      {member.role}
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                      <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {member.location}
                      </Typography>
                    </Box>
                  </Box>
                </TeamMember>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 12,
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center" data-aos="fade-up">
            <Typography 
              variant="h4" 
              component="h2" 
              fontWeight={800}
              color="white"
              gutterBottom
              sx={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
            >
              Ready to Join the Game?
            </Typography>
            <Typography 
              variant="h6" 
              color="rgba(255,255,255,0.9)" 
              mb={6}
              sx={{ textShadow: '0 1px 5px rgba(0,0,0,0.1)' }}
            >
              Be part of our growing community and never miss out on the action.
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: '50px',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 30px -5px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Our Story Section */}
      <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8} data-aos="fade-up">
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
          
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6} data-aos="fade-right">
              <Box 
                sx={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: 6,
                  '&:hover img': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Box
                  component="img"
                  src="/sports-team.jpg" 
                  alt="Team playing sports"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    transition: 'transform 0.5s ease',
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} data-aos="fade-left" data-aos-delay="200">
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
                          boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.2)}`,
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

      {/* Team Section */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
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
              Meet Our Team
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: '700px', 
                mx: 'auto', 
                mt: 2,
                fontSize: '1.1rem'
              }}
            >
              The passionate individuals behind Campus League
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={6} 
                key={index}
                data-aos="fade-up"
                data-aos-delay={`${index * 100}`}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <TeamMember>
                  <Box textAlign="center" flexGrow={1}>
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      gutterBottom 
                      fontWeight={700}
                      sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block',
                      }}
                    >
                      {member.name}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      color="primary" 
                      gutterBottom 
                      fontWeight={600}
                      sx={{ mb: 2 }}
                    >
                      {member.role}
                    </Typography>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center" 
                      mb={2}
                    >
                      <Box
                        sx={{
                          '& svg': {
                            color: theme.palette.primary.main,
                            mr: 1,
                          }
                        }}
                      >
                        <LocationOn fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {member.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </TeamMember>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default About;
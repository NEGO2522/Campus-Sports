import React, { useEffect } from 'react';
import { Box, Typography, Container, Grid, useMediaQuery, useTheme } from '@mui/material';
import { 
  EmojiEvents, SportsSoccer, Groups, SportsBasketball, SportsVolleyball, 
  FitnessCenter, SportsEsports, VideogameAsset, SportsRugby, SportsCricket, 
  SportsTennis, Pool, SportsMartialArts, SportsScore, RocketLaunch, FlashOn, ChevronRight 
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Custom Brutalist Components matching the Inbox/Notification UI
const StatCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '1.5rem',
  background: '#111',
  border: '1px solid rgba(255,255,255,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#ccff00',
    transform: 'translateY(-5px)',
  }
}));

const SportIconBox = styled(Box)(({ theme }) => ({
  width: '100%',
  aspectRatio: '1/1',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '1.2rem',
  background: '#111',
  border: '1px solid rgba(255,255,255,0.05)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    background: '#ccff00',
    '& .MuiSvgIcon-root': { color: '#000' },
    '& .MuiTypography-root': { color: '#000' },
  }
}));

const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const stats = [
    { number: '5K+', label: 'Athletes', icon: <Groups sx={{ color: '#ccff00' }} /> },
    { number: '120+', label: 'Events', icon: <EmojiEvents sx={{ color: '#ccff00' }} /> },
    { number: '15+', label: 'Colleges', icon: <FlashOn sx={{ color: '#ccff00' }} /> },
    { number: '24/7', label: 'Support', icon: <RocketLaunch sx={{ color: '#ccff00' }} /> },
  ];

  const sports = [
    { icon: <SportsSoccer />, name: 'Soccer' },
    { icon: <SportsBasketball />, name: 'Hoops' },
    { icon: <SportsCricket />, name: 'Cricket' },
    { icon: <SportsEsports />, name: 'Gaming' },
    { icon: <Pool />, name: 'Swim' },
    { icon: <SportsMartialArts />, name: 'MMA' },
    { icon: <SportsTennis />, name: 'Tennis' },
    { icon: <SportsScore />, name: 'Track' },
  ];

  return (
    <Box sx={{ bgcolor: '#0a0a0a', color: 'white', minHeight: '100vh', pt: { xs: 15, md: 20 }, pb: 10 }}>
      <Container maxWidth="lg">
        
        {/* Hero Section */}
        <Box sx={{ mb: 10 }} data-aos="fade-up">
          <Typography variant="overline" sx={{ color: '#ccff00', fontWeight: 900, letterSpacing: '0.3em' }}>
            ABOUT THE PLATFORM
          </Typography>
          <Typography variant={isMobile ? 'h3' : 'h1'} sx={{ fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', lineHeight: 0.9, mt: 1 }}>
            Level Up Your <br />
            <span style={{ color: '#ccff00' }}>Campus Game.</span>
          </Typography>
          <Typography variant="body1" sx={{ color: 'gray', mt: 4, maxWidth: '600px', fontWeight: 500, lineHeight: 1.6 }}>
            Campus League is a high-performance sports management system designed to eliminate the chaos of organizing college athletics.
          </Typography>
        </Box>

        {/* Dynamic Stats */}
        <Grid container spacing={2} sx={{ mb: 12 }}>
          {stats.map((stat, i) => (
            <Grid item xs={6} md={3} key={i} data-aos="fade-up" data-aos-delay={i * 100}>
              <StatCard>
                <Typography variant="h3" sx={{ fontWeight: 900, fontStyle: 'italic', color: 'white', mb: 0.5 }}>
                  {stat.number}
                </Typography>
                <Typography variant="caption" sx={{ color: '#ccff00', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>
                  {stat.label}
                </Typography>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        {/* Features Checklist - Shifted after stats */}
        <Box sx={{ mb: 15 }} data-aos="fade-up">
          <Box sx={{ borderLeft: '4px solid #ccff00', pl: 3, mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', mb: 2 }}>
              Professional-Grade <br />Recruitment Tools
            </Typography>
            <Typography sx={{ color: 'gray', maxWidth: '700px', mb: 4 }}>
              We've replaced messy spreadsheets with a real-time ecosystem for athletes and organizers.
            </Typography>
            <Grid container spacing={3}>
              {['Live Match Tracking', 'Automated Brackets', 'Digital Recruitment'].map((text) => (
                <Grid item xs={12} sm={4} key={text}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ChevronRight sx={{ color: '#ccff00' }} />
                    <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{text}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Sports Matrix */}
        <Box sx={{ mb: 15 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, fontStyle: 'italic', textTransform: 'uppercase' }}>
            Supported Disciplines<span style={{ color: '#ccff00' }}>/</span>
          </Typography>
          <Grid container spacing={2}>
            {sports.map((sport, i) => (
              <Grid item xs={4} sm={3} md={1.5} key={i} data-aos="zoom-in" data-aos-delay={i * 50}>
                <SportIconBox>
                  {React.cloneElement(sport.icon, { sx: { fontSize: 30, color: '#ccff00', mb: 1 } })}
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 1 }}>
                    {sport.name}
                  </Typography>
                </SportIconBox>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Footer */}
        <Box 
          data-aos="flip-up"
          sx={{ 
            bgcolor: '#ccff00', 
            p: { xs: 6, md: 10 }, 
            borderRadius: '3rem', 
            textAlign: 'center',
            color: 'black'
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', mb: 2 }}>
            Start Your Season
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 4, letterSpacing: 1 }}>
            Join the most competitive network in campus sports.
          </Typography>
          <Box 
            component="button"
            sx={{
              px: 6, py: 2, bgcolor: 'black', color: 'white', border: 'none',
              borderRadius: '1rem', fontWeight: 900, textTransform: 'uppercase',
              fontStyle: 'italic', cursor: 'pointer', transition: '0.3s',
              '&:hover': { transform: 'scale(1.05)', bgcolor: '#222' }
            }}
          >
            Create Your Squad
          </Box>
        </Box>

      </Container>
    </Box>
  );
};

export default About;
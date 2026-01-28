import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser';
import { 
  Box, 
  Container, 
  Typography, 
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChevronRight, AlternateEmail, Person, Message, Subject } from '@mui/icons-material';

// Custom Terminal-style Input Group
const InputWrapper = styled(Box)(({ error }) => ({
  display: 'flex',
  alignItems: 'center',
  background: '#111',
  borderBottom: error ? '2px solid #ff4444' : '1px solid rgba(255,255,255,0.1)',
  padding: '15px 0',
  transition: 'all 0.3s ease',
  '&:focus-within': {
    borderBottom: '2px solid #ccff00',
    '& svg': { color: '#ccff00' }
  }
}));

const StyledInput = styled('input')({
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'white',
  width: '100%',
  padding: '0 15px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  '&::placeholder': { color: '#444' }
});

const StyledTextArea = styled('textarea')({
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'white',
  width: '100%',
  padding: '0 15px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  resize: 'none',
  height: '100px',
  '&::placeholder': { color: '#444' }
});

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    emailjs.init("KOupcCiDTxaSNOa2Q");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      toast.error("REQUIRED FIELDS MISSING");
      return;
    }
    setIsSubmitting(true);
    try {
      await emailjs.send('service_zdk28rg', 'template_5htm02w', {
        from_email: formData.email,
        to_email: 'sports@campusleague.in',
        subject: formData.subject,
        message: formData.message
      }, 'KOupcCiDTxaSNOa2Q');
      toast.success('TRANSMISSION SUCCESSFUL');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('FAILED TO SEND');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#0a0a0a', color: 'white', minHeight: '100vh', pt: 15, pb: 10 }}>
      <Container maxWidth="md">
        
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" sx={{ color: '#ccff00', fontWeight: 900, letterSpacing: '0.4em' }}>
            COMMUNICATION PORTAL
          </Typography>
          <Typography variant={isMobile ? 'h3' : 'h2'} sx={{ fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase' }}>
            Contact <span style={{ color: '#ccff00' }}>HQ</span>
          </Typography>
        </Box>

        {/* The New Minimal Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '600px', mx: 'auto' }}>
          
          <InputWrapper sx={{ mt: 2 }}>
            <Person sx={{ color: '#444', ml: 1 }} />
            <StyledInput 
              name="name" 
              placeholder="ATHLETE NAME" 
              value={formData.name} 
              onChange={handleChange} 
            />
          </InputWrapper>

          <InputWrapper sx={{ mt: 2 }}>
            <AlternateEmail sx={{ color: '#444', ml: 1 }} />
            <StyledInput 
              name="email" 
              type="email"
              placeholder="EMAIL ADDRESS" 
              value={formData.email} 
              onChange={handleChange} 
            />
          </InputWrapper>

          <InputWrapper sx={{ mt: 2 }}>
            <Subject sx={{ color: '#444', ml: 1 }} />
            <StyledInput 
              name="subject" 
              placeholder="SUBJECT" 
              value={formData.subject} 
              onChange={handleChange} 
            />
          </InputWrapper>

          <InputWrapper sx={{ mt: 2, alignItems: 'flex-start' }}>
            <Message sx={{ color: '#444', ml: 1, mt: 0.5 }} />
            <StyledTextArea 
              name="message" 
              placeholder="TYPE YOUR MESSAGE..." 
              value={formData.message} 
              onChange={handleChange} 
            />
          </InputWrapper>

          {/* Action Button */}
          <Box 
            component="button"
            type="submit"
            disabled={isSubmitting}
            sx={{
              width: '100%',
              mt: 6,
              py: 2.5,
              bgcolor: '#ccff00',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 900,
              textTransform: 'uppercase',
              fontStyle: 'italic',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              transition: '0.2s',
              '&:hover': { bgcolor: '#e6ff80', gap: 3 },
              '&:disabled': { bgcolor: '#222', color: '#444' }
            }}
          >
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : (
              <>
                Initialize Transmission <ChevronRight />
              </>
            )}
          </Box>

          {/* Quick Contact Info */}
          <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'gray', letterSpacing: 2 }}>
              DIRECT EMAIL: <span style={{ color: 'white' }}>SPORTS@CAMPUSLEAGUE.IN</span>
            </Typography>
          </Box>
        </Box>

      </Container>
    </Box>
  );
};

export default ContactUs;
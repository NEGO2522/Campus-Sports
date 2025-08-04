import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  TextField, 
  Typography, 
  Paper, 
  useTheme,
  useMediaQuery,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Send as SendIcon, Person, Email, Subject as SubjectIcon } from '@mui/icons-material';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Initialize EmailJS
  useEffect(() => {
    // Initialize EmailJS with your public key
    emailjs.init("KOupcCiDTxaSNOa2Q");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Replace these with your EmailJS service ID and template ID
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        to_email: 'sports@campusleague.in',
        subject: formData.subject,
        message: formData.message
      };

      // Send the email
      await emailjs.send(
        'service_zdk28rg',      // Your EmailJS service ID
        'template_5htm02w',     // Your EmailJS template ID
        templateParams,
        'KOupcCiDTxaSNOa2Q'    // Your EmailJS public key
      );
      
      // Show success message
      toast.success('Your message has been sent successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      py: { xs: 4, sm: 6, md: 8 },
      px: { xs: 2, sm: 3 },
      backgroundColor: theme.palette.background.default
    }}>
      <Container maxWidth="lg" sx={{ width: '100%' }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Typography 
              variant={isMobile ? 'h4' : 'h3'} 
              component="h1" 
              align="center" 
              gutterBottom
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: { xs: 1.5, sm: 2 },
                fontSize: { xs: '1.75rem', sm: '2.5rem' }
              }}
            >
              Contact Us
            </Typography>
            <Typography 
              variant={isMobile ? 'body1' : 'h6'} 
              align="center" 
              color="textSecondary"
              paragraph
              sx={{ 
                mb: { xs: 4, sm: 6 },
                px: { xs: 1, sm: 0 },
                lineHeight: 1.6
              }}
            >
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 4 
              }}
            >
              <Typography 
                variant="body2" 
                align="center" 
                color="textSecondary"
                sx={{ mb: 1 }}
              >
                Or email us directly at:
              </Typography>
              <a 
                href="mailto:sports@campusleague.in"
                style={{ 
                  color: theme.palette.primary.main, 
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: isMobile ? '0.9375rem' : '1rem',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  '&:hover': {
                    textDecoration: 'underline',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                sports@campusleague.in
              </a>
            </Box>
          </motion.div>

          <Grid container justifyContent="center">
            <Grid item xs={12} sm={10} md={8} lg={6}>
              <motion.div variants={itemVariants} style={{ height: '100%' }}>
                <Paper 
                  elevation={isMobile ? 1 : 3} 
                  component="form" 
                  onSubmit={handleSubmit}
                  sx={{
                    p: { xs: 3, sm: 4 },
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    display: 'flex',
                    flexDirection: 'column',
                    border: isMobile ? `1px solid ${theme.palette.divider}` : 'none'
                  }}
                >
                  <Grid container spacing={2.5} sx={{ flex: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        required
                        variant="outlined"
                        size={isMobile ? 'small' : 'medium'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person 
                                fontSize={isMobile ? 'small' : 'medium'} 
                                color={errors.name ? 'error' : 'action'} 
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          mb: { xs: 1.5, sm: 2 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        required
                        variant="outlined"
                        size={isMobile ? 'small' : 'medium'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email 
                                fontSize={isMobile ? 'small' : 'medium'} 
                                color={errors.email ? 'error' : 'action'} 
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          mb: { xs: 1.5, sm: 2 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        error={!!errors.subject}
                        helperText={errors.subject}
                        required
                        variant="outlined"
                        size={isMobile ? 'small' : 'medium'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SubjectIcon 
                                fontSize={isMobile ? 'small' : 'medium'} 
                                color={errors.subject ? 'error' : 'action'} 
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          mb: { xs: 1.5, sm: 2 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Your Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        error={!!errors.message}
                        helperText={errors.message}
                        required
                        multiline
                        rows={isMobile ? 4 : 6}
                        variant="outlined"
                        size={isMobile ? 'small' : 'medium'}
                        sx={{ 
                          mb: { xs: 2, sm: 3 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          },
                          '& .MuiOutlinedInput-multiline': {
                            padding: isMobile ? '8.5px 14px' : '16.5px 14px'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <motion.div 
                        whileHover={{ scale: isMobile ? 1 : 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        style={{ width: '100%' }}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size={isMobile ? 'medium' : 'large'}
                          fullWidth
                          disabled={isSubmitting}
                          startIcon={!isSubmitting && <SendIcon />}
                          sx={{
                            py: isMobile ? 1 : 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: isMobile ? '0.9375rem' : '1rem',
                            borderRadius: 2,
                            boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
                            '&:hover': {
                              boxShadow: '0 6px 20px 0 rgba(0, 118, 255, 0.5)'
                            },
                            '& .MuiButton-startIcon': {
                              marginRight: isMobile ? '6px' : '8px'
                            }
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <CircularProgress size={20} color="inherit" thickness={4} sx={{ mr: 1 }} />
                              Sending...
                            </>
                          ) : 'Send Message'}
                        </Button>
                      </motion.div>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ContactUs;
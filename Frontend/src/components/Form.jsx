import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Person, 
  Phone, 
  Transgender, 
  ChevronLeft, 
  Email, 
  Badge, 
  School, 
  CalendarMonth,
  Logout,
  ChevronRight
} from '@mui/icons-material';

// --- STYLED COMPONENTS (Matching Contact/Leaderboard) ---
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
  '&::placeholder': { color: '#444' },
  '&:disabled': { color: '#444', cursor: 'not-allowed' }
});

const StyledSelect = styled('select')({
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'white',
  width: '100%',
  padding: '0 15px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  cursor: 'pointer',
  '& option': { background: '#111', color: 'white' }
});

const UserProfileForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    fullName: '',
    registrationNumber: '',
    courseName: '',
    age: '',
    gender: '',
    phoneNumber: '',
    email: auth.currentUser?.email || ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!auth.currentUser) { navigate('/login'); return; }
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setFormData(prev => ({ ...prev, ...userDoc.data() }));
        }
      } catch (err) {
        setError('TRANSMISSION ERROR: Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/');
      toast.success('DE-AUTHENTICATED');
    } catch (err) {
      toast.error('SIGNOUT FAILED');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userData = {
        ...formData,
        userId: auth.currentUser.uid,
        profileCompleted: true,
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, userData, { merge: true });
      localStorage.setItem('profileCompleted', 'true');
      toast.success('PROFILE SYNCHRONIZED');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('WRITE ERROR: Could not save to database.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0a0a0a' }}>
        <CircularProgress sx={{ color: '#ccff00' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#0a0a0a', color: 'white', minHeight: '100vh', pt: 15, pb: 10 }}>
      <Container maxWidth="md">
        
        {/* Header */}
        <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            onClick={() => navigate(-1)}
            sx={{ cursor: 'pointer', color: '#ccff00', display: 'flex', alignItems: 'center', '&:hover': { opacity: 0.7 } }}
          >
            <ChevronLeft fontSize="large" />
          </Box>
          <Box>
            <Typography variant="overline" sx={{ color: '#ccff00', fontWeight: 900, letterSpacing: '0.4em' }}>
              IDENTITY MANAGEMENT
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase' }}>
              Athlete <span style={{ color: '#ccff00' }}>Profile</span>
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '700px', mx: 'auto' }}>
          
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ff4444', marginBottom: '20px', fontWeight: 900, fontSize: '0.8rem' }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
            
            {/* Row 1 */}
            <InputWrapper>
              <Email sx={{ color: '#444', ml: 1 }} />
              <StyledInput name="email" value={formData.email} disabled placeholder="EMAIL" />
            </InputWrapper>

            <InputWrapper>
              <Person sx={{ color: '#444', ml: 1 }} />
              <StyledInput name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="FULL NAME" required />
            </InputWrapper>

            {/* Row 2 */}
            <InputWrapper>
              <Phone sx={{ color: '#444', ml: 1 }} />
              <StyledInput name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="PHONE NUMBER" required />
            </InputWrapper>

            <InputWrapper>
              <Badge sx={{ color: '#444', ml: 1 }} />
              <StyledInput name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} placeholder="REGISTRATION NO." required />
            </InputWrapper>

            {/* Row 3 */}
            <InputWrapper>
              <School sx={{ color: '#444', ml: 1 }} />
              <StyledInput name="courseName" value={formData.courseName} onChange={handleInputChange} placeholder="COURSE / DEPARTMENT" required />
            </InputWrapper>

            <InputWrapper>
              <CalendarMonth sx={{ color: '#444', ml: 1 }} />
              <StyledInput name="age" type="number" value={formData.age} onChange={handleInputChange} placeholder="AGE" required />
            </InputWrapper>

            {/* Row 4 (Full Width) */}
            <Box sx={{ gridColumn: { md: 'span 2' } }}>
                <InputWrapper>
                <Transgender sx={{ color: '#444', ml: 1 }} />
                <StyledSelect name="gender" value={formData.gender} onChange={handleInputChange} required>
                    <option value="">SELECT GENDER</option>
                    <option value="male">MALE</option>
                    <option value="female">FEMALE</option>
                    <option value="other">OTHER</option>
                </StyledSelect>
                </InputWrapper>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mt: 8 }}>
            <Box 
              component="button"
              type="submit"
              disabled={isSubmitting}
              sx={{
                width: '100%',
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
                <> Save Identity Credentials <ChevronRight /> </>
              )}
            </Box>

            <Box 
              component="button"
              type="button"
              onClick={handleSignOut}
              sx={{
                width: '100%',
                mt: 2,
                py: 2,
                bgcolor: 'transparent',
                color: '#ff4444',
                border: '1px solid #ff4444',
                borderRadius: '4px',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                '&:hover': { bgcolor: 'rgba(255,68,68,0.1)' }
              }}
            >
              <Logout fontSize="small" /> Terminate Session
            </Box>
          </Box>

        </Box>
      </Container>
    </Box>
  );
};

export default UserProfileForm;
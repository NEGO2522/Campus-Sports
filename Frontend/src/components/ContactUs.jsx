import React from 'react';
import { motion } from 'framer-motion';
import { Container, Grid } from '@mui/material';
import { Mail, MapPin, Clock, Phone, Instagram, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';

const contactItems = [
  { icon: Mail,   label: 'EMAIL US',       value: 'sports@campusleague.in', href: 'mailto:sports@campusleague.in', desc: 'For all general & partnership queries' },
  { icon: Phone,  label: 'CALL US',        value: '+91 98765 43210',        href: 'tel:+919876543210',            desc: 'Mon – Sat, 10am to 7pm IST'          },
  { icon: MapPin, label: 'BASED IN',       value: 'India — Remote First',   href: null,                           desc: 'Operating across 15+ campuses nationwide' },
  { icon: Clock,  label: 'RESPONSE TIME',  value: 'Within 24 Hours',        href: null,                           desc: 'We read every message personally'    },
];

const socials = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Twitter,   label: 'Twitter',   href: 'https://twitter.com'   },
  { icon: Linkedin,  label: 'LinkedIn',  href: 'https://linkedin.com'  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: 'easeOut', delay },
});

const ContactUs = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top left, rgba(204,255,0,0.06) 0%, transparent 55%), #0a0a0a',
      color: 'white',
      paddingTop: '7rem',
      paddingBottom: '5rem',
    }}>
      <Container maxWidth="lg">

        {/* ── Header ── */}
        <motion.div {...fadeUp(0)} style={{ marginBottom: '5rem' }}>
          <p style={{ color: '#ccff00', fontWeight: 900, letterSpacing: '0.35em', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: 8 }}>
            GET IN TOUCH
          </p>
          <h1 style={{ fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', lineHeight: 0.92, margin: 0 }}>
            Let's Talk.<br />
            <span style={{ color: '#ccff00' }}>We're Here.</span>
          </h1>
          <motion.div
            initial={{ width: 48 }}
            animate={{ width: 140 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
            style={{ height: 3, background: '#ccff00', borderRadius: 2, marginTop: 20 }}
          />
          <p style={{ color: '#666', marginTop: 24, maxWidth: 480, fontSize: '0.95rem', lineHeight: 1.7 }}>
            Whether it's a bug, a big idea, or a campus collab — drop us a line and we'll get back to you fast.
          </p>
        </motion.div>

        {/* ── Contact Info 4 Cards ── */}
        <Grid container spacing={3} style={{ marginBottom: '2rem' }}>
          {contactItems.map((item, i) => {
            const Icon = item.icon;
            const isClickable = !!item.href;
            const Wrapper = isClickable ? 'a' : 'div';
            return (
              <Grid item xs={12} sm={6} key={item.label}>
                <motion.div {...fadeUp(0.1 + i * 0.08)}>
                  <Wrapper href={item.href || undefined} style={{ textDecoration: 'none', display: 'block' }}>
                    <motion.div
                      whileHover={isClickable ? { y: -4 } : {}}
                      style={{
                        background: '#111', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '1.4rem', padding: '2rem',
                        cursor: isClickable ? 'pointer' : 'default', transition: 'border-color 0.25s',
                      }}
                      onMouseEnter={e => { if (isClickable) e.currentTarget.style.borderColor = '#ccff00'; }}
                      onMouseLeave={e => { if (isClickable) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.4rem' }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: '0.9rem',
                          background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={22} color="#ccff00" />
                        </div>
                        {isClickable && <ArrowUpRight size={18} color="#444" />}
                      </div>
                      <p style={{ color: '#555', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 6 }}>{item.label}</p>
                      <p style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', marginBottom: 8, fontStyle: 'italic' }}>{item.value}</p>
                      <p style={{ color: '#555', fontSize: '0.8rem', lineHeight: 1.5 }}>{item.desc}</p>
                    </motion.div>
                  </Wrapper>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* ── Full-width Quote Banner ── */}
        <motion.div {...fadeUp(0.5)} style={{ marginBottom: '1.5rem' }}>
          <div style={{
            background: '#ccff00', borderRadius: '1.6rem', padding: '3rem 3.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1.5rem',
          }}>
            <p style={{ color: 'black', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(1.1rem, 2.2vw, 1.45rem)', lineHeight: 1.35, margin: 0, maxWidth: 620 }}>
              "We built Campus League for athletes who deserved better. Every message we receive makes it stronger."
            </p>
            <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
              — Campus League Team
            </p>
          </div>
        </motion.div>

      </Container>

      {/* ── Bottom 3 Cards — full width matching Container ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
        }}>

          {/* Follow Us */}
          <motion.div {...fadeUp(0.6)}>
            <div style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '1.6rem', padding: '2rem',
            }}>
              <p style={{ color: '#555', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 20 }}>
                FOLLOW US
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {socials.map(({ icon: SocialIcon, label, href }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ x: 5 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      textDecoration: 'none', padding: '0.85rem 1rem',
                      borderRadius: '0.9rem', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)', transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#ccff00'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <SocialIcon size={18} color="#ccff00" />
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{label}</span>
                    </div>
                    <ArrowUpRight size={15} color="#444" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div {...fadeUp(0.7)}>
            <div style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '1.6rem', padding: '2rem',
            }}>
              <p style={{ color: '#555', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 20 }}>
                QUICK LINKS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Home', 'Events', 'Leaderboard', 'About'].map((link) => (
                  <motion.a
                    key={link}
                    href={`/${link.toLowerCase()}`}
                    whileHover={{ x: 5 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      textDecoration: 'none', padding: '0.85rem 1rem',
                      borderRadius: '0.9rem', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)', transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#ccff00'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                  >
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{link}</span>
                    <ArrowUpRight size={15} color="#444" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Office Hours */}
          <motion.div {...fadeUp(0.8)}>
            <div style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '1.6rem', padding: '2rem',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%',
            }}>
              <div>
                <p style={{ color: '#555', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 20 }}>
                  OFFICE HOURS
                </p>
                {[
                  { day: 'Mon – Fri', time: '10am – 7pm IST' },
                  { day: 'Saturday',  time: '11am – 5pm IST' },
                  { day: 'Sunday',    time: 'Closed'          },
                ].map(({ day, time }) => (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600 }}>{day}</span>
                    <span style={{ color: time === 'Closed' ? '#444' : 'white', fontSize: '0.85rem', fontWeight: 800 }}>{time}</span>
                  </div>
                ))}
              </div>
              <div style={{
                padding: '0.9rem 1rem', borderRadius: '0.8rem', marginTop: '1rem',
                background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.15)',
              }}>
                <p style={{ color: '#ccff00', fontSize: '0.78rem', fontWeight: 900, margin: 0 }}>
                  ⚡ Avg reply time: &lt;4 hours
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

    </div>
  );
};

export default ContactUs;

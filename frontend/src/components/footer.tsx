import { useState, useEffect } from 'react'
import NutriGrowLogo2 from '../assets/logo/logo-nutrigrow-2.svg'
import EllipseAsset   from '../assets/asset/asset-ellipse.svg'
import EmailIcon      from '../assets/icons/icon-email.svg'
import WhatsappIcon   from '../assets/icons/icon-whatsapp.svg'
import XIcon           from '../assets/icons/icon-x.svg'
import InstagramIcon  from '../assets/icons/icon-instagram.svg'

// ─── Breakpoint helper ────────────────────────────────────────────────────────
const useBreakpoint = () => {
  const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setBp(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop')
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return bp
}

// ─── ContactItem sub-component ────────────────────────────────────────────────
interface ContactItemProps {
  icon:      string
  label:     string
  href:      string
  underline: boolean
}

const ContactItem = ({ icon, label, href, underline, bp }: ContactItemProps & { bp: string }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: bp === 'mobile' ? '10px' : 'clamp(8px, 0.94vw, 12px)' }}>
      <div style={{
        flexShrink:     0,
        width:          bp === 'mobile' ? '36px' : 'clamp(32px, 3vw, 44px)',
        height:         bp === 'mobile' ? '36px' : 'clamp(32px, 3vw, 44px)',
        borderRadius:   '50%',
        background:     '#3F6212',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        overflow:       'hidden',
      }}>
        <img src={icon} alt="" style={{
          width:     '100%', 
          height:    '100%',
          objectFit: 'contain',
        }} />
      </div>
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontFamily:          'var(--font-heading)',
          fontWeight:          400,
          fontSize:            bp === 'mobile' ? '15px' : bp === 'tablet' ? '17px' : 'clamp(12px, 1.56vw, 20px)',
          color:               hovered ? '#3F6212' : 'rgba(0,0,0,0.698)',
          textDecoration:      underline ? 'underline' : 'none',
          textDecorationColor: 'rgba(0,0,0,0.5)',
          textUnderlineOffset: '2px',
          lineHeight:          1,
          transition:          'color 150ms ease',
          cursor:              'pointer',
        }}
      >
        {label}
      </a>
    </li>
  )
}

// ─── Contact data ─────────────────────────────────────────────────────────────
const contacts: ContactItemProps[] = [
  { icon: EmailIcon,     label: 'nutrigrow@gmail.com', href: 'mailto:nutrigrow@gmail.com',      underline: true  },
  { icon: WhatsappIcon,  label: '+62 856-9966-999',    href: 'https://wa.me/6285699669999',     underline: false },
  { icon: XIcon,         label: '@nutrigrow',           href: 'https://x.com/nutrigrow',         underline: false },
  { icon: InstagramIcon, label: '@nutrigrow',           href: 'https://instagram.com/nutrigrow', underline: false },
]

// ─── Main Footer ──────────────────────────────────────────────────────────────
const Footer = () => {
  const bp = useBreakpoint()

  // ── Desktop layout ──────────────────────────────────────────────────────────
  if (bp === 'desktop') {
    return (
      <footer style={{
        position:   'relative',
        width:      '100%',
        background: '#F0F1F5',
        overflow:   'hidden',
        display:    'flex',
        alignItems: 'stretch',
      }}>

        {/* Ellipse blur blob */}
        <img src={EllipseAsset} alt="" aria-hidden="true" style={{
          position:      'absolute',
          bottom:        0,
          right:         0,
          width:         'clamp(280px, 47.6vw, 609px)',
          height:        'auto',
          filter:        'blur(60px)',
          opacity:       0.75,
          pointerEvents: 'none',
          userSelect:    'none',
          zIndex:        0,
          transform:     'translate(5%, 10%)',
        }} />

        {/* Grid utama */}
        <div style={{
          position:            'relative',
          zIndex:              1,
          width:               '100%',
          margin:              '0 auto',
          display:             'grid',
          gridTemplateColumns: 'minmax(0,390fr) 1px minmax(0,320fr) minmax(0,360fr)',
          gridTemplateAreas:   '"left divider contact logo"',
          alignItems:          'stretch',
          paddingInline:       'clamp(16px, 4.8vw, 61px)',
          paddingTop:          'clamp(5px, 1.5vw, 18px)',
          paddingBottom:       'clamp(5px, 1.5vw, 18px)',
        }}>

          {/* Kiri: Brand + Tagline + Copyright */}
          <div style={{
            gridArea:       'left',
            display:        'flex',
            flexDirection:  'column',
            justifyContent: 'space-between',
            paddingRight:   'clamp(16px, 3vw, 40px)',
            paddingBlock:   'clamp(0px, 1vw, 10px)',
          }}>
            <a href="#" aria-label="NutriGrow" style={{ textDecoration: 'none', display: 'inline-block', lineHeight: 1 }}>
              <span style={{
                fontFamily: 'var(--font-quicksand)',
                fontWeight: 700,
                fontSize:   'clamp(24px, 4vw, 48px)',
                lineHeight: 1,
                display:    'inline-flex',
              }}>
                <span style={{ color: '#3F6212' }}>Nutri</span>
                <span style={{ color: '#E48029' }}>Grow</span>
              </span>
            </a>

            <p style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 400,
              fontSize:   'clamp(12px, 1.25vw, 16px)',
              lineHeight: 1.5,
              color:      'rgba(0,0,0,0.698)',
              margin:     0,
              marginTop:  'clamp(8px, 1.5vw, 16px)',
            }}>
              Tumbuh Kembang Optimal, Bebas Stunting Bersama NutriGrow.
            </p>

            <p style={{
              fontFamily:    'var(--font-heading)',
              fontWeight:    400,
              fontSize:      'clamp(12px, 1.56vw, 20px)',
              color:         'rgba(0,0,0,0.749)',
              margin:        0,
              marginTop:     'auto',
              paddingTop:    'clamp(16px, 4vw, 48px)',
              paddingBottom: 'clamp(16px, 2vw, 24px)',
            }}>
              @2026 All Rights Reserved
            </p>
          </div>

          {/* Garis vertikal pembatas */}
          <div aria-hidden="true" style={{
            gridArea:    'divider',
            width:       '0.8px',
            background:  '#000000',
            alignSelf:   'stretch',
            marginBlock: 'clamp(0px, 1vw, 10px)',
          }} />

          {/* Contact Us */}
          <div style={{
            gridArea:      'contact',
            display:       'flex',
            flexDirection: 'column',
            paddingLeft:   'clamp(16px, 1.7vw, 22px)',
            paddingRight:  'clamp(8px, 1vw, 16px)',
            paddingBlock:  'clamp(0px, 0.9vw, 12px)',
          }}>
            <h2 style={{
              fontFamily:   'var(--font-heading)',
              fontWeight:   600,
              fontSize:     'clamp(18px, 2.35vw, 30px)',
              color:        '#E48029',
              margin:       0,
              marginBottom: 'clamp(10px, 1.5vw, 20px)',
              lineHeight:   1,
            }}>
              Contact Us
            </h2>
            <ul style={{
              listStyle:     'none',
              margin:        0,
              padding:       0,
              display:       'flex',
              flexDirection: 'column',
              gap:           'clamp(10px, 1.5vw, 20px)',
            }}>
              {contacts.map((c) => <ContactItem key={c.href} {...c} bp={bp} />)}
            </ul>
          </div>

          {/* Logo */}
          <div style={{
            gridArea:       'logo',
            display:        'flex',
            alignItems:     'flex-end',
            justifyContent: 'flex-end',
            overflow:       'visible',
          }}>
            <img src={NutriGrowLogo2} alt="NutriGrow Ilustrasi" style={{
              width:        'clamp(140px, 28vw, 358px)',
              height:       'auto',
              objectFit:    'contain',
              marginBottom: 'clamp(-20px, -2vw, -30px)',
              marginRight:  'clamp(-8px, -0.5vw, -10px)',
              position:     'relative',
              zIndex:       1,
            }} />
          </div>
        </div>
      </footer>
    )
  }

  // ── Tablet layout ───────────────────────────────────────────────────────────
  if (bp === 'tablet') {
    return (
      <footer style={{
        position:   'relative',
        width:      '100%',
        background: '#F0F1F5',
        overflow:   'hidden',
      }}>

        {/* Baris Utama: Grid 2 Kolom */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '0.7fr 1px 1.3fr',
          alignItems:          'stretch',
          paddingInline:       '36px',
          paddingTop:          '22px',
          paddingBottom:       '22px', 
          position:            'relative',
          zIndex:              1,
        }}>

          {/* Kiri: Brand + Tagline + Copyright */}
          <div style={{
            display:        'flex',
            flexDirection:  'column',
            justifyContent: 'space-between',
            paddingRight:   '20px',
          }}>
            <div>
              <a href="#" aria-label="NutriGrow" style={{ textDecoration: 'none', display: 'inline-block', lineHeight: 1 }}>
                <span style={{
                  fontFamily: 'var(--font-quicksand)',
                  fontWeight: 700,
                  fontSize:   '42px',
                  lineHeight: 1,
                  display:    'inline-flex',
                }}>
                  <span style={{ color: '#3F6212' }}>Nutri</span>
                  <span style={{ color: '#E48029' }}>Grow</span>
                </span>
              </a>

              <p style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 400,
                fontSize:   '15px',
                lineHeight: 1.6,
                color:      'rgba(0,0,0,0.698)',
                marginTop:  '15px',
              }}>
                Tumbuh Kembang Optimal, Bebas Stunting Bersama NutriGrow.
              </p>
            </div>

            <p style={{
              fontFamily:   'var(--font-heading)',
              fontWeight:   400,
              fontSize:     '16px',
              color:        'rgba(0,0,0,0.749)',
              margin:       0,
              marginTop:    '50px',
              marginBottom: '20px',
            }}>
              @2026 All Rights Reserved
            </p>
          </div>

          {/* Garis vertikal pembatas */}
          <div aria-hidden="true" style={{
            width:       '0.8px',
            background:  '#000000',
            alignSelf:   'stretch',
          }} />

          {/* Kanan: Contact Us + Logo & Ellipse  */}
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            paddingLeft:   '40px',
            position:      'relative', 
            minHeight:     '250px',    
          }}>
            <h2 style={{
              fontFamily:   'var(--font-heading)',
              fontWeight:   600,
              fontSize:     '26px',
              color:        '#E48029',
              margin:       0,
              marginTop:    '5px',
              marginBottom: '20px',
              lineHeight:   1,
              position:     'relative',
              zIndex:       2,
            }}>
              Contact Us
            </h2>
            <ul style={{
              listStyle:     'none',
              margin:        0,
              padding:       0,
              display:       'flex',
              flexDirection: 'column',
              gap:           '16px',
              position:      'relative',
              zIndex:        2,
            }}>
              {contacts.map((c) => <ContactItem key={c.href} {...c} bp={bp} />)}
            </ul>

            {/* Ellipse blur blob */}
            <img src={EllipseAsset} alt="" aria-hidden="true" style={{
              position:      'absolute',
              bottom:        '-36px',
              right:         '-40px',
              width:         'clamp(250px, 50vw, 700px)', 
              height:        'auto',
              filter:        'blur(60px)', 
              opacity:       0.7,
              pointerEvents: 'none',
              userSelect:    'none',
              transform:     'translate(15%, 20%)', 
              zIndex:        0,
            }} />

            {/* Logo */}
            <img src={NutriGrowLogo2} alt="NutriGrow Ilustrasi" style={{
              position:     'absolute',
              bottom:       '-36px',
              right:        '-40px',
              width:        'clamp(150px, 25vw, 350px)', 
              height:       'auto',
              objectFit:    'contain',
              zIndex:       1,
            }} />
          </div>
        </div>
      </footer>
    )
  }

  // ── Mobile layout ───────────────────────────────────────────────────────────
  return (
    <footer style={{
      position:   'relative',
      width:      '100%',
      background: '#F0F1F5',
      overflow:   'hidden',
    }}>

      {/* Container 1: NutriGrow */}
      <div style={{
        paddingInline: '28px',
        paddingTop:    '20px',
        paddingBottom: '20px',
        position:      'relative',
        zIndex:        1,
      }}>
        <a href="#" aria-label="NutriGrow" style={{ textDecoration: 'none', display: 'inline-block', lineHeight: 1 }}>
          <span style={{
            fontFamily: 'var(--font-quicksand)',
            fontWeight: 700,
            fontSize:   '36px',
            lineHeight: 1,
            display:    'inline-flex',
          }}>
            <span style={{ color: '#3F6212' }}>Nutri</span>
            <span style={{ color: '#E48029' }}>Grow</span>
          </span>
        </a>

        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 400,
          fontSize:   '14px',
          lineHeight: 1.6,
          color:      'rgba(0,0,0,0.698)',
          margin:     0,
          marginTop:  '10px',
        }}>
          Tumbuh Kembang Optimal, Bebas Stunting Bersama NutriGrow.
        </p>

        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 400,
          fontSize:   '14px',
          color:      'rgba(0,0,0,0.749)',
          margin:     0,
          marginTop:  '20px',
        }}>
          @2026 All Rights Reserved
        </p>
      </div>

      {/* Garis horizontal pembatas */}
      <div aria-hidden="true" style={{
        height:       '1px',            
        width:        'calc(100% - 120px)', 
        background:   '#000000', 
        marginInline: '28px',          
      }} />

      {/* Container 2: Contact Us + Logo + Ellipse */}
      <div style={{
        paddingInline: '28px',
        paddingTop:    '24px',
        paddingBottom: '0',
        position:      'relative',
        zIndex:        1,
        overflow:      'hidden',
        minHeight:     '180px',
      }}>
        <h2 style={{
          fontFamily:   'var(--font-heading)',
          fontWeight:   600,
          fontSize:     '22px',
          color:        '#E48029',
          margin:       0,
          marginBottom: '16px',
          lineHeight:   1,
          position:     'relative',
          zIndex:       2,
        }}>
          Contact Us
        </h2>
        <ul style={{
          listStyle:     'none',
          margin:        0,
          padding:       0,
          display:       'flex',
          flexDirection: 'column',
          gap:           '14px',
          paddingBottom: '24px',
          position:      'relative',
          zIndex:        2,
        }}>
          {contacts.map((c) => <ContactItem key={c.href} {...c} bp={bp} />)}
        </ul>

        {/* Ellipse blur blob */}
        <img src={EllipseAsset} alt="" aria-hidden="true" style={{
          position:      'absolute',
          bottom:        0,
          right:         0,
          width:         'clamp(250px, 75vw, 600px)', 
          height:        'auto',
          filter:        'blur(45px)', 
          opacity:       0.7,
          pointerEvents: 'none',
          userSelect:    'none',
          transform:     'translate(15%, 20%)', 
          zIndex:        0,
        }} />

        {/* Logo */}
        <img src={NutriGrowLogo2} alt="NutriGrow Ilustrasi" style={{
          position:     'absolute',
          bottom:       0,
          right:        0,
          width:        'clamp(160px, 45vw, 320px)', 
          height:       'auto',
          objectFit:    'contain',
          marginBottom: '-10px',
          zIndex:       1,
        }} />
      </div>

    </footer>
  )
}

export default Footer
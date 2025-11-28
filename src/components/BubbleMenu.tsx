import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './BubbleMenu.css';

interface UserTypeItem {
  label: string;
  value: string;
  ariaLabel: string;
  icon?: string;
}

interface BubbleMenuProps {
  logo?: React.ReactNode | string;
  onUserTypeSelect?: (type: string) => void;
  className?: string;
  style?: React.CSSProperties;
  menuAriaLabel?: string;
  menuBg?: string;
  menuContentColor?: string;
  useFixedPosition?: boolean;
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
}

interface UserTypeItem {
  label: string;
  value: string;
  ariaLabel: string;
  icon?: string;
}

const USER_TYPE_ITEMS: UserTypeItem[] = [
  { label: 'Job Seeker', value: 'jobseeker', ariaLabel: 'I am looking for a job', icon: '💼' },
  { label: 'Student', value: 'student', ariaLabel: 'I am a student', icon: '🎓' },
  { label: 'Recruiter', value: 'recruiter', ariaLabel: 'I am a recruiter', icon: '👥' }
];

export default function BubbleMenu({
  logo = 'RG',
  onUserTypeSelect,
  className = '',
  style,
  menuAriaLabel = 'Who are you?',
  menuBg = 'hsl(var(--card))',
  menuContentColor = 'hsl(var(--foreground))',
  useFixedPosition = true,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.5,
  staggerDelay = 0.12
}: BubbleMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<(HTMLButtonElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const containerClassName = ['bubble-menu', useFixedPosition ? 'fixed' : 'absolute', className]
    .filter(Boolean)
    .join(' ');

  const handleToggle = () => {
    const nextState = !isMenuOpen;
    if (nextState) setShowOverlay(true);
    setIsMenuOpen(nextState);
  };

  const handleUserTypeSelect = (type: string) => {
    setIsMenuOpen(false);
    onUserTypeSelect?.(type);
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);

    if (!overlay || !bubbles.length) return;

    if (isMenuOpen) {
      gsap.set(overlay, { display: 'flex' });
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(labels, { y: 24, autoAlpha: 0 });

      bubbles.forEach((bubble, i) => {
        const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
        const tl = gsap.timeline({ delay });

        tl.to(bubble, {
          scale: 1,
          duration: animationDuration,
          ease: animationEase
        });
        if (labels[i]) {
          tl.to(
            labels[i],
            {
              y: 0,
              autoAlpha: 1,
              duration: animationDuration,
              ease: 'power3.out'
            },
            `-=${animationDuration * 0.9}`
          );
        }
      });
    } else if (showOverlay) {
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.to(labels, {
        y: 24,
        autoAlpha: 0,
        duration: 0.2,
        ease: 'power3.in'
      });
      gsap.to(bubbles, {
        scale: 0,
        duration: 0.2,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(overlay, { display: 'none' });
          setShowOverlay(false);
        }
      });
    }
  }, [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay]);

  useEffect(() => {
    const handleResize = () => {
      if (isMenuOpen) {
        const bubbles = bubblesRef.current.filter(Boolean);
        const isDesktop = window.innerWidth >= 900;

        bubbles.forEach((bubble, i) => {
          const item = USER_TYPE_ITEMS[i];
          if (bubble && item) {
            const rotation = isDesktop ? ((i - 1) * 8) : 0;
            gsap.set(bubble, { rotation });
          }
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  return (
    <>
      <nav className={containerClassName} style={style} aria-label="Main navigation">
        <div className="bubble logo-bubble" aria-label="Logo" style={{ background: menuBg }}>
          <span className="logo-content" style={{ color: menuContentColor }}>
            {typeof logo === 'string' ? (
              logo.startsWith('http') || logo.startsWith('/') ? (
                <img src={logo} alt="Logo" className="bubble-logo" />
              ) : (
                logo
              )
            ) : (
              logo
            )}
          </span>
        </div>

        <button
          type="button"
          className={`bubble toggle-bubble menu-btn ${isMenuOpen ? 'open' : ''}`}
          onClick={handleToggle}
          aria-label={menuAriaLabel}
          aria-pressed={isMenuOpen}
          style={{ background: menuBg }}
        >
          <span className="menu-line" style={{ background: menuContentColor }} />
          <span className="menu-line short" style={{ background: menuContentColor }} />
        </button>
      </nav>
      {showOverlay && (
        <div
          ref={overlayRef}
          className={`bubble-menu-items ${useFixedPosition ? 'fixed' : 'absolute'}`}
          aria-hidden={!isMenuOpen}
        >
          <div className="user-type-header">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Who are you?
            </h2>
            <p className="text-lg text-white/70 mb-8">Select your profile to continue</p>
          </div>
          
          <ul className="pill-list" role="menu" aria-label="User type selection">
            {USER_TYPE_ITEMS.map((item, idx) => (
              <li key={idx} role="none" className="pill-col">
                <button
                  type="button"
                  role="menuitem"
                  aria-label={item.ariaLabel}
                  className="pill-link"
                  onClick={() => handleUserTypeSelect(item.value)}
                  style={{
                    // @ts-ignore
                    '--item-rot': `${(idx - 1) * 8}deg`,
                    '--pill-bg': menuBg,
                    '--pill-color': menuContentColor,
                    '--hover-bg': 'hsl(var(--accent))',
                    '--hover-color': 'hsl(var(--accent-foreground))'
                  }}
                  ref={el => {
                    if (el) bubblesRef.current[idx] = el;
                  }}
                >
                  <span className="pill-icon">{item.icon}</span>
                  <span
                    className="pill-label"
                    ref={el => {
                      if (el) labelRefs.current[idx] = el;
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_ITEMS = [
    {
        label: 'Home',
        href: '/',
        ariaLabel: 'Home',
        rotation: -8,
        hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' }
    },
    {
        label: 'Events',
        href: '/events',
        ariaLabel: 'Events',
        rotation: 8,
        hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' }
    },
    {
        label: 'Create',
        href: '/organizer/events/create',
        ariaLabel: 'Create',
        rotation: 8,
        hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' }
    },
    {
        label: 'About',
        href: '/about',
        ariaLabel: 'About',
        rotation: 8,
        hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
    },
    {
        label: 'Resale',
        href: '/resell',
        ariaLabel: 'Resale Market',
        rotation: 8,
        hoverStyles: { bgColor: '#ec4899', textColor: '#ffffff' }
    },
    {
        label: 'Profile',
        href: '/profile',
        ariaLabel: 'Profile',
        rotation: -8,
        hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' }
    }
];



export default function BubbleMenu({
    logo,
    onMenuClick,
    className,
    style,
    menuAriaLabel = 'Toggle menu',
    menuBg = '#fff', // This will now be overridden by style prop but kept as default
    useFixedPosition = true,
    items,
    animationEase = 'back.out(1.5)',
    animationDuration = 0.5,
    staggerDelay = 0.12
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);

    const { currentUser } = useAuth();

    const overlayRef = useRef(null);
    const bubblesRef = useRef([]);
    const labelRefs = useRef([]);

    const menuItems = items?.length ? items : DEFAULT_ITEMS;

    const containerClassName = [
        'bubble-menu',
        useFixedPosition ? 'fixed' : 'absolute',
        'left-0 right-0 top-8',
        'flex items-center justify-between',
        'gap-4 px-8',
        'pointer-events-none',
        'z-[1001]',
        className
    ]
        .filter(Boolean)
        .join(' ');

    const handleToggle = () => {
        const nextState = !isMenuOpen;
        if (nextState) setShowOverlay(true);
        setIsMenuOpen(nextState);
        onMenuClick?.(nextState);
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
                        '-=' + animationDuration * 0.9
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
                    const item = menuItems[i];
                    if (bubble && item) {
                        const rotation = isDesktop ? (item.rotation ?? 0) : 0;
                        gsap.set(bubble, { rotation });
                    }
                });
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMenuOpen, menuItems]);

    return (
        <>
            <style>{`
        .bubble-menu .menu-line {
          transition: transform 0.3s ease, opacity 0.3s ease;
          transform-origin: center;
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):nth-last-child(2) {
          margin-left: calc(100% / 6);
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):last-child {
          margin-left: calc(100% / 3);
        }
        @media (min-width: 900px) {
          .bubble-menu-items .pill-link {
            transform: rotate(var(--item-rot));
          }
          .bubble-menu-items .pill-link:hover {
            transform: rotate(var(--item-rot)) scale(1.06);
            background: var(--hover-bg) !important;
            color: var(--hover-color) !important;
          }
          .bubble-menu-items .pill-link:active {
            transform: rotate(var(--item-rot)) scale(.94);
          }
        }
        @media (max-width: 899px) {
          .bubble-menu-items {
            padding-top: 120px;
            align-items: flex-start;
          }
          .bubble-menu-items .pill-list {
            row-gap: 16px;
          }
          .bubble-menu-items .pill-list .pill-col {
            flex: 0 0 100% !important;
            margin-left: 0 !important;
            overflow: visible;
          }
          .bubble-menu-items .pill-link {
            font-size: clamp(1.2rem, 3vw, 4rem);
            padding: clamp(1rem, 2vw, 2rem) 0;
            min-height: 80px !important;
          }
          .bubble-menu-items .pill-link:hover {
            transform: scale(1.06);
            background: var(--hover-bg);
            color: var(--hover-color);
          }
          .bubble-menu-items .pill-link:active {
            transform: scale(.94);
          }
        }
        
        .menu-btn {
            --line-color: white;
        }
        :global([data-theme="dark"]) .menu-btn {
            --line-color: black;
        }
        .menu-btn.open {
            --line-color: white;
        }
      `}</style>

            <nav className={containerClassName} style={style} aria-label="Main navigation">
                {/* Logo Bubble */}
                <div
                    className={[
                        'bubble logo-bubble',
                        'inline-flex items-center justify-center',
                        'rounded-xl',
                        'bg-[var(--color-bg-surface)]',
                        'shadow-[4px_4px_0_black]',
                        'pointer-events-auto',
                        'h-12 md:h-14',
                        'px-4 md:px-8',
                        'gap-2',
                        'border-2 border-black',
                        'will-change-transform',
                        'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] transition-all'
                    ].join(' ')}
                    aria-label="Logo"
                    style={{
                        background: 'var(--color-bg-surface)',
                        minHeight: '48px',
                    }}
                >
                    <span
                        className={['logo-content', 'inline-flex items-center justify-center'].join(' ')}
                        style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: '999',
                            textTransform: 'uppercase',
                            fontSize: '1.25rem',
                            color: 'var(--color-text-primary)'
                        }}
                    >
                        {logo || 'Tickify'}
                    </span>
                </div>

                {/* Right Side - Avatar + Menu Toggle */}
                <div className="flex items-center gap-3">
                    {/* User Avatar - Shows when logged in (left of menu icon) */}
                    {currentUser && (
                        <Link
                            to="/profile"
                            className={[
                                'bubble user-avatar-bubble',
                                'inline-flex items-center justify-center relative',
                                'rounded-xl',
                                'bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]',
                                'shadow-[4px_4px_0_black]',
                                'pointer-events-auto',
                                'w-12 h-12 md:w-14 md:h-14',
                                'border-2 border-black',
                                'will-change-transform',
                                'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] transition-all',
                                'overflow-hidden',
                                'group'
                            ].join(' ')}
                            aria-label="User Profile"
                            title={currentUser.displayName || currentUser.email}
                        >
                            {currentUser.photoURL ? (
                                <img
                                    src={currentUser.photoURL}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-black text-xl md:text-2xl group-hover:scale-110 transition-transform">
                                    {currentUser.displayName
                                        ? currentUser.displayName.charAt(0).toUpperCase()
                                        : currentUser.email?.charAt(0).toUpperCase() || '?'
                                    }
                                </span>
                            )}
                            {/* Online indicator */}
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full animate-pulse"></span>
                        </Link>
                    )}

                    {/* Menu Toggle Bubble */}
                    <button
                        type="button"
                        className={[
                            'bubble toggle-bubble menu-btn',
                            isMenuOpen ? 'open bg-black border-white' : 'bg-black dark:bg-white border-black dark:border-white',
                            'inline-flex flex-col items-center justify-center',
                            'rounded-xl',
                            'shadow-[4px_4px_0_black] dark:shadow-[4px_4px_0_white]',
                            'pointer-events-auto',
                            'w-12 h-12 md:w-14 md:h-14',
                            'border-2',
                            'cursor-pointer p-0',
                            'will-change-transform',
                            'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] dark:hover:shadow-[6px_6px_0_white] transition-all'
                        ].join(' ')}
                        onClick={handleToggle}
                        aria-label={menuAriaLabel}
                        aria-pressed={isMenuOpen}
                    >
                        <span
                            className="menu-line block mx-auto rounded-[2px] transition-colors"
                            style={{
                                width: 26,
                                height: 3,
                                backgroundColor: isMenuOpen ? 'white' : 'var(--line-color)',
                                transform: isMenuOpen ? 'translateY(4px) rotate(45deg)' : 'none'
                            }}
                        />
                        <span
                            className="menu-line short block mx-auto rounded-[2px] transition-colors"
                            style={{
                                marginTop: '6px',
                                width: 26,
                                height: 3,
                                backgroundColor: isMenuOpen ? 'white' : 'var(--line-color)',
                                transform: isMenuOpen ? 'translateY(-4px) rotate(-45deg)' : 'none'
                            }}
                        />
                    </button>
                </div>
            </nav>

            {/* Menu Overlay */}
            {showOverlay && (
                <div
                    ref={overlayRef}
                    className={[
                        'bubble-menu-items',
                        useFixedPosition ? 'fixed' : 'absolute',
                        'inset-0',
                        'flex items-center justify-center',
                        'pointer-events-none',
                        'z-[1000]',
                        'bg-[var(--color-bg-primary)]/80',
                        'backdrop-blur-md'
                    ].join(' ')}
                    aria-hidden={!isMenuOpen}
                >
                    <ul
                        className={[
                            'pill-list',
                            'list-none m-0 px-6',
                            'w-full max-w-[1600px] mx-auto',
                            'flex flex-wrap',
                            'gap-x-0 gap-y-1',
                            'pointer-events-auto'
                        ].join(' ')}
                        role="menu"
                        aria-label="Menu links"
                    >
                        {menuItems.map((item, idx) => (
                            <li
                                key={idx}
                                role="none"
                                className={[
                                    'pill-col',
                                    'flex justify-center items-stretch',
                                    '[flex:0_0_calc(100%/3)]',
                                    'box-border'
                                ].join(' ')}
                            >
                                <Link
                                    role="menuitem"
                                    to={item.href}
                                    aria-label={item.ariaLabel || item.label}
                                    className={[
                                        'pill-link',
                                        'w-full',
                                        'rounded-xl',
                                        'no-underline',
                                        'bg-white',
                                        'text-inherit',
                                        'shadow-[6px_6px_0_black]',
                                        'border-4 border-black',
                                        'flex items-center justify-center',
                                        'relative',
                                        'transition-all duration-300 ease-in-out',
                                        'box-border',
                                        'whitespace-nowrap overflow-hidden',
                                        'hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[10px_10px_0_black]'
                                    ].join(' ')}
                                    onClick={() => handleToggle()} // Close menu on click
                                    style={{
                                        ['--item-rot']: `${item.rotation ?? 0}deg`,
                                        ['--pill-bg']: 'var(--color-bg-surface)',
                                        ['--pill-color']: 'var(--color-text-primary)',
                                        ['--hover-bg']: item.hoverStyles?.bgColor || '#f3f4f6',
                                        ['--hover-color']: item.hoverStyles?.textColor || '#111',
                                        background: 'var(--pill-bg)',
                                        color: 'var(--pill-color)',
                                        minHeight: 'var(--pill-min-h, 160px)',
                                        padding: 'clamp(1.5rem, 3vw, 8rem) 0',
                                        // fontSize: 'clamp(1.5rem, 4vw, 4rem)', // Removed to control via CSS class if needed, or keep
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        lineHeight: 1,
                                        willChange: 'transform',
                                        height: 10
                                    }}
                                    ref={el => {
                                        if (el) bubblesRef.current[idx] = el;
                                    }}
                                >
                                    <span
                                        className="pill-label inline-block"
                                        style={{
                                            willChange: 'transform, opacity',
                                            fontSize: 'clamp(1.5rem, 4vw, 4rem)',
                                            textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                                        }}
                                        ref={el => {
                                            if (el) labelRefs.current[idx] = el;
                                        }}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}

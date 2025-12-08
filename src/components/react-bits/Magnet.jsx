import { useRef, useState, useEffect } from 'react';

const Magnet = ({ children, padding = 100, disabled = false, magnetStrength = 2 }) => {
    const [isActive, setIsActive] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const magnetRef = useRef(null);

    useEffect(() => {
        if (disabled) {
            setPosition({ x: 0, y: 0 });
            return;
        }

        const handleMouseMove = (e) => {
            if (!magnetRef.current) return;

            const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
            const centerX = left + width / 2;
            const centerY = top + height / 2;

            const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

            if (dist < padding) {
                setIsActive(true);
                const offsetX = (e.clientX - centerX) / magnetStrength;
                const offsetY = (e.clientY - centerY) / magnetStrength;
                setPosition({ x: offsetX, y: offsetY });
            } else {
                setIsActive(false);
                setPosition({ x: 0, y: 0 });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [padding, disabled, magnetStrength]);

    return (
        <div
            ref={magnetRef}
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                transition: isActive ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
                display: 'inline-block',
            }}
        >
            {children}
        </div>
    );
};

export default Magnet;

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const TiltedCard = ({ children, className = '', containerHeight = '300px', containerWidth = '100%', imageSrc, altText = "Tilted card image", captionText = "", rotateAmplitude = 12, scaleOnHover = 1.1, showMobileWarning = false, showTooltip = true, displayOverlayContent = false, overlayContent = null }) => {
    const ref = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Normalize coordinates to -1 to 1
        const xPct = (x / rect.width - 0.5) * 2;
        const yPct = (y / rect.height - 0.5) * 2;

        setMousePosition({ x: xPct, y: yPct });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 }); // Reset to center
    };

    useGSAP(() => {
        if (!ref.current) return;

        // Rotation values
        // RotateX is based on Y position (tilt up/down) - inverted standardly
        const rotateX = isHovered ? mousePosition.y * -rotateAmplitude : 0;
        // RotateY is based on X position (tilt left/right)
        const rotateY = isHovered ? mousePosition.x * rotateAmplitude : 0;

        // Scale
        const scale = isHovered ? scaleOnHover : 1;

        gsap.to(ref.current, {
            rotateX: rotateX,
            rotateY: rotateY,
            scale: scale,
            duration: 0.4,
            ease: "power2.out",
            transformPerspective: 1000, // Important for 3D effect
            transformStyle: "preserve-3d"
        });

        // Optional: Animate inner content (parallax effect) could go here
    }, [mousePosition, isHovered, rotateAmplitude, scaleOnHover]);

    return (
        <div
            className={`relative perspective-1000 ${className}`}
            style={{ height: containerHeight, width: containerWidth }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={ref}
                className="w-full h-full relative preserve-3d shadow-xl rounded-2xl overflow-hidden"
            >
                {/* Background Image / Content */}
                {imageSrc ? (
                    <img src={imageSrc} alt={altText} className="w-full h-full object-cover rounded-2xl pointer-events-none" />
                ) : (
                    // Fallback content if no image
                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)] rounded-2xl flex items-center justify-center">
                        {children}
                    </div>
                )}

                {/* Overlay Content (Parallax potentially) */}
                {(displayOverlayContent && overlayContent) && (
                    <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 to-transparent translate-z-10">
                        {overlayContent}
                    </div>
                )}

                {/* Simple Caption Tooltip */}
                {showTooltip && captionText && (
                    <div className="absolute top-4 left-4 z-20 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold border border-white/20">
                        {captionText}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TiltedCard;

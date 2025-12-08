import { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const BlurText = ({ children, className = '', delay = 0, duration = 1, stagger = 0.05 }) => {
    const textRef = useRef(null);
    const [inView, setInView] = useState(false);
    const observer = useRef();

    useEffect(() => {
        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    if (observer.current) observer.current.disconnect();
                }
            });
        };

        if (window.IntersectionObserver) {
            observer.current = new IntersectionObserver(observerCallback, {
                threshold: 0.1,
                rootMargin: '-50px',
            });
            if (textRef.current) observer.current.observe(textRef.current);
        } else {
            setInView(true);
        }

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, []);

    useGSAP(() => {
        if (inView) {
            // Split text into words/letters if simple string, or just animate the container
            // For BlurText, usually we animate words or characters.
            // Let's assume we want to animate words for a smoother look than characters.
            const elements = textRef.current.children;

            gsap.fromTo(
                elements,
                {
                    filter: 'blur(10px)',
                    opacity: 0,
                    y: 20
                },
                {
                    filter: 'blur(0px)',
                    opacity: 1,
                    y: 0,
                    duration: duration,
                    stagger: stagger,
                    delay: delay,
                    ease: 'power2.out'
                }
            );
        }
    }, [inView, delay, duration, stagger]);

    // Helper to split children into spans if it's a string
    const content = typeof children === 'string'
        ? children.split(" ").map((word, i) => (
            <span key={i} className="inline-block mr-2">{word}</span>
        ))
        : children;

    return (
        <div ref={textRef} className={`inline-block ${className}`}>
            {content}
        </div>
    );
};

export default BlurText;

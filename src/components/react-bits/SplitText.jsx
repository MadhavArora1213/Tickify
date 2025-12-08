import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState, useEffect } from 'react';

const SplitText = ({ children, className, delay = 0, animationFrom = { opacity: 0, y: 30 }, animationTo = { opacity: 1, y: 0 }, ease = 'easeOut', threshold = 0.1, rootMargin = '-100px', textAlign = 'center', onLetterAnimationComplete, }) => {
    const wordsRef = useRef([]);
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
                threshold,
                rootMargin,
            });
            // Observing the first word as a proxy for the whole text
            if (wordsRef.current[0]) {
                observer.current.observe(wordsRef.current[0]);
            }
        } else {
            setInView(true); // Fallback if IntersectionObserver is not supported
        }

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [threshold, rootMargin]);

    useGSAP(() => {
        if (inView) {
            gsap.fromTo(
                wordsRef.current.map(word => word.querySelectorAll('.animated-letter')),
                animationFrom,
                {
                    ...animationTo,
                    stagger: 0.05,
                    delay: delay,
                    ease: ease,
                    onComplete: onLetterAnimationComplete,
                }
            );
        }
    }, [inView, delay, ease, animationTo, animationFrom, onLetterAnimationComplete]);

    const words = children.split(" ");

    // Flatten the array of letters to handle indexing correctly
    let letterIndex = 0;

    return (
        <div className={`split-text ${className}`} style={{ textAlign }}>
            {words.map((word, i) => (
                <div key={i} ref={(el) => (wordsRef.current[i] = el)} style={{ display: 'inline-block', overflow: 'hidden' }}>
                    {word.split('').map((letter, j) => (
                        <span key={j} className="animated-letter" style={{ display: 'inline-block' }}>
                            {letter}
                        </span>
                    ))}
                    {i < words.length - 1 && (
                        <span style={{ display: 'inline-block', width: '0.3em' }}>&nbsp;</span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SplitText;

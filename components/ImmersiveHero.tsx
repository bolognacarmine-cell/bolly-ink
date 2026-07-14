'use client';

import { useEffect, useRef, useState } from 'react';

export default function ImmersiveHero() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationFrameRef = useRef<number>();

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Intersection Observer for mobile entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Mousemove 3D tilt effect with requestAnimationFrame
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate rotation based on mouse position relative to center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Limit rotation to max 15 degrees for subtle effect
    const maxRotation = 15;
    const newRotateY = (mouseX / (rect.width / 2)) * maxRotation;
    const newRotateX = -(mouseY / (rect.height / 2)) * maxRotation;

    // Use requestAnimationFrame for smooth animation
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setRotateX(newRotateX);
      setRotateY(newRotateY);
    });
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    
    setIsHovered(false);
    
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Smooth return to center position
    animationFrameRef.current = requestAnimationFrame(() => {
      setRotateX(0);
      setRotateY(0);
    });
  };

  const handleMouseEnter = () => {
    if (!prefersReducedMotion) {
      setIsHovered(true);
    }
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Hero Content */}
          <div className="heroContent text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              Esperienze Web
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Immersive in 3D
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Trasformiamo le tue idee in esperienze digitali coinvolgenti. 
              Design moderno, performance ottimizzate e animazioni fluide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="ctaPrimary px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105">
                Inizia Ora
              </button>
              <button className="ctaSecondary px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 hover:border-white/50">
                Scopri di Più
              </button>
            </div>
          </div>

          {/* 3D Card Panel */}
          <div 
            ref={cardRef}
            className="scene order-1 lg:order-2"
            style={{ perspective: '1000px' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="card3D relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl transition-transform duration-100 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: prefersReducedMotion 
                  ? 'none' 
                  : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                opacity: isVisible ? 1 : 0,
                transform: prefersReducedMotion
                  ? `translateY(${isVisible ? 0 : 30}px)`
                  : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${isVisible ? 0 : 30}px)`,
                transition: prefersReducedMotion 
                  ? 'opacity 0.6s ease-out, transform 0.6s ease-out'
                  : 'transform 0.1s ease-out, opacity 0.6s ease-out'
              }}
            >
              {/* Layer 1: Background (deepest) */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10"
                style={{ transform: 'translateZ(-30px)' }}
              />
              
              {/* Layer 2: Code editor mockup */}
              <div
                className="absolute inset-4 bg-slate-950 rounded-xl overflow-hidden border border-white/5"
                style={{ transform: 'translateZ(-15px)' }}
              >
                {/* Editor header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                
                {/* Code content */}
                <div className="p-4 font-mono text-sm">
                  <div className="text-purple-400">const</div>
                  <div className="text-blue-400 ml-4">createExperience</div>
                  <div className="text-white ml-4">=</div>
                  <div className="text-yellow-400 ml-4">()</div>
                  <div className="text-white ml-4">{'{'}</div>
                  <div className="text-green-400 ml-8">return</div>
                  <div className="text-pink-400 ml-12">'immersive'</div>
                  <div className="text-white ml-4">{'};'}</div>
                </div>
              </div>

              {/* Layer 3: Floating badge */}
              <div
                className="absolute top-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
                style={{ transform: 'translateZ(20px)' }}
              >
                3D Ready
              </div>

              {/* Layer 4: Interactive button (frontmost) */}
              <div
                className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4"
                style={{ transform: 'translateZ(30px)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Performance</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
              </div>

              {/* Subtle glow effect */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: isHovered && !prefersReducedMotion
                    ? `radial-gradient(circle at ${50 + rotateY * 2}% ${50 - rotateX * 2}%, rgba(168, 85, 247, 0.15), transparent 50%)`
                    : 'none',
                  transform: 'translateZ(40px)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

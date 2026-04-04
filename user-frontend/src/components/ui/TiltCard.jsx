import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const TiltCard = ({ children, className = "" }) => {
  const cardRef = useRef(null);
  const [hovering, setHovering] = useState(false);

  // Motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for floating feel
  const springConfig = { damping: 20, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Exaggerated antigravity transforms
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [20, -20]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  
  // Glare effect
  const glareX = useTransform(smoothX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(smoothY, [-0.5, 0.5], [0, 100]);
  const glareOpacity = useTransform(smoothY, [-0.5, 0.5], [0.1, 0.5]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Normalized coordinates (-0.5 to 0.5)
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseEnter = () => setHovering(true);
  const handleMouseLeave = () => {
    setHovering(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1200
      }}
      className={`relative glass-panel rounded-2xl p-6 shadow-2xl transition-all duration-300 ease-out hover:z-50 border border-white/5 ${className}`}
    >
      {/* Glare/Spotlight Layer */}
      {hovering && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl mix-blend-overlay"
          style={{
            background: `radial-gradient(circle 150px at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.4), transparent)`,
            opacity: glareOpacity
          }}
        />
      )}

      {/* Content wrapper with extreme pop-out */}
      <motion.div
        style={{ transform: "translateZ(60px)", transformStyle: "preserve-3d" }}
        className="w-full h-full relative z-10"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default TiltCard;

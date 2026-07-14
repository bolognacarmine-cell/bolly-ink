'use client';

import { useEffect, useRef, useState } from 'react';

interface Use3DTiltOptions {
  maxRotation?: number;
  disabled?: boolean;
}

interface Use3DTiltReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  rotateX: number;
  rotateY: number;
  isHovered: boolean;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export function use3DTilt({
  maxRotation = 8,
  disabled = false
}: Use3DTiltOptions = {}): Use3DTiltReturn {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const card = ref.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const newRotateY = (mouseX / (rect.width / 2)) * maxRotation;
    const newRotateX = -(mouseY / (rect.height / 2)) * maxRotation;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setRotateX(newRotateX);
      setRotateY(newRotateY);
    });
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    
    setIsHovered(false);
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setRotateX(0);
      setRotateY(0);
    });
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    ref,
    rotateX,
    rotateY,
    isHovered,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  };
}

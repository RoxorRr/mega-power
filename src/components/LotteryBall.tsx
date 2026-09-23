/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface LotteryBallProps {
  number: number;
  type: 'white' | 'gold' | 'red';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isHighlighted?: boolean;
  delayIndex?: number;
  animate?: boolean;
}

export const LotteryBall: React.FC<LotteryBallProps> = ({
  number,
  type,
  size = 'md',
  isHighlighted = false,
  delayIndex = 0,
  animate = true,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm md:w-12 md:h-12 md:text-base',
    lg: 'w-14 h-14 text-lg md:w-16 md:h-16 md:text-xl',
    xl: 'w-16 h-16 text-xl md:w-20 md:h-20 md:text-2xl',
  };

  const ballStyleClass = 
    type === 'gold' 
      ? 'lottery-ball-gold text-neutral-950 font-bold border-amber-300/40' 
      : type === 'red' 
      ? 'lottery-ball-red text-white font-bold border-red-400/40' 
      : 'lottery-ball-white text-neutral-900 font-bold border-neutral-300';

  const content = (
    <div
      className={`
        relative rounded-full flex items-center justify-center font-mono-tabular select-none
        border border-white/20 transition-transform duration-200
        ${sizeClasses[size]}
        ${ballStyleClass}
        ${isHighlighted ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-neutral-950 scale-105' : ''}
      `}
    >
      {/* Specular highlight glint */}
      <div className="absolute top-1 left-2 w-3 h-2 bg-white/70 rounded-full blur-[0.5px] rotate-[-25deg] pointer-events-none" />
      
      {/* Ball Number */}
      <span className="relative z-10 font-black tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
        {number < 10 ? `0${number}` : number}
      </span>
      
      {/* Subtle bottom shadow curvature inside */}
      <div className="absolute bottom-1 w-2/3 h-1 bg-black/15 rounded-full blur-[1px] pointer-events-none" />
    </div>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial={{ scale: 0, y: 18, opacity: 0, rotate: -45 }}
      animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 18,
        delay: delayIndex * 0.08,
      }}
      className="inline-block"
    >
      {content}
    </motion.div>
  );
};

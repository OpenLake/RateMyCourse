"use client"

import React, { useState, useEffect } from 'react';
import { Gauge, AlertTriangle, Flame, Coffee, Thermometer } from 'lucide-react';

interface PainOMeterProps {
  difficulty?: number;
  workload?: number;
  rating?: number;
}

interface PainLevelInfo {
  color: string;
  textColor: string;
  label: string;
  emoji: string;
  icon: React.ReactNode;
  description: string;
}

interface FactorCardProps {
  title: string;
  value: number;
  maxValue: number;
  color: string;
}

export default function PainOMeter({ 
  difficulty = 7,
  workload = 6,
  rating = 3
}: PainOMeterProps) {
  
  const calculatePainScore = (): number => {
    return Math.min(100, Math.max(0, Math.round(
      ((0.4 * difficulty) + (0.3 * workload) + (0.3 * (10 - 2 * rating))) * 10
    )));
  };

  const painScore = calculatePainScore();
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  
  useEffect(() => {
    const start = animatedScore;
    const end = painScore;
    const duration = 1500;
    const startTime = performance.now();
    let animationFrameId: number;
    
    const animateGauge = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuad = (x: number): number => {
        return 1 - (1 - x) * (1 - x);
      };
      
      const easedProgress = easeOutQuad(progress);
      const currentValue = Math.round(start + (end - start) * easedProgress);
      setAnimatedScore(currentValue);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateGauge);
      }
    };
    
    if (start !== end) {
      animationFrameId = requestAnimationFrame(animateGauge);
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [painScore]);

  const getPainLevel = (score: number): PainLevelInfo => {
    if (score < 20) return { 
      color: 'bg-gradient-to-r from-blue-500/80 to-blue-600/80 dark:from-blue-600/70 dark:to-blue-800/70', 
      label: 'Chill Vibes', 
      emoji: '🌴',
      textColor: 'text-blue-700 dark:text-blue-300',
      icon: <Coffee className="w-5 h-5" />,
      description: 'Relaxed course with minimal stress'
    };
    if (score < 40) return { 
      color: 'bg-gradient-to-r from-emerald-500/80 to-emerald-600/80 dark:from-emerald-600/70 dark:to-emerald-800/70', 
      label: 'Manageable', 
      emoji: '✌️',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      icon: <Coffee className="w-5 h-5" />,
      description: 'Balanced workload with reasonable demands'
    };
    if (score < 60) return { 
      color: 'bg-gradient-to-r from-amber-500/80 to-amber-600/80 dark:from-amber-600/70 dark:to-amber-800/70', 
      label: 'Tiring', 
      emoji: '🥵',
      textColor: 'text-amber-700 dark:text-amber-300',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'Challenging course that requires dedication'
    };
    if (score < 80) return { 
      color: 'bg-gradient-to-r from-orange-500/80 to-orange-600/80 dark:from-orange-600/70 dark:to-orange-800/70', 
      label: 'Brutal', 
      emoji: '😭',
      textColor: 'text-orange-700 dark:text-orange-300',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'Significantly demanding with high stress levels'
    };
    return { 
      color: 'bg-gradient-to-r from-rose-500/80 to-rose-600/80 dark:from-rose-600/70 dark:to-rose-800/70', 
      label: 'Hell Mode', 
      emoji: '🔥',
      textColor: 'text-rose-700 dark:text-rose-300',
      icon: <Flame className="w-5 h-5" />,
      description: 'Extreme difficulty that will consume your life'
    };
  };

  const painLevel = getPainLevel(painScore);
  const rotation = (animatedScore / 100) * 180;

  const ticks = Array.from({ length: 11 }, (_, i) => i * 18);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-muted overflow-hidden">
    <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden transition-all duration-300">
      <div className="p-3 sm:p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
        <h2 className="font-semibold flex items-center gap-2 text-card-foreground text-sm sm:text-base">
          <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Pain-O-Meter
          <span className="ml-auto text-xs text-muted-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 bg-secondary rounded-full whitespace-nowrap text-[10px] sm:text-xs">Student Experience Rating</span>
        </h2>
      </div>
      
      <div className="p-3 sm:p-6">
        {/* Pain Level Badge */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className={`${painLevel.color} px-4 sm:px-6 py-1.5 sm:py-2 rounded-full flex items-center gap-2 sm:gap-3 text-white font-medium shadow-md`}>
            <span>{painLevel.icon}</span>
            <span className="text-base sm:text-lg">{painLevel.label}</span>
            <span className="text-lg sm:text-xl">{painLevel.emoji}</span>
          </div>
        </div>
        
        {/* Gauge display */}
        <div className="relative">
          {/* Semi-circle background */}
          <div className="h-36 sm:h-48 w-full relative flex justify-center">
            {/* Gauge Background - using CSS variables for theme compatibility */}
            <div className="absolute w-48 sm:w-64 h-24 sm:h-32 overflow-hidden shadow-inner rounded-t-full bg-gradient-to-r from-[hsl(var(--chart-2))] via-[hsl(var(--chart-4))] to-[hsl(var(--chart-1))]"></div>
            
            {/* Ticks */}
            {ticks.map((tick, i) => (
              <div 
                key={i} 
                className="absolute bottom-0 bg-white/80 dark:bg-gray-300/80"
                style={{ 
                  transform: `rotate(${tick - 90}deg)`, 
                  transformOrigin: 'bottom center',
                  width: i % 5 === 0 ? '2px' : '1px',
                  height: i % 5 === 0 ? '12px' : '6px' 
                }}
              />
            ))}
            
            {/* Score display */}
            <div className="absolute top-6 sm:top-10 flex flex-col items-center">
              <div className="text-3xl sm:text-5xl font-bold text-card-foreground">{animatedScore}</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5 sm:mt-1">PAIN SCORE</div>
            </div>
            
            {/* Gauge needle with shadow */}
            <div className="absolute bottom-0 flex justify-center w-full">
              <div 
                className="relative w-1 sm:w-1.5 bg-destructive rounded-full h-24 sm:h-32" 
                style={{ 
                  transform: `rotate(${rotation - 90}deg)`, 
                  transformOrigin: 'bottom center',
                  boxShadow: '0 0 8px rgba(0,0,0,0.3)',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                <div className="w-3 h-3 sm:w-5 sm:h-5 bg-destructive absolute -left-1 sm:-left-1.5 -top-1.5 sm:-top-2.5 rounded-full shadow-lg"></div>
              </div>
            </div>
            
            {/* Gauge center point with 3D effect */}
            <div className="absolute bottom-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-100 to-gray-400 dark:from-gray-700 dark:to-gray-900 rounded-full border-2 border-gray-700 dark:border-gray-500 shadow-lg"></div>
          </div>
          
          {/* Description */}
          <div className="text-center mt-2 sm:mt-4 text-muted-foreground italic px-4 sm:px-6 text-sm sm:text-base">
            "{painLevel.description}"
          </div>
          
          {/* Pain factors with improved design */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
            <FactorCard 
              title="Difficulty" 
              value={difficulty} 
              maxValue={10} 
              color="bg-[hsl(var(--chart-1))]"
            />
            
            <FactorCard 
              title="Workload" 
              value={workload} 
              maxValue={10} 
              color="bg-[hsl(var(--chart-2))]"
            />
            
            <FactorCard 
              title="Rating" 
              value={rating} 
              maxValue={5} 
              color="bg-[hsl(var(--chart-3))]"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

function FactorCard({ title, value, maxValue, color }: FactorCardProps) {
  return (
    <div className="p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border shadow-sm text-center transition-all hover:shadow-md hover:translate-y-px">
      <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{title}</div>
      <div className="font-bold text-lg sm:text-xl text-card-foreground">
        {value}<span className="text-xs text-muted-foreground ml-1">/{maxValue}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 mt-1.5 sm:mt-2">
        <div className={`${color} h-1.5 sm:h-2 rounded-full`} style={{ width: `${(value / maxValue) * 100}%` }}></div>
      </div>
    </div>
  );
}
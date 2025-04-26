import { Position } from '../types';

// Calculate the angle between two positions
export const calculateAngle = (p1: Position, p2: Position): number => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

// Move a position towards a target by a certain speed
export const moveTowards = (current: Position, target: Position, speed: number): Position => {
  const angle = calculateAngle(current, target);
  const dx = Math.cos(angle) * speed;
  const dy = Math.sin(angle) * speed;
  
  return {
    x: current.x + dx,
    y: current.y + dy,
  };
};

// Format time in MM:SS.ms format
export const formatTime = (timeInMs: number): string => {
  const minutes = Math.floor(timeInMs / 60000);
  const seconds = Math.floor((timeInMs % 60000) / 1000);
  const ms = Math.floor((timeInMs % 1000) / 10);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

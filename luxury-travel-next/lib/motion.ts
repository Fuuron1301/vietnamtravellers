import { motion as tokenMotion } from './design-tokens';

export const luxeEase = tokenMotion.ease;

export const fadeUp = {
  hidden: { opacity: 0, y: tokenMotion.fadeDistance },
  visible: { opacity: 1, y: 0 }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } }
};

export const imageZoom = {
  rest: { scale: 1 },
  hover: { scale: tokenMotion.imageHoverScale }
};

export const hoverLift = {
  rest: { y: 0, boxShadow: '0 12px 32px rgba(11, 27, 43, 0.08)' },
  hover: { y: -6, boxShadow: '0 18px 44px rgba(11, 27, 43, 0.12)' }
};

export const slideStep = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 }
};

export const luxeTransition = {
  duration: tokenMotion.sectionDuration,
  ease: tokenMotion.ease
};

export const hoverTransition = {
  duration: tokenMotion.microDuration,
  ease: tokenMotion.ease
};


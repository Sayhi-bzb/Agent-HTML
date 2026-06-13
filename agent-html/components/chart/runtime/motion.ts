import { motion } from "motion/react"

export const chartMotion = {
  hover: {
    damping: 34,
    mass: 0.7,
    stiffness: 420,
    type: "spring",
  },
  layout: {
    damping: 30,
    mass: 0.9,
    stiffness: 260,
    type: "spring",
  },
} as const

export const ChartMotionGroup = motion.g

export const ChartMotionPath = motion.path

export const ChartMotionRect = motion.rect

export const ChartMotionCircle = motion.circle

export const ChartMotionText = motion.text

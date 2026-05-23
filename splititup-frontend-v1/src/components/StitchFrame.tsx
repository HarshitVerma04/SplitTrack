import { motion } from 'framer-motion'

type StitchFrameProps = {
  title: string
  src: string
}

export function StitchFrame({ title, src }: StitchFrameProps) {
  return (
    <motion.main
      key={src}
      aria-label={title}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="h-screen w-screen overflow-hidden"
    >
      <iframe
        title={title}
        src={src}
        className="h-full w-full border-0"
        loading="eager"
      />
    </motion.main>
  )
}

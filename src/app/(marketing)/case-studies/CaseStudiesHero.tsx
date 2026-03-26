"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { SECTION_EYEBROW_CLASSNAME } from "@/components/ui/SectionHeading";

export default function CaseStudiesHero() {
  return (
    <section className="hero-sky relative overflow-hidden pb-24 pt-28 sm:pb-32 sm:pt-32">
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <motion.span
          initial={{ opacity: 1, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className={`mb-5 ${SECTION_EYEBROW_CLASSNAME}`}
        >
          Work
        </motion.span>

        <motion.h1
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="heading-display flex flex-col gap-2 text-4xl font-bold leading-[1.12] tracking-tight text-text-primary sm:gap-3 sm:text-5xl sm:leading-[1.1] lg:text-6xl lg:leading-[1.08]"
        >
          <span className="block">Products that</span>
          <span className="block text-accent">scale</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 1, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14 }}
          className="mx-auto mt-8 max-w-xl text-base font-medium leading-relaxed text-pretty text-text-primary/80 sm:mt-9 sm:text-lg"
        >
          We build products that move fast and last long. Every project we take
          on is a reflection of our commitment to speed, quality, and real
          results — from early-stage MVPs to fully scaled software products.
        </motion.p>

        <motion.div
          initial={{ opacity: 1, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22 }}
          className="mt-11 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mt-12 sm:flex-row sm:items-center sm:justify-center sm:gap-4"
        >
          <Button href="#projects" variant="primary" size="lg">
            Explore projects
          </Button>
          <Button href="/booking" variant="dark" size="lg" showLiveDot>
            Book a call
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

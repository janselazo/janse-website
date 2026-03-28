import type { Metadata } from "next";
import PricingHero from "./PricingHero";
import PricingGrid from "@/components/services/PricingGrid";
import FAQ from "@/components/services/FAQ";
import CTASection from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Development pricing: Websites from $999, Web Apps from $1,999, Mobile Apps from $2,999, Video Games from $3,999. Transparent starting points — book a call for a scoped quote. Custom work $100–$150/h.",
};

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <PricingGrid />
      <FAQ />
      <CTASection />
    </>
  );
}

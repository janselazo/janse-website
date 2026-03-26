import type { Metadata } from "next";
import CaseStudiesHero from "./CaseStudiesHero";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Products that move fast and last long — MVPs to scaled software. Case studies and work from AI Product Studio.",
};

export default function CaseStudiesPage() {
  return (
    <>
      <CaseStudiesHero />
      <PortfolioGrid />
    </>
  );
}

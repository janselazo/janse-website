import type { DevelopmentPricingOffering } from "@/lib/data";
import { developmentPricingOfferings } from "@/lib/data";
import Button from "@/components/ui/Button";

function FeatureCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function OfferingCard({ offering }: { offering: DevelopmentPricingOffering }) {
  return (
    <article
      id={`pricing-${offering.id}`}
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-soft-lg ring-1 ring-black/[0.04]"
    >
      <div className="border-b border-border/70 bg-gradient-to-b from-surface-light/90 to-white px-5 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-7">
        <h2 className="text-lg font-bold tracking-tight text-text-primary sm:text-xl">
          {offering.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-[15px]">
          {offering.subtitle}
        </p>
        <p className="mt-4 text-xl font-semibold tracking-tight text-accent sm:text-2xl">
          {offering.startingPriceLabel}
        </p>
      </div>
      <ul className="flex flex-1 flex-col gap-3 px-5 py-5 sm:px-6 sm:py-6">
        {offering.features.map((line) => (
          <li key={line} className="flex gap-3 text-sm leading-relaxed text-text-primary/90">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/20">
              <FeatureCheckIcon className="h-3.5 w-3.5" />
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto border-t border-border/60 bg-surface-light/40 px-5 py-5 sm:px-6">
        <Button href="/booking" variant="primary" size="lg" className="w-full justify-center">
          Book a call
        </Button>
      </div>
    </article>
  );
}

export default function DevelopmentPricingTables({
  offerings = developmentPricingOfferings,
}: {
  offerings?: DevelopmentPricingOffering[];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {offerings.map((offering) => (
        <OfferingCard key={offering.id} offering={offering} />
      ))}
    </div>
  );
}

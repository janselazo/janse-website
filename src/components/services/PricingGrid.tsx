import DevelopmentPricingTables from "@/components/services/DevelopmentPricingTables";

export default function PricingGrid() {
  return (
    <section className="border-t border-border/50 bg-[#f4f5f7] pb-24 pt-10 lg:pb-32 lg:pt-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <DevelopmentPricingTables />
      </div>
    </section>
  );
}

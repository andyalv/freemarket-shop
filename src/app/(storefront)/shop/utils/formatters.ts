const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const harvestDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatHarvestDate(value: string) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return harvestDateFormatter.format(parsedDate);
}

export function formatBatchHarvest(batchHarvest: string, harvestDate: string) {
  return `Harvest lot ${batchHarvest} · ${formatHarvestDate(harvestDate)}`;
}

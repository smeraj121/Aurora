
import type { ServiceItem } from "../../../shared/types/booking";
import type { PackageService } from "../types/types";


/**
 * Calculates the total amount and total duration for a list of services.
 * If a service ID is not found in the service catalog, it is skipped.
 *
 * @param services - Array of PackageService (serviceId, serviceName, price)
 * @param serviceList - Full list of available services with price and duration
 * @returns An object containing total amount and total duration in minutes
 */
export function calculateBookingTotals(
  services: PackageService[],
  serviceList: ServiceItem[]
): { amount: number; durationMinutes: number } {
  let totalAmount = 0;
  let totalDuration = 0;

  for (const svc of services) {
    const fullService = serviceList.find((s) => s.id === svc.serviceId);
    if (fullService) {
        console.log(fullService);
      // Use the catalog price (the svc.price might be overridden for packages)
      totalAmount +=  fullService.price;
      totalDuration += fullService.durationMinutes;
    }
    // If not found, we skip it (but could also use svc.price as fallback)
  }

  return { amount: totalAmount, durationMinutes: totalDuration };
}
/**
 * Customer Engagement rules configuration.
 *
 * Centralizes the tunable numbers/offers used by the Customer Engagement
 * feature so they can be changed in one place without touching
 * controllers, services, or frontend code.
 */
module.exports = {
  birthday: {
    defaultWithinDays: 7,
    // Suggested discount percentage, keyed by the category of the
    // customer's most recent service. Falls back to defaultOfferPercentage
    // when the category isn't listed here or there's no recent service.
    offerPercentageByCategory: {
      Hair: 20,
      Nails: 15,
      Skin: 20,
      Dermatology: 20,
    },
    defaultOfferPercentage: 15,
  },

  appointment: {
    defaultWithinDays: 2,
  },

  followup: {
    daysSinceLastVisit: 30,
  },
};
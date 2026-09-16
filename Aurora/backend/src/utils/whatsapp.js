/**
 * Helpers for building WhatsApp click-to-chat links.
 * https://wa.me/<phone>?text=<url-encoded message>
 */

// Strips everything except digits — wa.me expects international
// format with no spaces, +, or dashes.
function formatPhoneForWhatsApp(phone) {
  return "+91"+(phone || '').replace(/\D/g, '');
}

function buildWhatsAppUrl(phone, message) {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message || '');
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

module.exports = { formatPhoneForWhatsApp, buildWhatsAppUrl };
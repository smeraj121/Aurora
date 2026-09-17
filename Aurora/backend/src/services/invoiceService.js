const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const appointmentRepository = require('../repositories/appointmentRepository');
const tenantRepository = require('../repositories/tenantRepository');
const customerService = require('./customerService');
const customerPackageRepository = require('../repositories/customerPackageRepository');
const { NotFoundError, ForbiddenError, ValidationError } = require('../errors');

// Visual Design Tokens
const PURPLE = '#7C2BC8';
const INK = '#0F172A';
const MUTED = '#64748B';
const SUBTLE_GRAY = '#94A3B8';
const LIGHT_BORDER = '#E2E8F0';

// Font File Paths (Production-Safe Relative Resolution)
const FONT_REGULAR_PATH = path.join(__dirname, '../assets/fonts/NotoSans-Regular.ttf');
const FONT_BOLD_PATH = path.join(__dirname, '../assets/fonts/NotoSans-Bold.ttf');

function registerFonts(doc) {
  if (fs.existsSync(FONT_REGULAR_PATH) && fs.existsSync(FONT_BOLD_PATH)) {
    doc.registerFont('AuroraSans', FONT_REGULAR_PATH);
    doc.registerFont('AuroraSans-Bold', FONT_BOLD_PATH);
    return { regular: 'AuroraSans', bold: 'AuroraSans-Bold' };
  }

  // Fallback to standard Helvetica if font files are missing in dev
  return { regular: 'Helvetica', bold: 'Helvetica-Bold' };
}

function formatINR(amount) {
  const n = Number(amount) || 0;
  const hasFraction = Math.abs(n % 1) > 0.001;
  const formattedNumber = n.toLocaleString('en-IN', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `\u20B9${formattedNumber}`;
}

function formatInvoiceDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// FETCH + AUTHORIZE (BUSINESS LOGIC UNCHANGED)
// ============================================================
async function getInvoiceData(tenantId, appointmentId, systemRole, userId) {
  const appointment = await appointmentRepository.getAppointmentForInvoice(tenantId, appointmentId);
  if (!appointment) {
    throw new NotFoundError('Appointment not found.');
  }

  const normalizedRole = systemRole?.trim().toLowerCase();
  if (normalizedRole === 'customer') {
    const customerId = await customerService.getCustomerIdForUser(tenantId, userId);
    if (appointment.customerId !== customerId) {
      throw new ForbiddenError('You do not have access to this invoice.');
    }
  }

  if (appointment.status !== 'completed') {
    throw new ValidationError('Invoices are only available for completed appointments.');
  }

  const tenant = await tenantRepository.getBillingInfo(tenantId);
  return { appointment, tenant };
}

function buildTenantAddressLines(tenant) {
  const lines = [];

  if (tenant.address) {
    lines.push(tenant.address);
  }
  const cityStateBits = [tenant.city, tenant.state].filter(Boolean);   
  if (cityStateBits.length) lines.push(cityStateBits.join(', '));

  if (tenant.postalCode) {
    lines.push(tenant.postalCode);
  }

  if (tenant.email) {
    lines.push(tenant.email);
  }

  if (tenant.phone) {
    lines.push(tenant.phone);
  }

  return lines;
}

function drawFullDivider(doc) {
  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const y = doc.y;

  doc.save()
    .strokeColor(PURPLE)
    .lineWidth(1)
    .moveTo(left, y)
    .lineTo(left + width, y)
    .stroke()
    .restore();
}

function ensureSpace(doc, needed) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + needed > bottom) {
    doc.addPage();
  }
}

// ============================================================
// PDF RENDER
// ============================================================
function renderInvoicePdf(doc, { tenant, appointment }) {
  const fonts = registerFonts(doc);
  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Vertical Spacing Constants
  const GAP_HEADER_BOTTOM = 22;
  const GAP_SECTION_DIVIDER = 18;
  const GAP_SECTION_CONTENT = 14;
  const GAP_ROW = 8;

  // ------------------------------------------------------------
  // 1. HEADER (Tenant Info Left / INVOICE Title Right)
  // ------------------------------------------------------------
  const headerTopY = doc.y;
  const leftColWidth = width * 0.58;
  const rightColWidth = width * 0.38;
  const rightColX = left + width - rightColWidth;

  // Tenant Name & Address (Left)
  doc.font(fonts.bold).fontSize(22).fillColor(INK);
  doc.text(tenant.name || 'Your Business', left, headerTopY, { width: leftColWidth });
  const tenantNameEndY = doc.y;

  doc.moveDown(0.3);
  doc.font(fonts.regular).fontSize(10.5).fillColor(MUTED);
  buildTenantAddressLines(tenant).forEach((line) => {
    doc.text(line, left, doc.y, { width: leftColWidth });
  });
  const leftHeaderEndY = doc.y;

  // Invoice Title & Date (Right)
  doc.font(fonts.bold).fontSize(18).fillColor(PURPLE);
  doc.text('INVOICE', rightColX, headerTopY, { width: rightColWidth, align: 'right' });
  
  doc.moveDown(0.2);
  doc.font(fonts.regular).fontSize(10).fillColor(MUTED);
  doc.text(formatInvoiceDate(appointment.date), rightColX, doc.y, { width: rightColWidth, align: 'right' });
  const rightHeaderEndY = doc.y;

  // Set Y to below the lowest header column
  doc.y = Math.max(leftHeaderEndY, rightHeaderEndY) + GAP_HEADER_BOTTOM;

  // Top Divider
  drawFullDivider(doc);
  doc.y += GAP_SECTION_DIVIDER;

  // ------------------------------------------------------------
  // 2. CUSTOMER / APPOINTMENT (Two Columns)
  // ------------------------------------------------------------
  const custColWidth = width * 0.48;
  const apptColX = left + width - custColWidth;
  const metaSectionTopY = doc.y;

  // Customer Column (Left)
  doc.font(fonts.bold).fontSize(9.5).fillColor(PURPLE);
  doc.text('CUSTOMER', left, metaSectionTopY, { characterSpacing: 0.8 });
  doc.moveDown(0.4);

  doc.font(fonts.bold).fontSize(13.5).fillColor(INK);
  doc.text(appointment.customerName || 'Customer', left, doc.y, { width: custColWidth });

  if (appointment.customerPhone) {
    doc.moveDown(0.2);
    doc.font(fonts.regular).fontSize(10.5).fillColor(MUTED);
    doc.text(appointment.customerPhone, left, doc.y, { width: custColWidth });
  }
  const custColEndY = doc.y;

  // Appointment Column (Right)
  doc.font(fonts.bold).fontSize(9.5).fillColor(PURPLE);
  doc.text('APPOINTMENT', apptColX, metaSectionTopY, { characterSpacing: 0.8 });
  doc.moveDown(0.4);

  doc.font(fonts.regular).fontSize(11).fillColor(INK);
  const timeFormatted = `${formatInvoiceDate(appointment.date)}  ·  ${appointment.startTime}${appointment.endTime ? ' – ' + appointment.endTime : ''}`;
  doc.text(timeFormatted, apptColX, doc.y, { width: custColWidth });

  if (appointment.staffName) {
    doc.moveDown(0.2);
    doc.font(fonts.regular).fontSize(10).fillColor(MUTED);
    doc.text(`Staff: ${appointment.staffName}`, apptColX, doc.y, { width: custColWidth });
  }
  const apptColEndY = doc.y;

  doc.y = Math.max(custColEndY, apptColEndY) + GAP_SECTION_CONTENT;

  // Middle Divider
  drawFullDivider(doc);
  doc.y += GAP_SECTION_DIVIDER;

  // ------------------------------------------------------------
  // 3. SERVICES (Table-Free Simple Text Rows)
  // ------------------------------------------------------------
  doc.font(fonts.bold).fontSize(9.5).fillColor(PURPLE);
  doc.text('SERVICES', left, doc.y, { characterSpacing: 0.8 });
  doc.y += GAP_SECTION_CONTENT;

  const serviceNameWidth = width * 0.72;
  const priceWidth = width * 0.25;
  const priceX = left + width - priceWidth;

  if (appointment.isPackageAppointment) {
    ensureSpace(doc, 50);
    const rowY = doc.y;

    // Package Name (Bold) & Price Right Aligned
    doc.font(fonts.bold).fontSize(11.5).fillColor(INK);
    doc.text(appointment.packageName || 'Package', left, rowY, { width: serviceNameWidth });
    const packageNameEndY = doc.y;

    doc.font(fonts.bold).fontSize(11.5).fillColor(INK);
    doc.text(formatINR(appointment.amount), priceX, rowY, { width: priceWidth, align: 'right' });
    const packagePriceEndY = doc.y;

    doc.y = Math.max(packageNameEndY, packagePriceEndY) + 6;

    const includedServices = (appointment.services || []).map((s) => s.serviceName).filter(Boolean);
    if (includedServices.length > 0) {
      doc.font(fonts.regular).fontSize(9.5).fillColor(MUTED);
      doc.text('Includes', left + 8, doc.y);
      doc.moveDown(0.3);

      includedServices.forEach((name) => {
        ensureSpace(doc, 18);
        doc.font(fonts.regular).fontSize(10.5).fillColor(INK);
        doc.text(`•  ${name}`, left + 16, doc.y, { width: serviceNameWidth - 16 });
        doc.y += 4;
      });
    }
  } else {
    const services = appointment.services?.length > 0
      ? appointment.services
      : [{ serviceName: 'Service', price: appointment.amount }];

    services.forEach((svc) => {
      ensureSpace(doc, 24);
      const rowY = doc.y;

      doc.font(fonts.regular).fontSize(11).fillColor(INK);
      doc.text(svc.serviceName || 'Service', left, rowY, { width: serviceNameWidth });
      const svcNameEndY = doc.y;

      doc.font(fonts.regular).fontSize(11).fillColor(INK);
      doc.text(formatINR(svc.price), priceX, rowY, { width: priceWidth, align: 'right' });
      const svcPriceEndY = doc.y;

      doc.y = Math.max(svcNameEndY, svcPriceEndY) + GAP_ROW;
    });
  }

  doc.y += GAP_SECTION_CONTENT;

  // Divider before Totals
  drawFullDivider(doc);
  doc.y += GAP_SECTION_DIVIDER;

  // ------------------------------------------------------------
  // 4. TOTALS (Aligned Right with Precise Purple Lines for Balance Due)
  // ------------------------------------------------------------
  ensureSpace(doc, 170);

  const totalsColWidth = width * 0.48;
  const totalsX = left + width - totalsColWidth;
  const labelWidth = totalsColWidth * 0.55;
  const valueWidth = totalsColWidth * 0.45;
  const valX = totalsX + labelWidth;

  function drawTotalsRow(label, valueText, opts = {}) {
    const currentY = doc.y;
    const fontName = opts.bold ? fonts.bold : fonts.regular;
    const fontSize = opts.size || 11;
    const textColor = opts.color || INK;

    doc.font(fontName).fontSize(fontSize).fillColor(textColor);
    doc.text(label, totalsX, currentY, { width: labelWidth });

    doc.font(opts.valBold !== undefined ? (opts.valBold ? fonts.bold : fonts.regular) : fontName)
       .fontSize(fontSize)
       .fillColor(opts.valColor || textColor);
    doc.text(valueText, valX, currentY, { width: valueWidth, align: 'right' });

    doc.y = Math.max(doc.y, currentY + fontSize + 4);
  }

  const subtotal = Number(appointment.amount) || 0;
  const paid = Number(appointment.paidAmount) || 0;
  const balanceDue = Math.max(subtotal - paid, 0);

  // Subtotal Row
  drawTotalsRow('Subtotal', formatINR(subtotal));
  doc.y += 6;

  // Thin Light Divider above Total
  doc.save()
    .strokeColor(LIGHT_BORDER)
    .lineWidth(0.75)
    .moveTo(totalsX, doc.y)
    .lineTo(totalsX + totalsColWidth, doc.y)
    .stroke()
    .restore();
  doc.y += 8;

  // Total Row
  drawTotalsRow('Total', formatINR(subtotal), { bold: true, size: 12.5 });
  doc.y += 4;

  // Amount Paid Row
  drawTotalsRow('Amount Paid', formatINR(paid));
  doc.y += 8;

  // --- BALANCE DUE SECTION ---
  // Horizontal Purple Line ABOVE Balance Due
  doc.save()
    .strokeColor(PURPLE)
    .lineWidth(1)
    .moveTo(totalsX, doc.y)
    .lineTo(totalsX + totalsColWidth, doc.y)
    .stroke()
    .restore();
  doc.y += 8;

  // Balance Due Row
  drawTotalsRow('Balance Due', formatINR(balanceDue), { bold: true, size: 13 });
  doc.y += 4;

  // Horizontal Purple Line BELOW Balance Due
  doc.save()
    .strokeColor(PURPLE)
    .lineWidth(1)
    .moveTo(totalsX, doc.y)
    .lineTo(totalsX + totalsColWidth, doc.y)
    .stroke()
    .restore();
  doc.y += 10;

  // Payment Status Row
  const statusColor = appointment.paymentStatus === 'paid' ? '#059669'
    : appointment.paymentStatus === 'refunded' ? '#E11D48' : PURPLE;

  drawTotalsRow('Payment Status', capitalize(appointment.paymentStatus), {
    valColor: statusColor,
    valBold: true,
  });

  doc.y += GAP_SECTION_CONTENT + 10;

  // Bottom Divider
  drawFullDivider(doc);
  doc.y += GAP_SECTION_DIVIDER;

  // ------------------------------------------------------------
  // 5. FOOTER
  // ------------------------------------------------------------
  ensureSpace(doc, 50);

  doc.font(fonts.regular).fontSize(12.5).fillColor(PURPLE);
  doc.text('Thank you for visiting us.', left, doc.y, { width, align: 'center' });

  doc.y += 10;
  doc.font(fonts.regular).fontSize(8.5).fillColor(SUBTLE_GRAY);
  doc.text('Powered by Aurora', left, doc.y, { width, align: 'center' });
}

async function streamInvoicePdf(res, { tenant, appointment }) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 54, right: 54 },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${appointment.id}.pdf"`);

  doc.pipe(res);
  renderInvoicePdf(doc, { tenant, appointment });
  doc.end();
}

// ============================================================
// PACKAGE PURCHASE INVOICE — FETCH + AUTHORIZE
// ============================================================
async function getPackageInvoiceData(tenantId, userId, packageId) {
  const customerId = await customerService.getCustomerIdForUser(tenantId, userId);
  const pkg = await customerPackageRepository.getCustomerPackageForInvoice(tenantId, customerId, packageId);
  if (!pkg) {
    throw new NotFoundError('Package not found.');
  }
  const tenant = await tenantRepository.getBillingInfo(tenantId);
  return { pkg, tenant };
}

// ============================================================
// PACKAGE PURCHASE INVOICE — PDF RENDER
// Mirrors the appointment invoice's visual language exactly (same
// fonts, dividers, spacing constants) but represents what was
// PURCHASED (totalQuantity per service), never usage/history.
// ============================================================
function renderPackageInvoicePdf(doc, { tenant, pkg }) {
  const fonts = registerFonts(doc);
  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const GAP_HEADER_BOTTOM = 22;
  const GAP_SECTION_DIVIDER = 18;
  const GAP_SECTION_CONTENT = 14;
  const GAP_ROW = 8;

  // ------------------------------------------------------------
  // 1. HEADER
  // ------------------------------------------------------------
  const headerTopY = doc.y;
  const leftColWidth = width * 0.58;
  const rightColWidth = width * 0.38;
  const rightColX = left + width - rightColWidth;

  doc.font(fonts.bold).fontSize(22).fillColor(INK);
  doc.text(tenant.name || 'Your Business', left, headerTopY, { width: leftColWidth });

  doc.moveDown(0.3);
  doc.font(fonts.regular).fontSize(10.5).fillColor(MUTED);
  buildTenantAddressLines(tenant).forEach((line) => {
    doc.text(line, left, doc.y, { width: leftColWidth });
  });
  const leftHeaderEndY = doc.y;

  doc.font(fonts.bold).fontSize(18).fillColor(PURPLE);
  doc.text('INVOICE', rightColX, headerTopY, { width: rightColWidth, align: 'right' });

  doc.moveDown(0.2);
  doc.font(fonts.regular).fontSize(10).fillColor(MUTED);
  doc.text(formatInvoiceDate(pkg.purchaseDate), rightColX, doc.y, { width: rightColWidth, align: 'right' });
  const rightHeaderEndY = doc.y;

  doc.y = Math.max(leftHeaderEndY, rightHeaderEndY) + GAP_HEADER_BOTTOM;

  drawFullDivider(doc);
  doc.y += GAP_SECTION_DIVIDER;

  // ------------------------------------------------------------
  // 2. CUSTOMER / PACKAGE
  // ------------------------------------------------------------
  const custColWidth = width * 0.48;
  const pkgColX = left + width - custColWidth;
  const metaSectionTopY = doc.y;

  doc.font(fonts.bold).fontSize(9.5).fillColor(PURPLE);
  doc.text('CUSTOMER', left, metaSectionTopY, { characterSpacing: 0.8 });
  doc.moveDown(0.4);

  doc.font(fonts.bold).fontSize(13.5).fillColor(INK);
  doc.text(pkg.customerName || 'Customer', left, doc.y, { width: custColWidth });

  if (pkg.customerPhone) {
    doc.moveDown(0.2);
    doc.font(fonts.regular).fontSize(10.5).fillColor(MUTED);
    doc.text(pkg.customerPhone, left, doc.y, { width: custColWidth });
  }
  const custColEndY = doc.y;

  doc.font(fonts.bold).fontSize(9.5).fillColor(PURPLE);
  doc.text('PACKAGE', pkgColX, metaSectionTopY, { characterSpacing: 0.8 });
  doc.moveDown(0.4);

  doc.font(fonts.bold).fontSize(13.5).fillColor(INK);
  doc.text(pkg.packageName || 'Package', pkgColX, doc.y, { width: custColWidth });

  if (pkg.packageDescription) {
    doc.moveDown(0.2);
    doc.font(fonts.regular).fontSize(10).fillColor(MUTED);
    doc.text(pkg.packageDescription, pkgColX, doc.y, { width: custColWidth });
  }

  doc.moveDown(0.2);
  doc.font(fonts.regular).fontSize(10).fillColor(MUTED);
  doc.text(`Purchased: ${formatInvoiceDate(pkg.purchaseDate)}`, pkgColX, doc.y, { width: custColWidth });
  if (pkg.expiryDate) {
    doc.moveDown(0.15);
    doc.text(`Valid until: ${formatInvoiceDate(pkg.expiryDate)}`, pkgColX, doc.y, { width: custColWidth });
  }
  const pkgColEndY = doc.y;

  doc.y = Math.max(custColEndY, pkgColEndY) + GAP_SECTION_CONTENT;

  drawFullDivider(doc);
  doc.y += GAP_SECTION_DIVIDER;

  // ------------------------------------------------------------
  // 3. INCLUDED SERVICES — totalQuantity, never usedQuantity/remaining
  // ------------------------------------------------------------
  doc.font(fonts.bold).fontSize(9.5).fillColor(PURPLE);
  doc.text('INCLUDED SERVICES', left, doc.y, { characterSpacing: 0.8 });
  doc.y += GAP_SECTION_CONTENT;

  const serviceNameWidth = width * 0.72;
  const qtyWidth = width * 0.25;
  const qtyX = left + width - qtyWidth;

  const services = pkg.services?.length > 0 ? pkg.services : [];
  services.forEach((svc) => {
    ensureSpace(doc, 24);
    const rowY = doc.y;

    doc.font(fonts.regular).fontSize(11).fillColor(INK);
    doc.text(svc.serviceName || 'Service', left, rowY, { width: serviceNameWidth });
    const nameEndY = doc.y;

    doc.font(fonts.regular).fontSize(11).fillColor(INK);
    doc.text(String(svc.totalQuantity ?? ''), qtyX, rowY, { width: qtyWidth, align: 'right' });
    const qtyEndY = doc.y;

    doc.y = Math.max(nameEndY, qtyEndY) + GAP_ROW;
  });

  doc.y += GAP_SECTION_CONTENT;

  drawFullDivider(doc);
  doc.y += GAP_SECTION_DIVIDER;

  // ------------------------------------------------------------
  // 4. TOTALS
  // NOTE: customer_packages has no paid_amount column — only
  // payment_status. paid/balance are derived, not stored:
  //   paid = payment_status === 'paid' ? effectivePrice : 0
  // This cannot represent a true partial amount for 'partial' status;
  // it's the best available without inventing a new field.
  // ------------------------------------------------------------
  ensureSpace(doc, 170);

  const totalsColWidth = width * 0.48;
  const totalsX = left + width - totalsColWidth;
  const labelWidth = totalsColWidth * 0.55;
  const valueWidth = totalsColWidth * 0.45;
  const valX = totalsX + labelWidth;

  function drawTotalsRow(label, valueText, opts = {}) {
    const currentY = doc.y;
    const fontName = opts.bold ? fonts.bold : fonts.regular;
    const fontSize = opts.size || 11;
    const textColor = opts.color || INK;

    doc.font(fontName).fontSize(fontSize).fillColor(textColor);
    doc.text(label, totalsX, currentY, { width: labelWidth });

    doc.font(opts.valBold !== undefined ? (opts.valBold ? fonts.bold : fonts.regular) : fontName)
       .fontSize(fontSize)
       .fillColor(opts.valColor || textColor);
    doc.text(valueText, valX, currentY, { width: valueWidth, align: 'right' });

    doc.y = Math.max(doc.y, currentY + fontSize + 4);
  }

  const subtotal = Number(pkg.effectivePrice) || 0;
  const paid = pkg.paymentStatus === 'paid' ? subtotal : 0;
  const balanceDue = Math.max(subtotal - paid, 0);

  drawTotalsRow('Subtotal', formatINR(subtotal));
  doc.y += 6;

  doc.save().strokeColor(LIGHT_BORDER).lineWidth(0.75)
    .moveTo(totalsX, doc.y).lineTo(totalsX + totalsColWidth, doc.y).stroke().restore();
  doc.y += 8;

  drawTotalsRow('Total', formatINR(subtotal), { bold: true, size: 12.5 });
  doc.y += 4;

  drawTotalsRow('Amount Paid', formatINR(paid));
  doc.y += 8;

  doc.save().strokeColor(PURPLE).lineWidth(1)
    .moveTo(totalsX, doc.y).lineTo(totalsX + totalsColWidth, doc.y).stroke().restore();
  doc.y += 8;

  drawTotalsRow('Balance Due', formatINR(balanceDue), { bold: true, size: 13 });
  doc.y += 4;

  doc.save().strokeColor(PURPLE).lineWidth(1)
    .moveTo(totalsX, doc.y).lineTo(totalsX + totalsColWidth, doc.y).stroke().restore();
  doc.y += 10;

  const statusColor = pkg.paymentStatus === 'paid' ? '#059669'
    : pkg.paymentStatus === 'refunded' ? '#E11D48' : PURPLE;

  drawTotalsRow('Payment Status', capitalize(pkg.paymentStatus), {
    valColor: statusColor,
    valBold: true,
  });

  doc.y += GAP_SECTION_CONTENT + 10;

  drawFullDivider(doc);
  doc.y += GAP_SECTION_DIVIDER;

  // ------------------------------------------------------------
  // 5. FOOTER
  // ------------------------------------------------------------
  ensureSpace(doc, 50);

  doc.font(fonts.regular).fontSize(12.5).fillColor(PURPLE);
  doc.text('Thank you for your purchase.', left, doc.y, { width, align: 'center' });

  doc.y += 10;
  doc.font(fonts.regular).fontSize(8.5).fillColor(SUBTLE_GRAY);
  doc.text('Powered by Aurora', left, doc.y, { width, align: 'center' });
}

async function streamPackageInvoicePdf(res, { tenant, pkg }) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 54, right: 54 },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="package-invoice-${pkg.id}.pdf"`);

  doc.pipe(res);
  renderPackageInvoicePdf(doc, { tenant, pkg });
  doc.end();
}

module.exports = { getInvoiceData, streamInvoicePdf, getPackageInvoiceData, streamPackageInvoicePdf };
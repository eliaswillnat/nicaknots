import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InvoiceData, SellerDetails } from './invoice';
import { formatCurrency, formatDate, itemTotal, parseAmount, subtotal, total } from './invoice';

const rose = '#8b5e5a';
const paleRose = '#f3ecea';
const border = '#b9b0ad';
const ink = '#2a2a2a';
const muted = '#646464';

const addPaymentSection = (doc: jsPDF, invoice: InvoiceData, seller: SellerDetails, y: number) => {
  const x = 17;
  const width = 176;
  doc.setFillColor(paleRose);
  doc.rect(x, y, width, 7, 'F');
  doc.setTextColor(rose);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('ZAHLUNGSINFORMATIONEN', x + 2, y + 4.7);

  doc.setDrawColor(border);
  doc.setLineWidth(0.15);
  doc.rect(x, y + 7, width, 25);
  doc.setTextColor(ink);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const lines = [
    'Bitte überweisen Sie den Gesamtbetrag bis zum oben genannten Fälligkeitsdatum.',
    `Kontoinhaberin: ${seller.accountHolder}`,
    `IBAN: ${seller.iban}`,
    ...(seller.bic ? [`BIC: ${seller.bic}`] : []),
    `Verwendungszweck: ${invoice.invoiceNumber}`,
  ];
  doc.text(lines, x + 2, y + 12, { lineHeightFactor: 1.25 });

  doc.setTextColor(rose);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Vielen Dank für Ihre Bestellung.', 105, y + 39, { align: 'center' });
};

export const buildInvoicePdf = (invoice: InvoiceData, seller: SellerDetails) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const x = 17;
  const width = 176;

  doc.setFillColor('#ffffff');
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(rose);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(seller.name.toUpperCase(), x, 20);
  doc.setTextColor(ink);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(seller.subtitle, x, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.text('RECHNUNG', 193, 22, { align: 'right' });

  doc.setDrawColor(rose);
  doc.setLineWidth(1);
  doc.line(x, 33, 193, 33);

  doc.setTextColor(ink);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(seller.name, x, 40);
  doc.setFont('helvetica', 'normal');
  doc.text([seller.street, seller.city, `E-Mail: ${seller.email}`], x, 45, { lineHeightFactor: 1.2 });
  doc.setTextColor(muted);
  doc.setFont('helvetica', 'italic');
  doc.text(`Steuernummer: ${seller.taxNumber}`, x, 57);

  const metadata = [
    ['Rechnungsnummer:', invoice.invoiceNumber],
    ['Rechnungsdatum:', formatDate(invoice.invoiceDate)],
    ['Lieferdatum:', formatDate(invoice.deliveryDate)],
    ['Fällig am:', formatDate(invoice.dueDate)],
  ];
  metadata.forEach(([label, value], index) => {
    const y = 40 + index * 5;
    doc.setTextColor(ink);
    doc.setFont('helvetica', 'bold');
    doc.text(label, 164, y, { align: 'right' });
    doc.setTextColor(muted);
    doc.setFont('helvetica', 'italic');
    doc.text(value, 193, y, { align: 'right' });
  });

  doc.setFillColor(paleRose);
  doc.rect(x, 63, width, 7, 'F');
  doc.setTextColor(rose);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('RECHNUNGSEMPFÄNGER/IN', x + 2, 67.7);
  doc.setDrawColor(border);
  doc.setLineWidth(0.15);
  doc.rect(x, 70, width, 19);
  doc.setTextColor(ink);
  doc.setFont('helvetica', 'normal');
  doc.text([invoice.customerName, invoice.customerStreet, invoice.customerCity], x + 2, 75, { lineHeightFactor: 1.35 });

  doc.setTextColor(ink);
  doc.setFontSize(8.5);
  doc.text('Vielen Dank für Ihre Bestellung. Ich stelle Ihnen folgende Waren in Rechnung:', x, 98);

  autoTable(doc, {
    startY: 101,
    margin: { left: x, right: 17 },
    tableWidth: width,
    head: [['Pos.', 'Artikel / Beschreibung', 'Menge', 'Einzelpreis', 'Gesamt']],
    body: invoice.items.map((item, index) => [
      String(index + 1),
      item.description,
      item.quantity,
      formatCurrency(parseAmount(item.unitPrice)),
      formatCurrency(itemTotal(item)),
    ]),
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: muted,
      lineColor: border,
      lineWidth: 0.15,
      cellPadding: 2,
      valign: 'middle',
      minCellHeight: 8,
    },
    headStyles: {
      fillColor: rose,
      textColor: '#ffffff',
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 17, halign: 'center' },
      1: { cellWidth: 71 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 34, halign: 'right' },
      4: { cellWidth: 36, halign: 'right' },
    },
  });

  const tableEnd = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  autoTable(doc, {
    startY: tableEnd + 5,
    margin: { left: 118, right: 17 },
    tableWidth: 75,
    body: [
      ['Zwischensumme', formatCurrency(subtotal(invoice))],
      ['Versandkosten', formatCurrency(parseAmount(invoice.shipping))],
      ['GESAMTBETRAG', formatCurrency(total(invoice))],
    ],
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      lineColor: border,
      lineWidth: 0.15,
      cellPadding: 2,
      halign: 'right',
      minCellHeight: 7,
    },
    columnStyles: { 0: { cellWidth: 46 }, 1: { cellWidth: 29 } },
    didParseCell: ({ row, cell, column }) => {
      if (row.index === 0 && cell.section === 'body' && column.index === 0) cell.styles.fontStyle = 'bold';
      if (row.index === 2 && cell.section === 'body') {
        cell.styles.fillColor = rose;
        cell.styles.textColor = '#ffffff';
        cell.styles.fontStyle = 'bold';
      }
    },
  });

  const summaryEnd = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const taxY = summaryEnd + 7;
  doc.setTextColor(rose);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.', x, taxY);

  addPaymentSection(doc, invoice, seller, taxY + 4);

  doc.setTextColor(muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`${seller.name} | ${seller.street} | ${seller.city} | ${seller.email}`, 105, 286, { align: 'center' });

  doc.setProperties({
    title: `Rechnung ${invoice.invoiceNumber}`,
    subject: `Rechnung für ${invoice.customerName}`,
    author: seller.name,
    creator: 'Nicaknots Rechnungen',
  });

  return doc;
};

export const generateInvoicePdf = (invoice: InvoiceData, seller: SellerDetails) => {
  const safeNumber = invoice.invoiceNumber.replace(/[^a-z0-9-_]+/gi, '-');
  buildInvoicePdf(invoice, seller).save(`Rechnung-${safeNumber}.pdf`);
};

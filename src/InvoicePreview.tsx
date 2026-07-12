import type { InvoiceData, SellerDetails } from './invoice';
import { formatCurrency, formatDate, itemTotal, parseAmount, subtotal, total } from './invoice';

type InvoicePreviewProps = {
  invoice: InvoiceData;
  seller: SellerDetails;
};

const shown = (value: string, fallback: string) => value || fallback;

export function InvoicePreview({ invoice, seller }: InvoicePreviewProps) {
  return (
    <article className="invoice-page" aria-label="Rechnungsvorschau">
      <div className="invoice-content">
        <header className="invoice-heading">
          <div>
            <h2>{shown(seller.name, 'Veronica De Luna').toUpperCase()}</h2>
            <p>{shown(seller.subtitle, 'Handgemachte Häkelwaren')}</p>
          </div>
          <strong>RECHNUNG</strong>
        </header>

        <div className="invoice-rule" />

        <section className="invoice-parties">
          <address>
            <b>{shown(seller.name, 'Veronica De Luna')}</b>
            <span>{shown(seller.street, 'Straße und Hausnummer')}</span>
            <span>{shown(seller.city, 'PLZ Ort')}</span>
            <span>E-Mail: {shown(seller.email, 'E-Mail-Adresse')}</span>
            <i>Steuernummer: {shown(seller.taxNumber, 'Bitte eintragen')}</i>
          </address>
          <dl>
            <div><dt>Rechnungsnummer:</dt><dd>{shown(invoice.invoiceNumber, '2026-001')}</dd></div>
            <div><dt>Rechnungsdatum:</dt><dd>{formatDate(invoice.invoiceDate) || 'TT.MM.JJJJ'}</dd></div>
            <div><dt>Lieferdatum:</dt><dd>{formatDate(invoice.deliveryDate) || 'TT.MM.JJJJ'}</dd></div>
            <div><dt>Fällig am:</dt><dd>{formatDate(invoice.dueDate) || 'TT.MM.JJJJ'}</dd></div>
          </dl>
        </section>

        <section className="invoice-box recipient-box">
          <h3>RECHNUNGSEMPFÄNGER/IN</h3>
          <address>
            <span>{shown(invoice.customerName, 'Name der Kundin / des Kunden')}</span>
            <span>{shown(invoice.customerStreet, 'Straße und Hausnummer')}</span>
            <span>{shown(invoice.customerCity, 'PLZ Ort')}</span>
          </address>
        </section>

        <p className="invoice-intro">Vielen Dank für Ihre Bestellung. Ich stelle Ihnen folgende Waren in Rechnung:</p>

        <table className="invoice-items">
          <thead>
            <tr>
              <th>Pos.</th>
              <th>Artikel / Beschreibung</th>
              <th>Menge</th>
              <th>Einzelpreis</th>
              <th>Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{shown(item.description, 'Artikelbeschreibung')}</td>
                <td>{shown(item.quantity, '1')}</td>
                <td>{formatCurrency(parseAmount(item.unitPrice))}</td>
                <td>{formatCurrency(itemTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="invoice-summary">
          <tbody>
            <tr><th>Zwischensumme</th><td>{formatCurrency(subtotal(invoice))}</td></tr>
            <tr><th>Versandkosten</th><td>{formatCurrency(parseAmount(invoice.shipping))}</td></tr>
            <tr><th>GESAMTBETRAG</th><td>{formatCurrency(total(invoice))}</td></tr>
          </tbody>
        </table>

        <p className="invoice-tax">Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</p>

        <section className="invoice-box payment-box">
          <h3>ZAHLUNGSINFORMATIONEN</h3>
          <div>
            <p>Bitte überweisen Sie den Gesamtbetrag bis zum oben genannten Fälligkeitsdatum.</p>
            <p>Kontoinhaberin: {shown(seller.accountHolder, seller.name)}</p>
            <p>IBAN: {shown(seller.iban, 'Bitte eintragen')}</p>
            {seller.bic && <p>BIC: {seller.bic}</p>}
            <p>Verwendungszweck: {shown(invoice.invoiceNumber, 'Rechnungsnummer')}</p>
          </div>
        </section>

        <p className="invoice-thanks">Vielen Dank für Ihre Bestellung.</p>
      </div>
      <footer>{seller.name} | {seller.street} | {seller.city} | {seller.email}</footer>
    </article>
  );
}

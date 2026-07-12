import { useEffect, useState } from 'react';
import { Download, Eye, FilePlus2, Plus, Printer, Settings2, Trash2 } from 'lucide-react';
import { InvoicePreviewFrame } from './InvoicePreviewFrame';
import { generateInvoicePdf } from './invoicePdf';
import {
  createInvoice,
  createItem,
  defaultSeller,
  nextInvoiceNumber,
  parseAmount,
  total,
  type InvoiceData,
  type InvoiceItem,
  type SellerDetails,
} from './invoice';
import './admin.css';

const SELLER_KEY = 'nicaknots.invoice.seller';
const DRAFT_KEY = 'nicaknots.invoice.draft';

const loadStored = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? { ...fallback, ...JSON.parse(value) } : fallback;
  } catch {
    return fallback;
  }
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: 'text' | 'decimal' | 'email';
  maxLength?: number;
};

function Field({ label, value, onChange, type = 'text', placeholder, required, inputMode, maxLength }: FieldProps) {
  return (
    <label className="admin-field">
      <span>{label}{required && <em aria-hidden="true">*</em>}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
      />
    </label>
  );
}

const validateInvoice = (invoice: InvoiceData, seller: SellerDetails) => {
  const missing: string[] = [];
  if (!seller.name.trim() || !seller.street.trim() || !seller.city.trim() || !seller.email.trim()) missing.push('vollständige Absenderdaten');
  if (!seller.taxNumber.trim()) missing.push('Steuernummer');
  if (!seller.accountHolder.trim()) missing.push('Kontoinhaberin');
  if (!seller.iban.trim()) missing.push('IBAN');
  if (!invoice.invoiceNumber.trim()) missing.push('Rechnungsnummer');
  if (!invoice.invoiceDate || !invoice.deliveryDate || !invoice.dueDate) missing.push('alle Datumsfelder');
  if (!invoice.customerName.trim()) missing.push('Name des Rechnungsempfängers');
  if (!invoice.customerStreet.trim()) missing.push('Straße des Rechnungsempfängers');
  if (!invoice.customerCity.trim()) missing.push('Ort des Rechnungsempfängers');
  if (invoice.items.some((item) => !item.description.trim())) missing.push('Artikelbeschreibung');
  if (invoice.items.some((item) => parseAmount(item.quantity) <= 0)) missing.push('gültige Menge');
  if (invoice.items.some((item) => !item.unitPrice.trim() || parseAmount(item.unitPrice) < 0)) missing.push('gültiger Einzelpreis');
  if (parseAmount(invoice.shipping) < 0) missing.push('gültige Versandkosten');
  if (invoice.invoiceDate && invoice.dueDate && invoice.dueDate < invoice.invoiceDate) missing.push('Fälligkeitsdatum nach Rechnungsdatum');
  return [...new Set(missing)];
};

export function AdminPage() {
  const [seller, setSeller] = useState<SellerDetails>(() => loadStored(SELLER_KEY, defaultSeller));
  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    const saved = loadStored<InvoiceData | null>(DRAFT_KEY, null);
    return saved?.items?.length ? saved : createInvoice();
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

  useEffect(() => {
    localStorage.setItem(SELLER_KEY, JSON.stringify(seller));
  }, [seller]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(invoice));
  }, [invoice]);

  useEffect(() => {
    document.title = 'Rechnung erstellen | Nicaknots';
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]') ?? document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    if (!robots.parentNode) document.head.appendChild(robots);
  }, []);

  const amount = total(invoice);

  const updateInvoice = <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    setInvoice((current) => ({ ...current, [key]: value }));
    setErrors([]);
  };

  const updateSeller = <K extends keyof SellerDetails>(key: K, value: SellerDetails[K]) => {
    setSeller((current) => ({ ...current, [key]: value }));
    setErrors([]);
  };

  const updateItem = (id: string, key: keyof Omit<InvoiceItem, 'id'>, value: string) => {
    updateInvoice('items', invoice.items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const prepareDocument = (action: () => void) => {
    const missing = validateInvoice(invoice, seller);
    if (missing.length) {
      setErrors(missing);
      setMobileView('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    action();
  };

  const newInvoice = () => {
    if (!window.confirm('Neue Rechnung starten? Der aktuelle Entwurf wird ersetzt.')) return;
    setInvoice(createInvoice(nextInvoiceNumber(invoice.invoiceNumber)));
    setErrors([]);
    setMobileView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <a href="/" className="admin-brand" aria-label="Zur Nicaknots Startseite">NICAKNOTS</a>
        <div className="admin-actions">
          <button type="button" className="icon-command" onClick={newInvoice} title="Neue Rechnung" aria-label="Neue Rechnung">
            <FilePlus2 size={18} />
            <span>Neue Rechnung</span>
          </button>
          <button type="button" className="secondary-command" onClick={() => prepareDocument(() => window.print())} aria-label="Rechnung drucken">
            <Printer size={18} />
            <span>Drucken</span>
          </button>
          <button type="button" className="primary-command" onClick={() => prepareDocument(() => generateInvoicePdf(invoice, seller))} aria-label="Rechnung als PDF laden">
            <Download size={18} />
            <span>PDF laden</span>
          </button>
        </div>
      </header>

      <div className="admin-mobile-tabs" role="tablist" aria-label="Ansicht">
        <button type="button" role="tab" aria-selected={mobileView === 'form'} className={mobileView === 'form' ? 'active' : ''} onClick={() => setMobileView('form')}>
          <Settings2 size={17} /> Eingabe
        </button>
        <button type="button" role="tab" aria-selected={mobileView === 'preview'} className={mobileView === 'preview' ? 'active' : ''} onClick={() => setMobileView('preview')}>
          <Eye size={17} /> Vorschau
        </button>
      </div>

      {errors.length > 0 && (
        <div className="validation-banner" role="alert">
          <b>Bitte noch ausfüllen:</b> {errors.join(', ')}.
        </div>
      )}

      <div className="admin-workspace">
        <form className={`admin-form ${mobileView === 'preview' ? 'mobile-hidden' : ''}`} onSubmit={(event) => event.preventDefault()}>
          <section className="form-section">
            <div className="section-heading">
              <div>
                <span className="section-step">01</span>
                <h1>Rechnungsdetails</h1>
              </div>
              <strong>{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)}</strong>
            </div>
            <div className="form-grid two-columns">
              <Field label="Rechnungsnummer" value={invoice.invoiceNumber} onChange={(value) => updateInvoice('invoiceNumber', value)} required />
              <Field label="Rechnungsdatum" type="date" value={invoice.invoiceDate} onChange={(value) => updateInvoice('invoiceDate', value)} required />
              <Field label="Lieferdatum" type="date" value={invoice.deliveryDate} onChange={(value) => updateInvoice('deliveryDate', value)} required />
              <Field label="Fällig am" type="date" value={invoice.dueDate} onChange={(value) => updateInvoice('dueDate', value)} required />
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <div><span className="section-step">02</span><h2>Rechnungsempfänger/in</h2></div>
            </div>
            <div className="form-grid">
              <Field label="Name" value={invoice.customerName} onChange={(value) => updateInvoice('customerName', value)} placeholder="Vor- und Nachname" required />
              <Field label="Straße und Hausnummer" value={invoice.customerStreet} onChange={(value) => updateInvoice('customerStreet', value)} placeholder="Musterstraße 12" required />
              <Field label="PLZ und Ort" value={invoice.customerCity} onChange={(value) => updateInvoice('customerCity', value)} placeholder="65549 Limburg" required />
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading">
              <div><span className="section-step">03</span><h2>Artikel</h2></div>
              <span className="item-count">{invoice.items.length} / 8</span>
            </div>
            <div className="item-list">
              {invoice.items.map((item, index) => (
                <div className="item-row" key={item.id}>
                  <span className="item-number">{String(index + 1).padStart(2, '0')}</span>
                  <Field label="Beschreibung" value={item.description} onChange={(value) => updateItem(item.id, 'description', value)} placeholder="z. B. Gehäkeltes Oberteil, Farbe/Größe" maxLength={80} required />
                  <Field label="Menge" value={item.quantity} onChange={(value) => updateItem(item.id, 'quantity', value)} inputMode="decimal" required />
                  <Field label="Einzelpreis" value={item.unitPrice} onChange={(value) => updateItem(item.id, 'unitPrice', value)} placeholder="0,00" inputMode="decimal" required />
                  <button
                    type="button"
                    className="remove-item"
                    onClick={() => updateInvoice('items', invoice.items.filter((candidate) => candidate.id !== item.id))}
                    disabled={invoice.items.length === 1}
                    aria-label={`Artikel ${index + 1} entfernen`}
                    title="Artikel entfernen"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
            <div className="items-footer">
              <button type="button" className="add-item" onClick={() => updateInvoice('items', [...invoice.items, createItem()])} disabled={invoice.items.length >= 8}>
                <Plus size={17} /> Artikel hinzufügen
              </button>
              <Field label="Versandkosten" value={invoice.shipping} onChange={(value) => updateInvoice('shipping', value)} inputMode="decimal" />
            </div>
          </section>

          <details className="seller-settings" open={!seller.taxNumber || !seller.iban}>
            <summary>
              <span><Settings2 size={18} /> Absender &amp; Bankdaten</span>
              <small>Wird auf diesem Gerät gespeichert</small>
            </summary>
            <div className="settings-grid">
              <Field label="Name" value={seller.name} onChange={(value) => updateSeller('name', value)} required />
              <Field label="Beschreibung" value={seller.subtitle} onChange={(value) => updateSeller('subtitle', value)} />
              <Field label="Straße und Hausnummer" value={seller.street} onChange={(value) => updateSeller('street', value)} required />
              <Field label="PLZ und Ort" value={seller.city} onChange={(value) => updateSeller('city', value)} required />
              <Field label="E-Mail" type="email" inputMode="email" value={seller.email} onChange={(value) => updateSeller('email', value)} required />
              <Field label="Steuernummer" value={seller.taxNumber} onChange={(value) => updateSeller('taxNumber', value)} placeholder="Einmalig eintragen" required />
              <Field label="Kontoinhaberin" value={seller.accountHolder} onChange={(value) => updateSeller('accountHolder', value)} required />
              <Field label="IBAN" value={seller.iban} onChange={(value) => updateSeller('iban', value.toUpperCase())} placeholder="DE00 0000 0000 0000 0000 00" required />
              <Field label="BIC (optional)" value={seller.bic} onChange={(value) => updateSeller('bic', value.toUpperCase())} />
            </div>
          </details>

          <div className="mobile-actions">
            <button type="button" className="secondary-command" onClick={() => prepareDocument(() => window.print())}>
              <Printer size={18} /> Drucken
            </button>
            <button type="button" className="primary-command" onClick={() => prepareDocument(() => generateInvoicePdf(invoice, seller))}>
              <Download size={18} /> PDF laden
            </button>
          </div>
        </form>

        <aside className={`preview-panel ${mobileView === 'form' ? 'mobile-hidden' : ''}`}>
          <div className="preview-label">
            <span>Live-Vorschau</span>
            <span>A4</span>
          </div>
          <InvoicePreviewFrame invoice={invoice} seller={seller} />
        </aside>
      </div>
    </main>
  );
}

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

export type SellerDetails = {
  name: string;
  subtitle: string;
  street: string;
  city: string;
  email: string;
  taxNumber: string;
  accountHolder: string;
  iban: string;
  bic: string;
};

export type InvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  deliveryDate: string;
  dueDate: string;
  customerName: string;
  customerStreet: string;
  customerCity: string;
  shipping: string;
  items: InvoiceItem[];
};

export const defaultSeller: SellerDetails = {
  name: 'Veronica De Luna',
  subtitle: 'Handgemachte Häkelwaren',
  street: 'Graupfortstraße 10B',
  city: '65549 Limburg an der Lahn',
  email: 'veronica.willnat@gmail.com',
  taxNumber: '',
  accountHolder: 'Veronica De Luna',
  iban: '',
  bic: '',
};

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const createItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: '1',
  unitPrice: '',
});

export const createInvoice = (invoiceNumber?: string): InvoiceData => {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 14);

  return {
    invoiceNumber: invoiceNumber ?? `${today.getFullYear()}-001`,
    invoiceDate: toInputDate(today),
    deliveryDate: toInputDate(today),
    dueDate: toInputDate(dueDate),
    customerName: '',
    customerStreet: '',
    customerCity: '',
    shipping: '0',
    items: [createItem()],
  };
};

export const parseAmount = (value: string) => {
  const normalized = value.trim().replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

export const formatDate = (value: string) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
};

export const itemTotal = (item: InvoiceItem) => parseAmount(item.quantity) * parseAmount(item.unitPrice);

export const subtotal = (invoice: InvoiceData) =>
  invoice.items.reduce((sum, item) => sum + itemTotal(item), 0);

export const total = (invoice: InvoiceData) => subtotal(invoice) + parseAmount(invoice.shipping);

export const nextInvoiceNumber = (current: string) => {
  const match = current.match(/^(.*?)(\d+)$/);
  if (!match) return `${new Date().getFullYear()}-001`;
  const prefix = match[1];
  const number = match[2];
  return `${prefix}${String(Number(number) + 1).padStart(number.length, '0')}`;
};


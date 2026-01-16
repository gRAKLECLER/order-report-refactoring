export type Customer = {
  id: string;
  name: string;
  level: 'BASIC' | 'PREMIUM';
  shippingZone: string;
  currency: 'EUR' | 'USD' | 'GBP';
};

export type Order = {
  id: string;
  customerId: string;
  productId: string;
  qty: number;
  unitPrice: number;
  date: string;
  time: string;
  promoCode?: string;
};

export type Product = {
  id: string;
  price: number;
  weight: number;
  taxable: boolean;
};

export type Promotion = {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  active: boolean;
};

export type ShippingZone = {
  base: number;
  perKg: number;
};

/* ⬇️ LIGNE CRITIQUE */
export {};

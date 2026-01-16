 type Customer = {
  id: string;
  name: string;
  level: 'BASIC' | 'PREMIUM';
  shippingZone: string;
  currency: 'EUR' | 'USD' | 'GBP';
};

 type Order = {
  id: string;
  customerId: string;
  productId: string;
  qty: number;
  unitPrice: number;
  date: string;
  time: string;
  promoCode?: string;
};

 type Product = {
  id: string;
  price: number;
  weight: number;
  taxable: boolean;
};

 type Promotion = {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  active: boolean;
};

 type ShippingZone = {
  base: number;
  perKg: number;
};

export { Order, Product, Promotion, Customer, ShippingZone};

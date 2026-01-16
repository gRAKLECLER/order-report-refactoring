import * as fs from 'fs';
import path from 'path';
import type {
    Customer,
    Order,
    Product,
    Promotion,
    ShippingZone
  } from './types';

import { readCsv, calculateLoyaltyPoints, loyaltyDiscount, volumeDiscount } from './utils';  


const TAX = 0.2;
const SHIPPING_LIMIT = 50;
const LOYALTY_RATIO = 0.01;
const MAX_DISCOUNT = 200;

function loadCustomers(file: string): Record<string, Customer> {
  return Object.fromEntries(
    readCsv(file, ([id, name, level, zone, currency]) => [
      id,
      {
        id,
        name,
        level: (level as any) || 'BASIC',
        shippingZone: zone || 'ZONE1',
        currency: (currency as any) || 'EUR'
      }
    ])
  );
}

function loadProducts(file: string): Record<string, Product> {
  return Object.fromEntries(
    readCsv(file, ([id, , , price, weight, taxable]) => [
      id,
      {
        id,
        price: parseFloat(price),
        weight: parseFloat(weight || '1'),
        taxable: taxable === 'true'
      }
    ])
  );
}

function loadShippingZones(file: string): Record<string, ShippingZone> {
  return Object.fromEntries(
    readCsv(file, ([zone, base, perKg]) => [
      zone,
      {
        base: parseFloat(base),
        perKg: parseFloat(perKg || '0.5')
      }
    ])
  );
}

function loadPromotions(file: string): Record<string, Promotion> {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    readCsv(file, ([code, type, value, active]) => [
      code,
      {
        code,
        type: type as any,
        value: parseFloat(value),
        active: active !== 'false'
      }
    ])
  );
}

function loadOrders(file: string): Order[] {
  return readCsv(file, ([id, customerId, productId, qty, price, date, promo, time]) => ({
    id,
    customerId,
    productId,
    qty: parseInt(qty),
    unitPrice: parseFloat(price),
    date,
    promoCode: promo || undefined,
    time: time || '12:00'
  }));
}

function calculateShipping(sub: number, weight: number, zoneName: string, zones: Record<string, ShippingZone>) {
    let ship = 0;
    const zone = zones[zoneName] ?? { base: 5, perKg: 0.5 };
  
    if (sub < SHIPPING_LIMIT) {
      if (weight > 10) {
        ship = zone.base + (weight - 10) * zone.perKg;
      } else if (weight > 5) {
        ship = zone.base + (weight - 5) * 0.3;
      } else {
        ship = zone.base;
      }
  
      if (zoneName === 'ZONE3' || zoneName === 'ZONE4') {
        ship *= 1.2;
      }
    } else {
      if (weight > 20) {
        ship = (weight - 20) * 0.25;
      }
    }
  
    return ship;
  }

function run(): string {
  const base = __dirname;
  const customers = loadCustomers(path.join(base, 'data/customers.csv'));
  const products = loadProducts(path.join(base, 'data/products.csv'));
  const zones = loadShippingZones(path.join(base, 'data/shipping_zones.csv'));
  const promotions = loadPromotions(path.join(base, 'data/promotions.csv'));
  const orders = loadOrders(path.join(base, 'data/orders.csv'));

  const loyalty = calculateLoyaltyPoints(orders, LOYALTY_RATIO);
  const totals: Record<string, any> = {};

  for (const o of orders) {
    const prod = products[o.productId];
    const basePrice = prod?.price ?? o.unitPrice;
    let line = o.qty * basePrice;

    const promo = o.promoCode ? promotions[o.promoCode] : undefined;
    if (promo?.active) {
      if (promo.type === 'PERCENTAGE') {
        line *= 1 - promo.value / 100;
      } else {
        line -= promo.value * o.qty;
      }
    }

    const hour = parseInt(o.time.split(':')[0]);
    if (hour < 10) line *= 0.97;

    totals[o.customerId] ??= { subtotal: 0, weight: 0, items: [] };
    totals[o.customerId].subtotal += line;
    totals[o.customerId].weight += (prod?.weight ?? 1) * o.qty;
    totals[o.customerId].items.push(o);
  }

  const output: string[] = [];

  for (const cid of Object.keys(totals).sort()) {
    const cust = customers[cid];
    const sub = totals[cid].subtotal;
    const firstOrderDate = totals[cid].items[0]?.date;
    let disc = volumeDiscount(sub, cust.level, firstOrderDate);
    let loy = loyaltyDiscount(loyalty[cid] ?? 0);

    let totalDisc = disc + loy;
    if (totalDisc > MAX_DISCOUNT) {
        const ratio = MAX_DISCOUNT / totalDisc;
        disc *= ratio;
        loy *= ratio;
        totalDisc = MAX_DISCOUNT;
    }

    const taxable = sub - totalDisc;

    const items = totals[cid].items;
    let allTaxable = true;
    for (const item of items) {
      const prod = products[item.productId];
      if (prod && prod.taxable === false) {
        allTaxable = false;
        break;
      }
    }

    let tax = 0;
    if (allTaxable) {
      tax = Math.round(taxable * TAX * 100) / 100;
    } else {
      for (const item of items) {
        const prod = products[item.productId];
        if (prod && prod.taxable !== false) {
          const itemTotal = item.qty * (prod.price ?? item.unitPrice);
          tax += itemTotal * TAX;
        }
      }
      tax = Math.round(tax * 100) / 100;
    }

    const ship = calculateShipping(sub, totals[cid].weight, cust.shippingZone, zones);

    const total = Math.round((taxable + tax + ship) * 100) / 100;

    output.push(`Customer: ${cust.name} (${cid})`);
    output.push(`Level: ${cust.level} | Zone: ${cust.shippingZone} | Currency: ${cust.currency}`);
    output.push(`Subtotal: ${sub.toFixed(2)}`);
    output.push(`Discount: ${totalDisc.toFixed(2)}`);
    output.push(`  - Volume discount: ${disc.toFixed(2)}`);
    output.push(`  - Loyalty discount: ${loy.toFixed(2)}`);
    output.push(`Tax: ${tax.toFixed(2)}`);
    output.push(`Shipping (${cust.shippingZone}, ${totals[cid].weight.toFixed(1)}kg): ${ship.toFixed(2)}`);
    output.push(`Total: ${total.toFixed(2)} ${cust.currency}`);
    output.push(`Loyalty Points: ${Math.floor(loyalty[cid] ?? 0)}`);
    output.push('');
}


  const result = output.join('\n');
  console.log(result);
  return result;
}


if (require.main === module) {
  run();
}

export { run };

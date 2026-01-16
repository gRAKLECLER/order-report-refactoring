import * as fs from 'fs';
import { Customer, Order } from './types';


 function readCsv<T>(filePath: string, mapper: (row: string[]) => T): T[] {
    return fs
      .readFileSync(filePath, 'utf-8')
      .split('\n')
      .slice(1)
      .filter(Boolean)
      .map(line => mapper(line.split(',')));
  }

 function calculateLoyaltyPoints(orders: Order[], loyaltyRatio: number): Record<string, number> {
    return orders.reduce((acc, o) => {
      acc[o.customerId] = (acc[o.customerId] ?? 0) + o.qty * o.unitPrice * loyaltyRatio;
      return acc;
    }, {} as Record<string, number>);
  }

  function loyaltyDiscount(points: number): number {
    if (points > 500) return Math.min(points * 0.15, 100);
    if (points > 100) return Math.min(points * 0.1, 50);
    return 0;
  } 


 function volumeDiscount(sub: number, level: Customer['level']): number {
    if (sub > 1000 && level === 'PREMIUM') return sub * 0.2;
    if (sub > 500) return sub * 0.15;
    if (sub > 100) return sub * 0.1;
    if (sub > 50) return sub * 0.05;
    return 0;
  }


 export { readCsv, calculateLoyaltyPoints, loyaltyDiscount, volumeDiscount };
  
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


  function volumeDiscount(sub: number, level: Customer['level'], firstOrderDate?: string): number {
    let disc = 0;
    if (sub > 1000 && level === 'PREMIUM') disc = sub * 0.2;
    else if (sub > 500) disc = sub * 0.15;
    else if (sub > 100) disc = sub * 0.1;
    else if (sub > 50) disc = sub * 0.05;
  
    if (firstOrderDate) {
      const day = new Date(firstOrderDate).getDay();
      if (day === 0 || day === 6) disc *= 1.05;
    }
  
    return disc;
  }
  


 export { readCsv, calculateLoyaltyPoints, loyaltyDiscount, volumeDiscount };
  
import { calculateLoyaltyPoints, loyaltyDiscount, volumeDiscount } from '../legacy/utils';
import { Order, Customer } from '../legacy/types';

describe('Utils functions', () => {

  test('calculateLoyaltyPoints calculates points correctly', () => {
    const orders: Order[] = [
      {
          customerId: 'c1', qty: 2, unitPrice: 100,
          id: '',
          productId: '',
          date: '',
          time: ''
      },
      {
          customerId: 'c1', qty: 1, unitPrice: 50,
          id: '',
          productId: '',
          date: '',
          time: ''
      },
      {
          customerId: 'c2', qty: 5, unitPrice: 20,
          id: '',
          productId: '',
          date: '',
          time: ''
      },
    ];

    const points = calculateLoyaltyPoints(orders, 0.1);
    
    expect(points).toEqual({
      c1: 25,
      c2: 10,
    });
  });

  test('loyaltyDiscount works correctly', () => {
    expect(loyaltyDiscount(600)).toBe(90);
    expect(loyaltyDiscount(200)).toBe(20);
    expect(loyaltyDiscount(50)).toBe(0);
  });

  test('volumeDiscount works correctly', () => {
    const premiumCustomer: Customer = {
        id: 'c1', level: 'PREMIUM',
        name: '',
        shippingZone: '',
        currency: 'EUR'
    };
    expect(volumeDiscount(1200, premiumCustomer.level)).toBe(240);
    expect(volumeDiscount(600, 'BASIC')).toBe(90);
    expect(volumeDiscount(80, 'BASIC')).toBe(4);
  });

});

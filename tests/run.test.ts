import { run } from '../legacy/orderReportRefacto';
import * as fs from 'fs';

jest.mock('fs');

test('run generates correct report for mocked data', () => {
  (fs.readFileSync as jest.Mock).mockImplementation((file: string) => {
    if (file.includes('customers.csv')) return 'id,name,level,shipping_zone,currency\nC001,Alice,PREMIUM,ZONE1,EUR\nC002,Bob,BASIC,ZONE2,EUR';
    if (file.includes('products.csv')) return 'id,name,desc,price,weight,taxable\nP001,Prod,Desc,100,1,true';
    if (file.includes('orders.csv')) return 'id,customerId,productId,qty,price,date,promo,time\nO001,C001,P001,2,100,2026-01-16,,12:00\nO002,C002,P002,1,50,2026-01-16,,12:00';
    if (file.includes('shipping_zones.csv')) return 'ZONE1,5,0.5';
    if (file.includes('promotions.csv')) return '';
    return '';
  });

  const output = run();
  expect(output).toContain('Customer: Alice (C001)');
  expect(output).toContain('Total: 216.00 EUR'); // Alice
  expect(output).toContain('Total: 60.00 EUR');  // Bob
});

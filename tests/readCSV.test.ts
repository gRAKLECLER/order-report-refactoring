// tests/readCsvCustomers.test.ts
import { readCsv } from '../legacy/utils';
import * as fs from 'fs';

jest.mock('fs');

const mockCsv =
  'id,name,level,shipping_zone,currency\n' +
  'C001,Alice Martin,BASIC,ZONE1,EUR\n' +
  'C002,Bob Durant,PREMIUM,ZONE2,EUR\n' +
  'C003,Charlie Smith,BASIC,ZONE3,USD';

it('parses a normal CSV', () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(
        mockCsv.split('\n').filter(Boolean).join('\n')
      );

    const result = readCsv<{ id: string; name: string; level: string; shipping_zone: string; currency: string }>(
      'fake/path/customers.csv',
      (row) => ({
        id: row[0],
        name: row[1],
        level: row[2] as 'BASIC' | 'PREMIUM',
        shipping_zone: row[3],
        currency: row[4],
      })
    );

    expect(result).toEqual([
      { id: 'C001', name: 'Alice Martin', level: 'BASIC', shipping_zone: 'ZONE1', currency: 'EUR' },
      { id: 'C002', name: 'Bob Durant', level: 'PREMIUM', shipping_zone: 'ZONE2', currency: 'EUR' },
      { id: 'C003', name: 'Charlie Smith', level: 'BASIC', shipping_zone: 'ZONE3', currency: 'USD' },
    ]);
  });
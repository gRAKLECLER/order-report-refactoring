// tests/goldenMaster.test.ts
import { execSync } from 'child_process';
import { run } from '../legacy/orderReportRefacto';
import fs from 'fs';
import path from 'path';

describe('Golden Master Test', () => {
  const goldenFile = path.join(__dirname, '../legacy/expected/report.txt');


  it('refactor output must match legacy output exactly', () => {
    const goldenOutput = fs.readFileSync(goldenFile, 'utf-8');

    const refactorOutput = run();

    expect(refactorOutput).toBe(goldenOutput);
  });
});

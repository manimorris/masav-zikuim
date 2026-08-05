import { expect, test } from "bun:test";
import { OpenformatReader } from "../lib/openformat-reader";

test("OpenformatReader parses 2.DAT file with multiple pension funds", async () => {
  const file = Bun.file("openformat/2.DAT");
  const content = await file.text();

  const reader = new OpenformatReader();
  const result = reader.returnFileData("2.DAT", content);

  expect(result.errorMsg.length).toBe(0);
  expect(result.data).toBeDefined();
  expect(result.data?.mosad.mosadName).toBe("מוסד לדוגמה ב");

  // Should have multiple pension fund payments
  expect(result.data?.transactions.length).toBeGreaterThan(1);

  // Each transaction should have bank details
  result.data?.transactions.forEach((tx) => {
    expect(tx.payeeBank).toBeGreaterThan(0);
    expect(tx.payeeBranch).toBeGreaterThan(0);
    expect(tx.payeeAccount).toBeGreaterThan(0);
    expect(parseFloat(String(tx.pymtSum))).toBeGreaterThan(0);
  });
});

test("OpenformatReader parses original DAT file", async () => {
  const file = Bun.file("openformat/001000012345678EMPONG000005202603080809410001.DAT");
  const content = await file.text();

  const reader = new OpenformatReader();
  const result = reader.returnFileData("001000012345678EMPONG000005202603080809410001.DAT", content);

  expect(result.errorMsg.length).toBe(0);
  expect(result.data).toBeDefined();
  expect(result.data?.pymtDetails.pymtDate).toBe("2026-03-08");
});

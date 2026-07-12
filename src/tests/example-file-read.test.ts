import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { MasavReader } from "../lib/masav-reader";

test("reader parses project example file as expected", () => {
  const raw = readFileSync("exmple.txt").toString("binary");
  const result = new MasavReader().returnFileData("exmple.txt", raw);

  expect(result.errorMsg).toHaveLength(0);
  expect(result.data?.mosad.codeMosad).toBe("67289");
  expect(result.data?.pymtDetails.pymtDate).toBe("2026-02-25");
  expect(result.data?.transactions).toHaveLength(4);
  expect(result.data?.transactions[0].payeeID).toBe("512065202");
  expect(result.data?.transactions[0].pymtSum).toBe("7463.00");
});

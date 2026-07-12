import { expect, test } from "bun:test";
import { MasavWriter } from "../lib/masav-writer";
import { MasavReader } from "../lib/masav-reader";

const sample = {
  mosad: {
    codeMosad: "12345",
    codeMosadSubject: "678",
    mosadName: "בדיקה",
  },
  pymtDetails: {
    pymtDate: "2026-01-15",
    createDate: "2026-01-15",
  },
  transactions: [
    {
      payeeName: "ישראל ישראלי",
      payeeID: "123456789",
      pymtSum: "1540.12",
      payeeBank: "12",
      payeeBranch: "345",
      payeeAccount: "456789",
      pymtPeriodfrom: "0126",
      pymtPeriodto: "0226",
      pymtRefference: "999",
    },
  ],
};

test("writer creates MASAV-like file and reader can parse it", () => {
  const writer = new MasavWriter();
  const raw = writer.mkRawfile(sample);
  const reader = new MasavReader();
  const result = reader.returnFileData("sample.txt", raw);

  expect(result.errorMsg.length).toBe(0);
  expect(result.data?.mosad.codeMosad).toBe("12345");
  expect(result.data?.transactions[0].payeeID).toBe("123456789");
});

test("writer treats whole-number amount as shekels with .00", () => {
  const writer = new MasavWriter();
  const raw = writer.mkRawfile({
    ...sample,
    transactions: [{ ...sample.transactions[0], pymtSum: "1540" }],
  });
  const reader = new MasavReader();
  const result = reader.returnFileData("sample.txt", raw);

  expect(result.errorMsg.length).toBe(0);
  expect(result.data?.transactions[0].pymtSum).toBe("1540.00");
});

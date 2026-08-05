import { expect, test } from "bun:test";
import { OpenformatReader } from "../lib/openformat-reader";

const sampleOpenformat = `<?xml version="1.0" encoding="utf-8"?>
<MimshakMaasikim xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <KoteretKovetz>
        <SUG-MIMSHAK>12</SUG-MIMSHAK>
        <TAARICH-BITZUA>20260308080941</TAARICH-BITZUA>
    </KoteretKovetz>
    <GufHamimshak>
        <YeshutGoremPoneLemislaka>
            <SUG-PONE>5</SUG-PONE>
            <MISPAR-MEZAHE-PONE>580000017</MISPAR-MEZAHE-PONE>
            <SHEM-GOREM-PONE>מוסד לדוגמה א</SHEM-GOREM-PONE>
            <PirteiHaavaratKsafim>
                <SUG-MEZAHE-MAASIK>7</SUG-MEZAHE-MAASIK>
                <MISPAR-ZIHUY-MAASIK>580000017</MISPAR-ZIHUY-MAASIK>
                <SCHUM-HAFKADA-KOLEL>1875.00</SCHUM-HAFKADA-KOLEL>
                <SHEM-MAASIK>מוסד לדוגמה א</SHEM-MAASIK>
                <TAARICH-ERECH-HAFKADA-LEKUPA>2026-03-08</TAARICH-ERECH-HAFKADA-LEKUPA>
                <KOD-MEZAHE-KUPA-H-P>510000004000000000001700000000</KOD-MEZAHE-KUPA-H-P>
                <MISPAR-BANK-KOLET>10</MISPAR-BANK-KOLET>
                <MISPAR-SNIF-KOLET>800</MISPAR-SNIF-KOLET>
                <MISPAR-CHESHBON-KOLET>1000004</MISPAR-CHESHBON-KOLET>
                <SACH-HAFKADA-KUPA-H-P>1875.00</SACH-HAFKADA-KUPA-H-P>
                <PirteiKupa>
                    <SUG-KUPA>2</SUG-KUPA>
                    <SHEM-KUPA-ETZEL-MAASIK>כלל קרן פנסיה</SHEM-KUPA-ETZEL-MAASIK>
                    <PirteiOved>
                        <SUG-MEZAHE-OVED>1</SUG-MEZAHE-OVED>
                        <MISPAR-MEZAHE>123450017</MISPAR-MEZAHE>
                        <SHEM-PRATI>ישראל</SHEM-PRATI>
                        <SHEM-MISHPACHA>כהן</SHEM-MISHPACHA>
                        <ChodeshMaskoretVestatusOved>
                            <CHODESH-MASKORET>2026-01-01</CHODESH-MASKORET>
                            <SACHAR-MEDUVACH>9000.00</SACHAR-MEDUVACH>
                        </ChodeshMaskoretVestatusOved>
                    </PirteiOved>
                </PirteiKupa>
            </PirteiHaavaratKsafim>
        </YeshutGoremPoneLemislaka>
    </GufHamimshak>
</MimshakMaasikim>`;

test("OpenformatReader parses XML and extracts employer data", () => {
  const reader = new OpenformatReader();
  const result = reader.returnFileData("test.dat", sampleOpenformat);

  expect(result.errorMsg.length).toBe(0);
  expect(result.data).toBeDefined();
  expect(result.data?.mosad.mosadName).toBe("מוסד לדוגמה א");
  // Mosad code should be empty - needs to be provided by user
  expect(result.data?.mosad.codeMosad).toBe("");
  expect(result.data?.mosad.codeMosadSubject).toBe("");
});

test("OpenformatReader extracts pension fund as payee with bank details", () => {
  const reader = new OpenformatReader();
  const result = reader.returnFileData("test.dat", sampleOpenformat);

  expect(result.data?.transactions.length).toBe(1);

  const tx = result.data?.transactions[0];
  expect(tx?.payeeName).toBe("כלל קרן פנסיה");
  expect(tx?.payeeID).toBe("510000004"); // First 9 digits of KOD-MEZAHE-KUPA-H-P
  expect(tx?.pymtSum).toBe("1875.00");
  expect(tx?.payeeBank).toBe(10);
  expect(tx?.payeeBranch).toBe(800);
  expect(tx?.payeeAccount).toBe(1000004);
  expect(tx?.pymtPeriodfrom).toBe("2601");
  expect(tx?.pymtPeriodto).toBe("2601");
});

test("OpenformatReader extracts payment date", () => {
  const reader = new OpenformatReader();
  const result = reader.returnFileData("test.xml", sampleOpenformat);

  expect(result.data?.pymtDetails.pymtDate).toBe("2026-03-08");
});

test("OpenformatReader includes employerId for mosad lookup", () => {
  const reader = new OpenformatReader();
  const result = reader.returnFileData("test.dat", sampleOpenformat);
  const data = result.data as typeof result.data & { employerId?: string };

  expect(data?.employerId).toBe("580000017");
});

test("OpenformatReader rejects invalid file type", () => {
  const reader = new OpenformatReader();
  const result = reader.returnFileData("test.txt", "not xml content");

  expect(result.errorMsg.length).toBeGreaterThan(0);
  expect(result.data).toBeUndefined();
});

test("OpenformatReader accepts XML content regardless of extension", () => {
  const reader = new OpenformatReader();
  const result = reader.returnFileData("test.txt", sampleOpenformat);

  // Should accept because content starts with <?xml
  expect(result.data).toBeDefined();
  expect(result.data?.mosad.mosadName).toBe("מוסד לדוגמה א");
});

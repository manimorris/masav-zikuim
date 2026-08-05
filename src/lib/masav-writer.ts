import { encodeHebrewCp862 } from "./encoding";
import type { MasavDesignedData, MasavTransaction } from "./masav-types";

export class MasavWriter {
  mkRawfile(data: MasavDesignedData): string {
    const mosad = data.mosad;
    const transactions = data.transactions;
    const pymtDetails = {
      ...data.pymtDetails,
      transactionsSum: transactions.reduce((acc, curr) => acc + Number(curr.pymtSum), 0).toFixed(2),
      transactionsCount: transactions.length,
    };

    const kot = this.koteret(mosad, pymtDetails.pymtDate);
    const middleLines = this.transactions(transactions, kot);
    const summary = this.summaryLine(
      pymtDetails.transactionsSum,
      pymtDetails.transactionsCount,
      kot,
    );

    let fileContent = Object.values(kot).join("");
    middleLines.forEach((line) => {
      fileContent += Object.values(line).join("");
    });
    fileContent += Object.values(summary).join("");
    fileContent += "9".repeat(127) + "\r\n";

    return fileContent.trimEnd();
  }

  private koteret(mosad: MasavDesignedData["mosad"], pymtDate: string): Record<string, string> {
    return {
      zihuiReshuma: "K",
      MosadTitle: this.zeroFiller(8, `${mosad.codeMosad}${mosad.codeMosadSubject}`),
      currence: "00",
      pymtDate: this.compactDateYYMMDD(pymtDate),
      filler1: "0",
      serialNum: "001",
      filler2: "0",
      createDate: this.compactDateYYMMDD(pymtDate),
      MosadSholeach: this.zeroFiller(5, mosad.codeMosad),
      filler3: this.zeroFiller(6, ""),
      MosadName: encodeHebrewCp862(mosad.mosadName, 30),
      filler4: " ".repeat(56),
      zihiukoteret: "KOT",
      EOL: "\r\n",
    };
  }

  private transactions(
    payments: MasavTransaction[],
    kot: Record<string, string>,
  ): Record<string, string>[] {
    return payments.map((pymt) => ({
      zihiuReshuma: "1",
      mosadSubject: kot.MosadTitle,
      currency: kot.currence,
      filler1: this.zeroFiller(6, ""),
      bankCode: this.zeroFiller(2, pymt.payeeBank),
      branchCode: this.zeroFiller(3, pymt.payeeBranch),
      accountType: "0000",
      accountNumber: this.zeroFiller(9, pymt.payeeAccount),
      filler2: "0",
      payeeID: this.zeroFiller(9, pymt.payeeID),
      payeeName: encodeHebrewCp862(pymt.payeeName, 16),
      pymtSum: this.zeroFiller(13, this.amountToCents(pymt.pymtSum)),
      payeeRefrence: this.zeroFiller(20, pymt.pymtRefference),
      pymtperiod: this.zeroFiller(8, `${pymt.pymtPeriodfrom}${pymt.pymtPeriodto}`),
      melelCode: "000",
      tnuaType: "006",
      filler3: this.zeroFiller(18, ""),
      blankFiller: " ".repeat(2),
      CRLF: "\r\n",
    }));
  }

  private summaryLine(
    transactionsSum: string | number,
    transactionsCount: string | number,
    kot: Record<string, string>,
  ): Record<string, string> {
    return {
      zihiuReshuma: "5",
      MosadTitle: kot.MosadTitle,
      currence: kot.currence,
      pymtDate: kot.pymtDate,
      filler1: "0",
      serialNum: kot.serialNum,
      tnoutSummary: this.zeroFiller(15, String(transactionsSum).replace(".", "")),
      filler2: this.zeroFiller(15, ""),
      tnuotCount: this.zeroFiller(7, transactionsCount),
      filler3: this.zeroFiller(7, ""),
      blankFiller: " ".repeat(63),
      CRLF: "\r\n",
    };
  }

  private zeroFiller(len: number, input: string | number): string {
    let value = String(input ?? "");
    if (value.length > len) {
      value = value.slice(-len);
    }
    return "0".repeat(Math.max(0, len - value.length)) + value;
  }

  private compactDateYYMMDD(date: string): string {
    const normalized = date.replaceAll("-", "");
    return normalized.slice(-6);
  }

  private amountToCents(value: string | number): string {
    const normalized = String(value ?? "")
      .trim()
      .replace(",", ".");
    const parsed = Number.parseFloat(normalized);

    if (!Number.isFinite(parsed)) {
      return "0";
    }

    return Math.round(parsed * 100).toString();
  }
}

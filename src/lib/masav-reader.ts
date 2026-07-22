import { decodeHebrewCp862 } from "./encoding";
import type { MasavDesignedData, MasavReadResult } from "./masav-types";

type ExtractedData = {
  koteret: Record<string, string>;
  tnout: Record<string, string>[];
  summary: Record<string, string>;
  endLine: string;
};

export class MasavReader {
  errorMsg: string[] = [];
  private extractedData?: ExtractedData;

  returnFileData(fileName: string, content: string): MasavReadResult {
    if (!this.validateFileType(fileName)) {
      return { errorMsg: this.errorMsg };
    }

    if (!content.trim()) {
      this.errorMsg.push("ERROR: no data found");
      return { errorMsg: this.errorMsg };
    }

    this.extractedData = this.readRawFile(content);

    if (!this.validateFileData()) {
      return { errorMsg: this.errorMsg };
    }

    return { data: this.designFileData(), errorMsg: this.errorMsg };
  }

  validateFileType(fileName: string): boolean {
    const fileType = fileName.toLowerCase().split(".").pop() ?? "";
    if (["txt", "001"].includes(fileType)) {
      return true;
    }

    this.errorMsg.push("The file must be a text file with Extention '.txt' or '.001'");
    return false;
  }

  private designFileData(): MasavDesignedData {
    const rawData = this.extractedData!;

    const transactions = rawData.tnout.map((payee) => ({
      payeeName: payee.payeeName,
      payeeID: payee.payeeID,
      pymtSum: this.str2float(payee.pymtSum),
      payeeBank: Number.parseInt(payee.bankCode, 10),
      payeeBranch: Number.parseInt(payee.branchCode, 10),
      payeeAccount: Number.parseInt(payee.accountNumber, 10),
      pymtPeriodfrom: payee.pymtperiod.substring(0, 4),
      pymtPeriodto: payee.pymtperiod.substring(4, 8),
      pymtRefference: Number.parseInt(payee.payeeRefrence, 10),
    }));

    return {
      mosad: {
        codeMosad: rawData.koteret.MosadSholeach,
        codeMosadSubject: rawData.koteret.MosadTitle.substring(5, 8),
        mosadName: rawData.koteret.MosadName,
      },
      pymtDetails: {
        pymtDate: this.toIsoDate(rawData.koteret.pymtDate),
        createDate: rawData.koteret.createDate.match(/.{1,2}/g)?.join("/") ?? rawData.koteret.createDate,
        transactionsSum: transactions.reduce((acc, curr) => acc + Number(curr.pymtSum), 0).toFixed(2),
        transactionsCount: transactions.length,
      },
      transactions,
    };
  }

  private readRawFile(content: string): ExtractedData {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.replace(/\r/g, ""))
      .filter((line) => line.trim() !== "");

    const lineCount = lines.length;
    let koteret: Record<string, string> = {};
    let summary: Record<string, string> = {};
    let endLine = "";
    const tnout: Record<string, string>[] = [];

    lines.forEach((line, index) => {
      if (index === 0) {
        koteret = this.firstLine(line);
      } else if (index === lineCount - 1) {
        endLine = line;
      } else if (index === lineCount - 2) {
        summary = this.summaryLine(line);
      } else {
        tnout.push(this.middleLine(line));
      }
    });

    return { koteret, tnout, summary, endLine };
  }

  validateFileData(): boolean {
    const lineErr = this.validateLastLine();
    const otherDataErr = this.validateOtherSpecs();
    const summaryErr = false;

    if (lineErr || otherDataErr || summaryErr) {
      this.errorMsg.push("שגיאה בקריאת קובץ. נתוני הקובץ אינם תקינים.");
      return false;
    }

    return true;
  }

  private validateLastLine(): string | undefined {
    const endLine = this.extractedData!.endLine;
    if (endLine.indexOf("9".repeat(127)) > 0) {
      return `Last line error. last line:${endLine}`;
    }
    return undefined;
  }

  private validateOtherSpecs(): string {
    const extracted = this.extractedData!;
    let result = extracted.koteret.zihuiReshuma === "K" ? "" : "Error1,";

    result += extracted.koteret.zihiukoteret === "KOT" ? "" : "Error2,";

    extracted.tnout.forEach((trans) => {
      result += trans.zihiuReshuma === "1" ? "" : "Error3,";
    });

    result += extracted.summary.zihiuReshuma === "5" ? "" : "Error4,";

    return result;
  }

  private firstLine(line: string): Record<string, string> {
    return {
      zihuiReshuma: line[0] ?? "",
      MosadTitle: line.substring(1, 9),
      currence: line.substring(9, 11),
      pymtDate: line.substring(11, 17),
      filler1: line.substring(17, 18),
      serialNum: line.substring(18, 21),
      filler2: line.substring(21, 22),
      createDate: line.substring(22, 28),
      MosadSholeach: line.substring(28, 33),
      filler3: line.substring(33, 39),
      MosadName: decodeHebrewCp862(line.substring(39, 69)),
      filler4: line.substring(69, 125),
      zihiukoteret: line.substring(125, 128),
    };
  }

  private middleLine(line: string): Record<string, string> {
    return {
      zihiuReshuma: line[0] ?? "",
      mosadSubject: line.substring(1, 9),
      currency: line.substring(9, 11),
      filler1: line.substring(11, 17),
      bankCode: line.substring(17, 19),
      branchCode: line.substring(19, 22),
      accountType: line.substring(22, 26),
      accountNumber: line.substring(26, 35),
      filler2: line.substring(25, 26),
      payeeID: line.substring(36, 45),
      payeeName: decodeHebrewCp862(line.substring(45, 61)),
      pymtSum: line.substring(61, 74),
      payeeRefrence: line.substring(74, 94),
      pymtperiod: line.substring(94, 102),
      melelCode: line.substring(102, 105),
      tnuaType: line.substring(105, 108),
      filler3: line.substring(108, 126),
      blankFiller: line.substring(126, 128),
    };
  }

  private summaryLine(line: string): Record<string, string> {
    return {
      zihiuReshuma: line[0] ?? "",
      MosadTitle: line.substring(1, 9),
      currence: line.substring(9, 11),
      pymtDate: line.substring(11, 17),
      filler1: line.substring(17, 18),
      serialNum: line.substring(18, 21),
      tnoutSummary: line.substring(21, 36),
      filler2: line.substring(36, 51),
      tnuotCount: line.substring(51, 58),
      filler3: line.substring(58, 65),
      blankFiller: line.substring(65, 128),
    };
  }

  private toIsoDate(value: string): string {
    const yy = Number.parseInt(value.slice(0, 2), 10);
    const mm = value.slice(2, 4);
    const dd = value.slice(4, 6);
    const yyyy = yy >= 70 ? 1900 + yy : 2000 + yy;
    return `${yyyy}-${mm}-${dd}`;
  }

  private str2float(str: string): string {
    return (Number.parseFloat(str) / 100).toFixed(2);
  }
}

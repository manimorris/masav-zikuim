import type { MasavDesignedData, MasavReadResult, MasavTransaction } from "./masav-types";

interface PensionFundPayment {
  fundId: string;
  fundName: string;
  bankCode: number;
  branchCode: number;
  accountNumber: number;
  totalAmount: number;
  paymentDate: string;
  periodMonth: string;
}

interface OpenformatData {
  employerId: string;
  employerName: string;
  executionDate: string;
  fundPayments: PensionFundPayment[];
}

export class OpenformatReader {
  private errorMsg: string[] = [];

  returnFileData(fileName: string, content: string): MasavReadResult {
    if (!this.validateFileType(fileName, content)) {
      return { errorMsg: this.errorMsg };
    }

    if (!content.trim()) {
      this.errorMsg.push("ERROR: no data found");
      return { errorMsg: this.errorMsg };
    }

    try {
      const openformatData = this.parseXml(content);
      const designedData = this.toMasavFormat(openformatData);
      return { data: designedData, errorMsg: this.errorMsg };
    } catch (error) {
      this.errorMsg.push(`ERROR: Failed to parse openformat file: ${error instanceof Error ? error.message : String(error)}`);
      return { errorMsg: this.errorMsg };
    }
  }

  private validateFileType(fileName: string, content: string): boolean {
    const fileType = fileName.toLowerCase().split(".").pop() ?? "";
    const isXmlContent = content.trim().startsWith("<?xml") || content.trim().startsWith("<MimshakMaasikim");

    if (fileType === "dat" || fileType === "xml" || isXmlContent) {
      return true;
    }

    this.errorMsg.push("The file must be an openformat XML file with extension '.dat' or '.xml'");
    return false;
  }

  private parseXml(content: string): OpenformatData {
    const getTagValue = (xml: string, tagName: string): string => {
      const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, "i");
      const match = xml.match(regex);
      return match?.[1]?.trim() ?? "";
    };

    const getAllSections = (xml: string, tagName: string): string[] => {
      const sections: string[] = [];
      const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "gi");
      let match: RegExpExecArray | null;
      while ((match = regex.exec(xml)) !== null) {
        sections.push(match[0]);
      }
      return sections;
    };

    // Extract employer info
    const employerId = getTagValue(content, "MISPAR-ZIHUY-MAASIK") || getTagValue(content, "MISPAR-MEZAHE-PONE");
    const employerName = getTagValue(content, "SHEM-MAASIK") || getTagValue(content, "SHEM-GOREM-PONE");
    const executionDate = this.extractDateFromExecution(getTagValue(content, "TAARICH-BITZUA"));

    // Extract pension fund payments from PirteiHaavaratKsafim sections
    const fundPayments: PensionFundPayment[] = [];
    const paymentSections = getAllSections(content, "PirteiHaavaratKsafim");

    for (const section of paymentSections) {
      const fundIdFull = getTagValue(section, "KOD-MEZAHE-KUPA-H-P");
      const fundId = fundIdFull.substring(0, 9); // First 9 digits are the fund company ID
      const fundName = getTagValue(section, "SHEM-KUPA-ETZEL-MAASIK") || `קופה ${fundId}`;
      const bankCode = parseInt(getTagValue(section, "MISPAR-BANK-KOLET"), 10) || 0;
      const branchCode = parseInt(getTagValue(section, "MISPAR-SNIF-KOLET"), 10) || 0;
      const accountNumber = parseInt(getTagValue(section, "MISPAR-CHESHBON-KOLET"), 10) || 0;
      const totalAmount = parseFloat(getTagValue(section, "SACH-HAFKADA-KUPA-H-P")) || 0;
      const paymentDate = getTagValue(section, "TAARICH-ERECH-HAFKADA-LEKUPA");

      // Get period from first employee in this fund
      const periodMonth = getTagValue(section, "CHODESH-MASKORET");

      if (fundId && totalAmount > 0) {
        // Check if we already have a payment to this fund (aggregate if so)
        const existingPayment = fundPayments.find((p) => p.fundId === fundId && p.bankCode === bankCode && p.accountNumber === accountNumber);
        if (existingPayment) {
          existingPayment.totalAmount += totalAmount;
        } else {
          fundPayments.push({
            fundId,
            fundName,
            bankCode,
            branchCode,
            accountNumber,
            totalAmount,
            paymentDate,
            periodMonth,
          });
        }
      }
    }

    return {
      employerId,
      employerName,
      executionDate,
      fundPayments,
    };
  }

  private extractDateFromExecution(taarichBitzua: string): string {
    // Format: YYYYMMDDHHMMSS -> YYYY-MM-DD
    if (taarichBitzua.length >= 8) {
      const year = taarichBitzua.substring(0, 4);
      const month = taarichBitzua.substring(4, 6);
      const day = taarichBitzua.substring(6, 8);
      return `${year}-${month}-${day}`;
    }
    return "";
  }

  private toMasavFormat(data: OpenformatData): MasavDesignedData {
    // Note: mosad code needs to be provided by user - it's NOT in the openformat file
    // We'll use empty strings as placeholders
    const codeMosad = "";
    const codeMosadSubject = "";

    const transactions: MasavTransaction[] = data.fundPayments.map((fund, index) => {
      // Extract period from periodMonth (YYYY-MM-DD -> YYMM)
      const periodMatch = fund.periodMonth.match(/(\d{4})-(\d{2})/);
      const period = periodMatch ? `${periodMatch[1].substring(2)}${periodMatch[2]}` : "";

      return {
        payeeName: fund.fundName,
        payeeID: fund.fundId,
        pymtSum: fund.totalAmount.toFixed(2),
        payeeBank: fund.bankCode,
        payeeBranch: fund.branchCode,
        payeeAccount: fund.accountNumber,
        pymtPeriodfrom: period,
        pymtPeriodto: period,
        pymtRefference: index + 1,
      };
    });

    // Use the first payment date, or execution date as fallback
    const paymentDate = data.fundPayments[0]?.paymentDate || data.executionDate;

    return {
      mosad: {
        codeMosad,
        codeMosadSubject,
        mosadName: data.employerName,
      },
      pymtDetails: {
        pymtDate: paymentDate,
        createDate: new Date().toISOString().split("T")[0],
        transactionsSum: transactions.reduce((sum, t) => sum + parseFloat(String(t.pymtSum)), 0).toFixed(2),
        transactionsCount: transactions.length,
      },
      transactions,
      // Include employer ID for mosad lookup
      employerId: data.employerId,
    } as MasavDesignedData & { employerId: string };
  }
}

export interface MasavTransaction {
  payeeName: string;
  payeeID: string | number;
  pymtSum: string | number;
  payeeBank: string | number;
  payeeBranch: string | number;
  payeeAccount: string | number;
  pymtPeriodfrom: string | number;
  pymtPeriodto: string | number;
  pymtRefference: string | number;
}

export interface MasavDesignedData {
  mosad: {
    codeMosad: string;
    codeMosadSubject: string;
    mosadName: string;
  };
  pymtDetails: {
    pymtDate: string;
    createDate?: string;
    transactionsSum?: string | number;
    transactionsCount?: string | number;
  };
  transactions: MasavTransaction[];
}

export interface MasavReadResult {
  data?: MasavDesignedData;
  errorMsg: string[];
}

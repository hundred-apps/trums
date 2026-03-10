export type HutangPiutang = {
  contact_id: string;
  name: string;
  hutang: number;
  piutang: number;
  checked?: boolean;
};

export type HutangOrPiutang = {
  "0": number;
  "30": number;
  "60": number;
  "90": number;
  customer_id: string;
  customer_name: string;
  total: number;
};

export type UmurHutangPiutang = {
  hutang: HutangOrPiutang[];
  piutang: HutangOrPiutang[];
  grand_total: {
    hutang: HutangOrPiutang;
    piutang: HutangOrPiutang;
  };
};
export type Pengeluaran = {
  reference: string;
  total_amount: number;
};

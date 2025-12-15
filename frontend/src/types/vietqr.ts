/**
 * Bank information from VietQR API
 */
export interface Bank {
    id: number;
    name: string;
    code: string;
    bin: string;
    shortName: string;
    logo: string;
    transferSupported: number;
    lookupSupported: number;
    short_name: string;
    support: number;
    isTransfer: number;
    swift_code: string;
}

/**
 * VietQR API response for bank list
 */
export interface BankListResponse {
    code: string;
    desc: string;
    data: Bank[];
}

/**
 * VietQR template options
 */
export type VietQRTemplate = "compact" | "compact2" | "qr_only" | "print";

/**
 * Parameters for generating VietQR code
 */
export interface VietQRParams {
    bankId: string; // BIN or shortName
    accountNo: string; // Account number
    template?: VietQRTemplate;
    amount?: number; // Amount in VND
    addInfo?: string; // Transfer description
    accountName?: string; // Account holder name
}

/**
 * Build VietQR image URL from parameters
 */
export function buildVietQRUrl(params: VietQRParams): string {
    const {
        bankId,
        accountNo,
        template = "compact2",
        amount,
        addInfo,
        accountName,
    } = params;

    if (!bankId || !accountNo) {
        return "";
    }

    let url = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png`;

    const queryParams: string[] = [];

    if (amount && amount > 0) {
        queryParams.push(`amount=${amount}`);
    }

    if (addInfo) {
        queryParams.push(`addInfo=${encodeURIComponent(addInfo)}`);
    }

    if (accountName) {
        queryParams.push(`accountName=${encodeURIComponent(accountName)}`);
    }

    if (queryParams.length > 0) {
        url += "?" + queryParams.join("&");
    }

    return url;
}

import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Download,
    Search,
    ChevronDown,
    X,
    Copy,
    Check,
    Building2,
    CreditCard,
    Banknote,
    FileText,
    User,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Bank, VietQRTemplate } from "@/types/vietqr";
import { buildVietQRUrl } from "@/types/vietqr";

const TEMPLATES: {
    value: VietQRTemplate;
    label: string;
    description: string;
}[] = [
    {
        value: "compact",
        label: "Compact",
        description: "Gọn nhẹ với logo ngân hàng",
    },
    {
        value: "compact2",
        label: "Compact 2",
        description: "Gọn nhẹ với tên ngân hàng",
    },
    { value: "qr_only", label: "QR Only", description: "Chỉ mã QR" },
    { value: "print", label: "Print", description: "Phù hợp để in" },
];

export default function VietQRPage() {
    // State
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [accountNo, setAccountNo] = useState("");
    const [accountName, setAccountName] = useState("");
    const [amount, setAmount] = useState("");
    const [addInfo, setAddInfo] = useState("");
    const [template, setTemplate] = useState<VietQRTemplate>("compact2");
    const [bankSearch, setBankSearch] = useState("");
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [copied, setCopied] = useState(false);
    const [qrLoaded, setQrLoaded] = useState(false);
    const [qrError, setQrError] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch banks
    useEffect(() => {
        fetch("https://api.vietqr.io/v2/banks")
            .then((res) => res.json())
            .then((data) => {
                if (data.code === "00") {
                    // Sort by transferSupported and name
                    const sortedBanks = data.data.sort((a: Bank, b: Bank) => {
                        if (b.transferSupported !== a.transferSupported) {
                            return b.transferSupported - a.transferSupported;
                        }
                        return a.shortName.localeCompare(b.shortName);
                    });
                    setBanks(sortedBanks);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch banks:", err);
                toast.error("Không thể tải danh sách ngân hàng");
            })
            .finally(() => setLoading(false));
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowBankDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtered banks
    const filteredBanks = useMemo(() => {
        if (!bankSearch.trim()) return banks;
        const search = bankSearch.toLowerCase();
        return banks.filter(
            (bank) =>
                bank.shortName.toLowerCase().includes(search) ||
                bank.name.toLowerCase().includes(search) ||
                bank.code.toLowerCase().includes(search) ||
                bank.bin.includes(search)
        );
    }, [banks, bankSearch]);

    // Build QR URL
    const qrUrl = useMemo(() => {
        if (!selectedBank || !accountNo) return "";
        return buildVietQRUrl({
            bankId: selectedBank.bin,
            accountNo,
            template,
            amount: amount
                ? parseInt(amount.replace(/\D/g, ""), 10)
                : undefined,
            addInfo: addInfo || undefined,
            accountName: accountName || undefined,
        });
    }, [selectedBank, accountNo, template, amount, addInfo, accountName]);

    // Format amount with thousand separators
    const handleAmountChange = (value: string) => {
        const numericValue = value.replace(/\D/g, "");
        if (numericValue) {
            const formatted = parseInt(numericValue, 10).toLocaleString(
                "vi-VN"
            );
            setAmount(formatted);
        } else {
            setAmount("");
        }
    };

    // Copy QR URL
    const handleCopyUrl = () => {
        if (qrUrl) {
            navigator.clipboard.writeText(qrUrl);
            setCopied(true);
            toast.success("Đã sao chép URL!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Download QR
    const handleDownload = async () => {
        if (!qrUrl) return;

        try {
            const response = await fetch(qrUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `vietqr-${selectedBank?.shortName}-${accountNo}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Đã tải mã QR!");
        } catch (err) {
            console.error("Download failed:", err);
            toast.error("Không thể tải mã QR");
        }
    };

    // Reset QR state when params change
    useEffect(() => {
        setQrLoaded(false);
        setQrError(false);
    }, [qrUrl]);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link
                        to="/tools"
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-500" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            VietQR
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel - Form */}
                    <div className="space-y-4">
                        {/* Bank Selector */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Building2 className="w-4 h-4 text-emerald-500" />
                                <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Ngân hàng
                                </h2>
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() =>
                                        setShowBankDropdown(!showBankDropdown)
                                    }
                                    disabled={loading}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-neutral-100 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl text-left transition-all hover:border-emerald-500 dark:hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    {selectedBank ? (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={selectedBank.logo}
                                                alt={selectedBank.shortName}
                                                className="w-8 h-8 object-contain rounded"
                                            />
                                            <div>
                                                <div className="font-medium text-neutral-900 dark:text-white">
                                                    {selectedBank.shortName}
                                                </div>
                                                <div className="text-xs text-neutral-500">
                                                    {selectedBank.name}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-neutral-500">
                                            {loading
                                                ? "Đang tải..."
                                                : "Chọn ngân hàng"}
                                        </span>
                                    )}
                                    <ChevronDown
                                        className={`w-5 h-5 text-neutral-400 transition-transform ${
                                            showBankDropdown ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {/* Dropdown */}
                                {showBankDropdown && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-hidden">
                                        {/* Search */}
                                        <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                <input
                                                    type="text"
                                                    value={bankSearch}
                                                    onChange={(e) =>
                                                        setBankSearch(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Tìm ngân hàng..."
                                                    className="w-full pl-9 pr-9 py-2 bg-neutral-100 dark:bg-neutral-700 border-0 rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                                    autoFocus
                                                />
                                                {bankSearch && (
                                                    <button
                                                        onClick={() =>
                                                            setBankSearch("")
                                                        }
                                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                                    >
                                                        <X className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bank List */}
                                        <div className="max-h-64 overflow-y-auto">
                                            {filteredBanks.length > 0 ? (
                                                filteredBanks.map((bank) => (
                                                    <button
                                                        key={bank.id}
                                                        onClick={() => {
                                                            setSelectedBank(
                                                                bank
                                                            );
                                                            setShowBankDropdown(
                                                                false
                                                            );
                                                            setBankSearch("");
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors ${
                                                            selectedBank?.id ===
                                                            bank.id
                                                                ? "bg-emerald-50 dark:bg-emerald-900/20"
                                                                : ""
                                                        }`}
                                                    >
                                                        <img
                                                            src={bank.logo}
                                                            alt={bank.shortName}
                                                            className="w-8 h-8 object-contain rounded"
                                                        />
                                                        <div className="text-left flex-1 min-w-0">
                                                            <div className="font-medium text-neutral-900 dark:text-white truncate">
                                                                {bank.shortName}
                                                            </div>
                                                            <div className="text-xs text-neutral-500 truncate">
                                                                {bank.name}
                                                            </div>
                                                        </div>
                                                        {!bank.transferSupported && (
                                                            <span className="px-2 py-0.5 text-[10px] bg-neutral-200 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400 rounded">
                                                                Không hỗ trợ
                                                            </span>
                                                        )}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-neutral-500">
                                                    Không tìm thấy ngân hàng
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Number */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <CreditCard className="w-4 h-4 text-emerald-500" />
                                <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Số tài khoản{" "}
                                    <span className="text-red-500">*</span>
                                </h2>
                            </div>
                            <input
                                type="text"
                                value={accountNo}
                                onChange={(e) =>
                                    setAccountNo(
                                        e.target.value.replace(/\D/g, "")
                                    )
                                }
                                placeholder="Nhập số tài khoản"
                                className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            />
                        </div>

                        {/* Account Name */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <User className="w-4 h-4 text-emerald-500" />
                                <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Tên chủ tài khoản
                                </h2>
                            </div>
                            <input
                                type="text"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                placeholder="VD: NGUYEN VAN A"
                                className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all uppercase"
                            />
                        </div>

                        {/* Amount */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Banknote className="w-4 h-4 text-emerald-500" />
                                <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Số tiền (VND)
                                </h2>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={(e) =>
                                        handleAmountChange(e.target.value)
                                    }
                                    placeholder="Để trống nếu không cố định"
                                    className="w-full px-4 py-3 pr-16 bg-neutral-100 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                                    VND
                                </span>
                            </div>
                        </div>

                        {/* Transfer Info */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4 text-emerald-500" />
                                <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Nội dung chuyển khoản
                                </h2>
                            </div>
                            <input
                                type="text"
                                value={addInfo}
                                onChange={(e) => setAddInfo(e.target.value)}
                                placeholder="VD: Thanh toan don hang 123"
                                className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            />
                        </div>

                        {/* Template Selector */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                                Giao diện QR
                            </h2>
                            <div className="grid grid-cols-2 gap-2">
                                {TEMPLATES.map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={() => setTemplate(t.value)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                            template === t.value
                                                ? "bg-emerald-500 text-white"
                                                : "bg-neutral-100 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="space-y-4">
                        {/* QR Preview */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-6">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-4 text-center">
                                Mã QR của bạn
                            </h2>

                            <div className="flex justify-center">
                                {qrUrl ? (
                                    <div className="relative">
                                        {/* Loading skeleton */}
                                        {!qrLoaded && !qrError && (
                                            <div className="w-64 h-64 bg-neutral-100 dark:bg-neutral-700 rounded-xl animate-pulse flex items-center justify-center">
                                                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}

                                        {/* QR Image */}
                                        <img
                                            src={qrUrl}
                                            alt="VietQR Code"
                                            className={`max-w-full h-auto rounded-xl shadow-lg transition-opacity duration-300 ${
                                                qrLoaded
                                                    ? "opacity-100"
                                                    : "opacity-0 absolute"
                                            }`}
                                            onLoad={() => setQrLoaded(true)}
                                            onError={() => {
                                                setQrError(true);
                                                setQrLoaded(false);
                                            }}
                                            style={{ maxHeight: "400px" }}
                                        />

                                        {/* Error state */}
                                        {qrError && (
                                            <div className="w-64 h-64 bg-red-50 dark:bg-red-900/20 border-2 border-dashed border-red-300 dark:border-red-700 rounded-xl flex flex-col items-center justify-center text-red-500">
                                                <X className="w-10 h-10 mb-2" />
                                                <span className="text-sm">
                                                    Không thể tải mã QR
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-64 h-64 bg-neutral-100 dark:bg-neutral-700/50 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl flex flex-col items-center justify-center text-neutral-400">
                                        <CreditCard className="w-10 h-10 mb-2" />
                                        <span className="text-sm text-center px-4">
                                            Chọn ngân hàng và nhập số tài khoản
                                            để tạo mã QR
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Info Summary */}
                            {qrUrl && qrLoaded && (
                                <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-700/30 rounded-xl space-y-2">
                                    {selectedBank && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-500">
                                                Ngân hàng
                                            </span>
                                            <span className="font-medium text-neutral-900 dark:text-white">
                                                {selectedBank.shortName}
                                            </span>
                                        </div>
                                    )}
                                    {accountNo && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-500">
                                                Số TK
                                            </span>
                                            <span className="font-medium text-neutral-900 dark:text-white font-mono">
                                                {accountNo}
                                            </span>
                                        </div>
                                    )}
                                    {accountName && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-500">
                                                Chủ TK
                                            </span>
                                            <span className="font-medium text-neutral-900 dark:text-white uppercase">
                                                {accountName}
                                            </span>
                                        </div>
                                    )}
                                    {amount && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-500">
                                                Số tiền
                                            </span>
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                {amount} VND
                                            </span>
                                        </div>
                                    )}
                                    {addInfo && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-500">
                                                Nội dung
                                            </span>
                                            <span className="font-medium text-neutral-900 dark:text-white truncate max-w-[200px]">
                                                {addInfo}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {qrUrl && qrLoaded && (
                            <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDownload}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-lg shadow-emerald-500/25"
                                    >
                                        <Download className="w-5 h-5" />
                                        Tải xuống PNG
                                    </button>
                                    <button
                                        onClick={handleCopyUrl}
                                        className="px-4 py-3 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all"
                                        title="Sao chép URL"
                                    >
                                        {copied ? (
                                            <Check className="w-5 h-5 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50 p-4">
                            <h3 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">
                                💡 Mẹo sử dụng
                            </h3>
                            <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1">
                                <li>
                                    • Để trống số tiền nếu muốn người chuyển tự
                                    nhập
                                </li>
                                <li>
                                    • Nội dung chuyển khoản nên viết không dấu
                                    để tương thích tốt hơn
                                </li>
                                <li>
                                    • Template "Print" phù hợp nhất để in trên
                                    giấy
                                </li>
                                <li>
                                    • Mã QR này tuân theo tiêu chuẩn VietQR
                                    (EMV)
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

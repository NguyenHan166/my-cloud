import {
    useRef,
    useState,
    type KeyboardEvent,
    type ClipboardEvent,
    type ChangeEvent,
} from "react";
import { cn } from "@/lib/utils/cn";

export interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: boolean;
    className?: string;
}

export default function OtpInput({
    length = 8,
    value,
    onChange,
    disabled = false,
    error = false,
    className,
}: OtpInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);

    // Split value into array of digits
    const digits = value.padEnd(length, " ").split("").slice(0, length);

    const focusInput = (index: number) => {
        const ref = inputRefs.current[index];
        if (ref) {
            ref.focus();
            ref.select();
        }
    };

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.slice(-1);
        if (newValue && !/^\d$/.test(newValue)) return;

        const newDigits = [...digits];
        newDigits[index] = newValue || " ";
        const newOtp = newDigits.join("").trim();
        onChange(newOtp);

        if (newValue && index < length - 1) {
            focusInput(index + 1);
            setActiveIndex(index + 1);
        }
    };

    const handleKeyDown = (
        index: number,
        e: KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Backspace") {
            if (!digits[index] || digits[index] === " ") {
                if (index > 0) {
                    const newDigits = [...digits];
                    newDigits[index - 1] = " ";
                    onChange(newDigits.join("").trim());
                    focusInput(index - 1);
                    setActiveIndex(index - 1);
                }
            } else {
                const newDigits = [...digits];
                newDigits[index] = " ";
                onChange(newDigits.join("").trim());
            }
            e.preventDefault();
        } else if (e.key === "ArrowLeft" && index > 0) {
            focusInput(index - 1);
            setActiveIndex(index - 1);
        } else if (e.key === "ArrowRight" && index < length - 1) {
            focusInput(index + 1);
            setActiveIndex(index + 1);
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData("text/plain")
            .replace(/\D/g, "")
            .slice(0, length);
        onChange(pastedData);

        const nextIndex = Math.min(pastedData.length, length - 1);
        focusInput(nextIndex);
        setActiveIndex(nextIndex);
    };

    return (
        <div className={cn("flex gap-2 justify-center", className)}>
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit === " " ? "" : digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => setActiveIndex(index)}
                    onBlur={() => setActiveIndex(-1)}
                    disabled={disabled}
                    className={cn(
                        "w-11 h-14 text-center text-xl font-bold rounded-xl transition-all duration-300",
                        "bg-neutral-50 border-2",
                        "focus:outline-none focus:bg-white",
                        "disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400",
                        error
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : activeIndex === index && !disabled
                            ? "border-primary-500 ring-4 ring-primary-500/20 bg-white shadow-glow"
                            : digit !== " "
                            ? "border-primary-300 bg-primary-50/50"
                            : "border-neutral-200 hover:border-neutral-300"
                    )}
                />
            ))}
        </div>
    );
}

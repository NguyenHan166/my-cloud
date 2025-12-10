import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            id,
            disabled,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = id || generatedId;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-neutral-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={cn(
                            "w-full px-3 py-2 border rounded-md transition-all duration-200",
                            "text-neutral-900 placeholder-neutral-400",
                            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                            "disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-500",
                            error
                                ? "border-red-500 focus:ring-red-500"
                                : "border-neutral-300 hover:border-neutral-400",
                            leftIcon && "pl-10",
                            rightIcon && "pr-10",
                            className
                        )}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="mt-1.5 text-sm text-red-600">{error}</p>
                )}

                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-neutral-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;

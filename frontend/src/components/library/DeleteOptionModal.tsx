import { useEffect, useRef } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface DeleteOptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMoveToTrash: () => void;
    onDeletePermanently: () => void;
    isTrashing?: boolean;
    isDeleting?: boolean;
}

export default function DeleteOptionModal({
    isOpen,
    onClose,
    onMoveToTrash,
    onDeletePermanently,
    isTrashing = false,
    isDeleting = false,
}: DeleteOptionModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Focus trap
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                tabIndex={-1}
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                    <X className="w-5 h-5 text-neutral-500" />
                </button>

                {/* Content */}
                <div className="p-6 pt-8 text-center">
                    {/* Icon */}
                    <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-red-500 bg-red-100 mb-4">
                        <Trash2 className="w-7 h-7" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                        Delete Item
                    </h3>

                    {/* Message */}
                    <p className="text-neutral-600 mb-6">
                        How would you like to delete this item?
                    </p>

                    {/* Options */}
                    <div className="space-y-3">
                        {/* Option 1: Move to Trash */}
                        <button
                            onClick={onMoveToTrash}
                            disabled={isTrashing || isDeleting}
                            className="w-full text-left p-4 rounded-xl border border-neutral-200 hover:border-orange-500 hover:bg-orange-50 transition-all group relative overflow-hidden"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-neutral-900 group-hover:text-orange-700">
                                        Move to Trash
                                    </h4>
                                    <p className="text-sm text-neutral-500 mt-1">
                                        Item will be kept for 30 days before
                                        permanent deletion.
                                    </p>
                                </div>
                            </div>
                            {isTrashing && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                    <span className="text-sm font-medium text-orange-600">
                                        Processing...
                                    </span>
                                </div>
                            )}
                        </button>

                        {/* Option 2: Delete Permanently */}
                        <button
                            onClick={onDeletePermanently}
                            disabled={isTrashing || isDeleting}
                            className="w-full text-left p-4 rounded-xl border border-neutral-200 hover:border-red-500 hover:bg-red-50 transition-all group relative overflow-hidden"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-neutral-900 group-hover:text-red-700">
                                        Delete Permanently
                                    </h4>
                                    <p className="text-sm text-neutral-500 mt-1">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            {isDeleting && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                    <span className="text-sm font-medium text-red-600">
                                        Processing...
                                    </span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isTrashing || isDeleting}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}

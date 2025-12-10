import { FileText } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function LibraryPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900">Library</h1>
                <p className="text-neutral-600 mt-2">
                    Your personal knowledge base
                </p>
            </div>

            <EmptyState
                icon={<FileText className="w-16 h-16" />}
                title="No items yet"
                description="Start building your library by adding files, links, or notes"
                action={{
                    label: "Add Item",
                    onClick: () => console.log("Add item clicked"),
                }}
            />
        </div>
    );
}

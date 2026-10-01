"use client";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
export function ConfirmDelete({ blogTitle, busy, error, onCancel, onConfirm }: { blogTitle: string; busy: boolean; error?: string; onCancel: () => void; onConfirm: () => void }) { return <DeleteConfirmationDialog busy={busy} error={error} itemName={blogTitle} onCancel={onCancel} onConfirm={onConfirm} resourceLabel="Blog" />; }

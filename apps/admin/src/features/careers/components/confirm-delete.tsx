"use client";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
export function ConfirmDelete({ title, busy, error, onCancel, onConfirm }: { title: string; busy: boolean; error?: string; onCancel: () => void; onConfirm: () => void }) { return <DeleteConfirmationDialog busy={busy} error={error} itemName={title} onCancel={onCancel} onConfirm={onConfirm} resourceLabel="Career" />; }

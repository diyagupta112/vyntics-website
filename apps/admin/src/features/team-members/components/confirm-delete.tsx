"use client";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
export function ConfirmDelete({ name, busy, error, onCancel, onConfirm }: { name: string; busy: boolean; error?: string; onCancel: () => void; onConfirm: () => void }) { return <DeleteConfirmationDialog busy={busy} error={error} itemName={name} onCancel={onCancel} onConfirm={onConfirm} resourceLabel="Team Member" />; }

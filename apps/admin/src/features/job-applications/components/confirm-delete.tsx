"use client";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
export function ConfirmDelete({ applicantName, busy, error, onCancel, onConfirm }: { applicantName: string; busy: boolean; error?: string; onCancel: () => void; onConfirm: () => void }) { return <DeleteConfirmationDialog busy={busy} error={error} itemName={`${applicantName}’s application`} onCancel={onCancel} onConfirm={onConfirm} resourceLabel="Application" />; }

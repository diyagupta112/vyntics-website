"use client";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
export function ConfirmDelete({ busy, error, name, onCancel, onConfirm }: { busy: boolean; error?: string; name: string; onCancel: () => void; onConfirm: () => void }) { return <DeleteConfirmationDialog busy={busy} error={error} itemName={`submission from ${name}`} onCancel={onCancel} onConfirm={onConfirm} resourceLabel="Contact Submission" />; }

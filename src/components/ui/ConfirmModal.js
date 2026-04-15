"use client";

import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmModal({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Konfirmasi", 
  description = "Apa kamu yakin mau melakukan ini?",
  confirmText = "Ya, Lanjut",
  cancelText = "Batal",
  danger = false,
  loading = false
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="p-5">
        <p className="text-sm text-text-muted mb-6">{description}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button 
            variant={danger ? "danger" : "primary"} 
            onClick={onConfirm} 
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

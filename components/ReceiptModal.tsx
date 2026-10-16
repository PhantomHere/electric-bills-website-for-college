'use client';

import { Payment } from '@/lib/types';
import { Modal } from './Modal';
import { Receipt } from './Receipt';

export function ReceiptModal({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  return (
    <Modal open={!!payment} onClose={onClose} title="Receipt">
      {payment && <Receipt payment={payment} />}
    </Modal>
  );
}

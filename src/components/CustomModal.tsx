import React from 'react';
import { Modal } from 'antd';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = 600,
}) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      footer={footer !== undefined ? footer : null}
      width={width}
      className="custom-shared-modal"
      centered
      destroyOnClose
    >
      <div style={{ color: 'var(--text-primary)', marginTop: '8px' }}>
        {children}
      </div>
    </Modal>
  );
};

export default CustomModal;

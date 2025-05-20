import React, { createContext, useState } from 'react';
import Modal from '../components/Modal';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    content: null,
    size: 'medium',
  });

  const openModal = (title, content, size = 'medium') => {
    setModalState({
      isOpen: true,
      title,
      content,
      size,
    });
  };

  const closeModal = () => {
    setModalState({
      ...modalState,
      isOpen: false,
    });
  };

  return (
    <ModalContext.Provider
      value={{
        modalState,
        openModal,
        closeModal,
      }}
    >
      {children}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        size={modalState.size}
      >
        {modalState.content}
      </Modal>
    </ModalContext.Provider>
  );
};

import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, PropsWithChildren, useCallback } from "react";

interface ModalProps {
  show: boolean;
  onRequestClose: () => void;
  closeOnTapOutside?: boolean;
}

interface ModalSubmodules {
  Actions: ActionsComponent;
  Title: typeof Dialog["Title"];
  Panel: typeof Dialog["Panel"];
  Description: typeof Dialog["Description"];
}

export const Modal: React.FC<PropsWithChildren<ModalProps>> &
  ModalSubmodules = ({ children, show, onRequestClose, closeOnTapOutside }) => {
  const handleBgTap = useCallback(() => {
    if (closeOnTapOutside) {
      onRequestClose();
    }
  }, [closeOnTapOutside, onRequestClose]);
  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onRequestClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={handleBgTap}
          />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="min-w-screen flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:items-end sm:p-0">
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative inline-block w-full transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6 sm:align-middle">
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

Modal.Title = Dialog.Title;
Modal.Panel = Dialog.Panel;
Modal.Description = Dialog.Description;

type ActionsComponent = React.FC<PropsWithChildren<Record<string, unknown>>>;
const Actions: ActionsComponent = ({ children }) => (
  <div className="mt-5 border-t border-gray-100 pt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
    {children}
  </div>
);
Modal.Actions = Actions;

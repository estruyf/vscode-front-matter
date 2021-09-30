import { Dialog, Transition } from '@headlessui/react';
import * as React from 'react';
import { Fragment, useRef } from 'react';

export interface IMetadataProps {
  title: string;
  description: string;
  okBtnText: string;
  cancelBtnText: string;
  isSaveDisabled: boolean;

  dismiss: () => void;
  trigger: () => void;
}

export const Metadata: React.FunctionComponent<IMetadataProps> = ({title, description, cancelBtnText, okBtnText, dismiss, isSaveDisabled, trigger, children}: React.PropsWithChildren<IMetadataProps>) => {

  const cancelButtonRef = useRef(null);
  
  
  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={() => dismiss()}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-vulcan-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
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
            <div className="inline-block align-bottom bg-white dark:bg-vulcan-500 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border-2 border-whisper-900">
              <div>
                <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-vulcan-300 dark:text-whisper-900">
                  {title}
                </Dialog.Title>

                <div className="mt-2">
                  <p className="text-sm text-vulcan-500 dark:text-whisper-500">
                    {description}
                  </p>
                </div>

                <div className="mt-4">
                  {children}
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-30"
                    onClick={() => trigger()}
                    disabled={isSaveDisabled}
                  >
                    {okBtnText}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-200 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => dismiss()}
                    ref={cancelButtonRef}
                  >
                    {cancelBtnText}
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
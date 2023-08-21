import { Dialog, Transition } from '@headlessui/react';
import * as React from 'react';
import { Fragment, useRef } from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface IFormDialogProps {
  title: string;
  description: string;
  okBtnText: string;
  cancelBtnText: string;
  isSaveDisabled: boolean;

  dismiss: () => void;
  trigger: () => void;
}

export const FormDialog: React.FunctionComponent<IFormDialogProps> = ({
  title,
  description,
  cancelBtnText,
  okBtnText,
  dismiss,
  isSaveDisabled,
  trigger,
  children
}: React.PropsWithChildren<IFormDialogProps>) => {
  const cancelButtonRef = useRef(null);
  const { getColors } = useThemeColors();

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog
        className="fixed z-50 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={() => dismiss()}
      >
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
            <Dialog.Overlay className={`fixed inset-0 transition-opacity ${getColors(
              `bg-vulcan-500 bg-opacity-75`,
              `bg-[var(--vscode-editor-background)] opacity-75`
            )
              }`} />
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
            <div className={`inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-auto shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border-2 ${getColors(
              'bg-white dark:bg-vulcan-500 border-whisper-900',
              'bg-[var(--vscode-sideBar-background)] border-[var(--frontmatter-border)]'
            )
              }`}>
              <div>
                <Dialog.Title
                  as="h3"
                  className={`text-lg leading-6 font-medium ${getColors(`text-vulcan-300 dark:text-whisper-900`, `text-[var(--vscode-editor-foreground)]`)
                    }`}
                >
                  {title}
                </Dialog.Title>

                <div className="mt-2">
                  <p className="text-sm text-vulcan-500 dark:text-whisper-500">{description}</p>
                </div>

                <div className="mt-4">{children}</div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:mt-0 sm:w-auto sm:text-sm sm:ml-3 ${getColors(
                      'bg-teal-600 focus:ring-teal-500 text-white hover:bg-teal-700 dark:hover:bg-teal-900 ',
                      'bg-[var(--frontmatter-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]'
                    )
                      }`}
                    onClick={() => trigger()}
                    disabled={isSaveDisabled}
                  >
                    {okBtnText}
                  </button>

                  <button
                    type="button"
                    className={`mt-3 w-full inline-flex justify-center rounded shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:mt-0 sm:w-auto sm:text-sm ${getColors(
                      'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-200',
                      'bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)]'
                    )
                      }`}
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

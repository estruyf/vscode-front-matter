import { Dialog, Transition } from '@headlessui/react';
import * as React from 'react';
import { Fragment } from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface IInfoDialogProps {
  icon?: JSX.Element;
  title: string;
  description: string;
  dismiss: () => void;
}

export const InfoDialog: React.FunctionComponent<IInfoDialogProps> = ({
  dismiss,
  icon,
  title,
  description,
  children
}: React.PropsWithChildren<IInfoDialogProps>) => {
  const { getColors } = useThemeColors();
  
  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog className="fixed z-10 inset-0 overflow-y-auto" onClose={dismiss}>
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
            <Dialog.Overlay className={`fixed inset-0 transition-opacity ${
              getColors(
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
            <div className={`inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border-2  ${
              getColors(
                `bg-white dark:bg-vulcan-500 border-whisper-900`,
                `bg-[var(--vscode-editor-background)] border-[var(--vscode-panel-border)]`
              )
            }`}>
              <div className="sm:flex sm:items-start">
                {icon && (
                  <div className={`mt-3 sm:mr-4 mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    getColors(
                      `bg-gray-50 dark:bg-vulcan-400`,
                      `bg-[var(--vscode-sidebar-background)]'`
                    )
                  }`}>
                    {icon}
                  </div>
                )}
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className={`text-lg leading-6 font-medium ${
                      getColors(`text-vulcan-300 dark:text-whisper-900`, `text-[var(--vscode-editor-foreground)]`)
                    }`}
                  >
                    {title}
                  </Dialog.Title>
                  <div className="mt-2">
                  <p className={`text-sm ${getColors(`text-vulcan-500 dark:text-whisper-500`, `text-[var(--vscode-editor-foreground)]`)}`}>{description}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4">{children}</div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

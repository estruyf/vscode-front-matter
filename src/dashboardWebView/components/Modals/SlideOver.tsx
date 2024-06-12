import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { Fragment, useRef } from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface ISlideOverProps {
  title: string;
  description: string;
  okBtnText: string;
  cancelBtnText: string;
  isSaveDisabled: boolean;

  dismiss: () => void;
  trigger: () => void;
}

export const SlideOver: React.FunctionComponent<ISlideOverProps> = ({
  title,
  description,
  okBtnText,
  cancelBtnText,
  isSaveDisabled,
  dismiss,
  trigger,
  children
}: React.PropsWithChildren<ISlideOverProps>) => {
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog onClose={dismiss} as={'div' as any} className="fixed inset-0 overflow-hidden z-50">
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className={`absolute inset-0 transition-opacity bg-[var(--vscode-editor-background)] opacity-75`} />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-md">
                <div className={`flex h-full flex-col overflow-y-scroll border-l pb-6 shadow-xl bg-[var(--vscode-sideBar-background)] border-[var(--frontmatter-border)]`}>
                  <div className="py-6 sticky top-0 z-10 px-4 sm:px-6 bg-[var(--vscode-sideBar-background)] text-[var(--vscode-sideBarTitle-foreground)]">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className={`text-lg font-medium`}>
                        {title}
                      </Dialog.Title>

                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className={`focus:outline-none text-[var(--vscode-titleBar-inactiveForeground)] hover:text-[var(--vscode-titleBar-activeForeground)]`}
                          onClick={dismiss}
                        >
                          <span className="sr-only">{l10n.t(LocalizationKey.dashboardMediaPanelClose)}</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-1">
                      <p className="text-sm">{description}</p>
                    </div>
                  </div>

                  <div className="relative flex-1 px-4 sm:px-6">
                    <div className="space-y-4">
                      <div>
                        {children}
                      </div>

                      <div className="my-6 sm:my-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          className={`w-full inline-flex justify-center rounded shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:mt-0 sm:w-auto sm:text-sm sm:ml-3 bg-[var(--frontmatter-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]`}
                          onClick={() => trigger()}
                          disabled={isSaveDisabled}
                        >
                          {okBtnText}
                        </button>

                        <button
                          type="button"
                          className={`mt-3 w-full inline-flex justify-center rounded shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:mt-0 sm:w-auto sm:text-sm bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)]`}
                          onClick={() => dismiss()}
                          ref={cancelButtonRef}
                        >
                          {cancelBtnText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

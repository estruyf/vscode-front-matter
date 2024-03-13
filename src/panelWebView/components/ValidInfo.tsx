import * as React from 'react';
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export interface IValidInfoProps {
  label?: string;
  isValid: boolean;
}

const ValidInfo: React.FunctionComponent<IValidInfoProps> = ({
  label,
  isValid
}: React.PropsWithChildren<IValidInfoProps>) => {
  return (
    <>
      {isValid ? (
        <CheckIcon className={`h-4 w-4 text-[#46ec86] mr-2`} />
      ) : (
        <ExclamationTriangleIcon className={`h-4 w-4 text-[var(--vscode-statusBarItem-warningBackground)] mr-2`} />
      )}
      {label && <span>{label}</span>}
    </>
  );
};

ValidInfo.displayName = 'ValidInfo';
export { ValidInfo };

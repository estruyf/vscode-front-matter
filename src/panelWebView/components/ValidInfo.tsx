import * as React from 'react';
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export interface IValidInfoProps {
  label?: string;
  isValid: boolean;
  className?: string;
}

const ValidInfo: React.FunctionComponent<IValidInfoProps> = ({
  label,
  isValid,
  className,
}: React.PropsWithChildren<IValidInfoProps>) => {
  return (
    <div className='inline-flex items-center h-full'>
      {isValid ? (
        <CheckIcon className={`h-6 w-6 text-[var(--vscode-charts-green)] mr-2`} />
      ) : (
        <ExclamationTriangleIcon className={`h-6 w-6 text-[var(--vscode-notificationsWarningIcon-foreground)] mr-2`} />
      )}
      {label && <span className={className || ""}><b>{label}</b></span>}
    </div>
  );
};

ValidInfo.displayName = 'ValidInfo';
export { ValidInfo };

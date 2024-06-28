import * as React from 'react';
import { useMemo } from 'react';
import { RequiredAsterix } from './RequiredAsterix';
import { CustomScript } from '../../../models';
import { FieldCustomAction } from './FieldCustomAction';

export interface IFieldTitleProps {
  label: string | JSX.Element;
  icon?: JSX.Element;
  className?: string;
  required?: boolean;
  actionElement?: JSX.Element;
  customAction?: CustomScript;
  isDisabled?: boolean;
  triggerLoading?: (message?: string) => void;
  onChange?: (value: any) => void;
}

export const FieldTitle: React.FunctionComponent<IFieldTitleProps> = ({
  label,
  icon,
  className,
  required,
  actionElement,
  customAction,
  isDisabled,
  triggerLoading,
  onChange,
}: React.PropsWithChildren<IFieldTitleProps>) => {
  const Icon = useMemo(() => {
    return icon ? React.cloneElement(icon, { style: { width: '16px', height: '16px' } }) : null;
  }, [icon]);

  return (
    <div className='flex items-center justify-between w-full mb-2'>
      <label className={`metadata_field__label text-base text-[var(--vscode-foreground)] ${className || ''}`}>
        {Icon}
        <span style={{ lineHeight: '16px' }}>{label}</span>
        <RequiredAsterix required={required} />
      </label>

      <div className="flex gap-4">
        {
          customAction && onChange && (
            <FieldCustomAction
              action={customAction}
              disabled={isDisabled}
              triggerLoading={triggerLoading}
              onChange={onChange} />
          )
        }

        {actionElement}
      </div>
    </div>
  );
};

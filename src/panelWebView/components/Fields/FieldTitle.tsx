import * as React from 'react';
import { useMemo } from 'react';
import { RequiredAsterix } from './RequiredAsterix';

export interface IFieldTitleProps {
  label: string | JSX.Element;
  icon?: JSX.Element;
  className?: string;
  required?: boolean;
  actionElement?: JSX.Element;
}

export const FieldTitle: React.FunctionComponent<IFieldTitleProps> = ({
  label,
  icon,
  className,
  required,
  actionElement,
}: React.PropsWithChildren<IFieldTitleProps>) => {
  const Icon = useMemo(() => {
    return icon ? React.cloneElement(icon, { style: { width: '16px', height: '16px' } }) : null;
  }, [icon]);

  return (
    <div className='flex items-center justify-between w-full'>
      <label className={`metadata_field__label text-base text-[var(--vscode-foreground)] py-2 ${className || ''}`}>
        {Icon}
        <span style={{ lineHeight: '16px' }}>{label}</span>
        <RequiredAsterix required={required} />
      </label>

      {actionElement}
    </div>
  );
};

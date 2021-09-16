import { PhotographIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { MessageHelper } from '../../../helpers/MessageHelper';
import { PanelSettings } from '../../../models';
import { CommandToCode } from '../../CommandToCode';
import { VsLabel } from '../VscodeComponents';

export interface IPreviewImageFieldProps {
  label: string;
  value: string | null;
  filePath: string | null;
  onChange: (value: string | null) => void;
}

export const PreviewImageField: React.FunctionComponent<IPreviewImageFieldProps> = ({label, onChange, value, filePath}: React.PropsWithChildren<IPreviewImageFieldProps>) => {

  const selectImage = () => {
    MessageHelper.sendMessage(CommandToCode.selectImage, { filePath });
  };

  return (
    <div className={`metadata_field`}>
      <VsLabel>
        <div className={`metadata_field__label`}>
          <PhotographIcon style={{ width: "16px", height: "16px" }} /> <span style={{ lineHeight: "16px"}}>{label}</span>
        </div>
      </VsLabel>
      
      <div className={`metadata_field__preview_image`}>
        {
          value ? (
            <div>
              <img src={value} />

              <button onClick={() => onChange(null)} className={`metadata_field__preview_image__remove`}>Remove image</button>
            </div>
          ) : (
            <button onClick={selectImage}>Select image</button>
          )
        }
      </div>
    </div>
  );
};
import * as React from 'react';
import { PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';
import { Collapsible } from './Collapsible';
import { VsCheckbox } from './VscodeComponents';

export interface IGlobalSettingsProps {
  settings: PanelSettings | undefined;
  isBase?: boolean;
}

export const GlobalSettings: React.FunctionComponent<IGlobalSettingsProps> = ({settings, isBase}: React.PropsWithChildren<IGlobalSettingsProps>) => {
  const { modifiedDateUpdate } = settings || {};

  const onCheck = () => {
    MessageHelper.sendMessage(CommandToCode.updateModifiedUpdating, !modifiedDateUpdate);
  };

  return (
    <>
      <Collapsible id={`${isBase ? "base_" : ""}settings`} title="Global settings">
        <div className={`base__actions`}>
          <VsCheckbox label="Auto-update modified date" checked={modifiedDateUpdate} onClick={onCheck} />
        </div>
      </Collapsible>
    </>
  );
};
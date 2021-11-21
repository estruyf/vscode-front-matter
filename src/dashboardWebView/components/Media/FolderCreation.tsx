import * as React from 'react';
import { FolderAddIcon } from '@heroicons/react/outline';
import { useRecoilValue } from 'recoil';
import { DashboardMessage } from '../../DashboardMessage';
import { SelectedMediaFolderAtom, SettingsSelector } from '../../state';
import { Messenger } from '@estruyf/vscode/dist/client';
import { ChoiceButton } from '../ChoiceButton';
import { CustomScript, ScriptType } from '../../../models';

export interface IFolderCreationProps {}

export const FolderCreation: React.FunctionComponent<IFolderCreationProps> = (props: React.PropsWithChildren<IFolderCreationProps>) => {
  const selectedFolder = useRecoilValue(SelectedMediaFolderAtom);
  const settings = useRecoilValue(SettingsSelector);

  const onFolderCreation = () => {
    Messenger.send(DashboardMessage.createMediaFolder, {
      selectedFolder
    });
  };

  const runCustomScript = (script: CustomScript) => {
    Messenger.send(DashboardMessage.runCustomScript, {script, path: selectedFolder});
  };

  const scripts = (settings?.scripts || []).filter(script => script.type === ScriptType.MediaFolder);
  if (scripts.length > 0) {
    return (
      <ChoiceButton 
        title={`Create new folder`} 
        choices={scripts.map(s => ({
          title: s.title,
          onClick: () => runCustomScript(s)
        }))} 
        onClick={onFolderCreation} 
        disabled={!settings?.initialized} />
    )
  }

  return (
    <button 
      className={`inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium text-white dark:text-vulcan-500 bg-teal-600 hover:bg-teal-700 focus:outline-none disabled:bg-gray-500`}
      title={`Create new folder`}
      onClick={onFolderCreation}>
      <FolderAddIcon className={`mr-2 h-6 w-6`} />
      <span className={``}>Create new folder</span>
    </button>
  );
};
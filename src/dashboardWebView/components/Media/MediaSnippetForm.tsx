import * as React from 'react';
import { useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { MediaInfo, Snippet } from '../../../models';
import { ViewDataSelector } from '../../state';
import SnippetForm, { SnippetFormHandle } from '../SnippetsView/SnippetForm';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { SnippetSlideOver } from './SnippetSlideOver';

export interface IMediaSnippetFormProps {
  media: MediaInfo;
  snippet: Snippet;
  mediaData: any;
  onDismiss: () => void;
  onInsert: (output: string) => void;
}

export const MediaSnippetForm: React.FunctionComponent<IMediaSnippetFormProps> = ({
  media,
  snippet,
  mediaData,
  onDismiss,
  onInsert
}: React.PropsWithChildren<IMediaSnippetFormProps>) => {
  const viewData = useRecoilValue(ViewDataSelector);
  const formRef = useRef<SnippetFormHandle>(null);

  const insertToArticle = () => {
    formRef.current?.onSave();
    onDismiss();
  };

  return (
    <SnippetSlideOver
      title={l10n.t(LocalizationKey.dashboardMediaMediaSnippetFormFormDialogTitle, media.metadata.title || media.filename)}
      description={l10n.t(LocalizationKey.dashboardMediaMediaSnippetFormFormDialogDescription, media.metadata.title || media.filename)}
      isSaveDisabled={false}
      trigger={insertToArticle}
      dismiss={onDismiss}
      okBtnText={l10n.t(LocalizationKey.commonInsert)}
      cancelBtnText={l10n.t(LocalizationKey.commonCancel)}
    >
      <SnippetForm
        ref={formRef}
        snippet={snippet}
        mediaData={mediaData}
        selection={viewData?.data?.selection}
        onInsert={onInsert}
      />
    </SnippetSlideOver>
  );
};

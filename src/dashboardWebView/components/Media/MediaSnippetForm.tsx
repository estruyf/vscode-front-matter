import * as React from 'react';
import { useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { MediaInfo, Snippet } from '../../../models';
import { ViewDataSelector } from '../../state';
import { FormDialog } from '../Modals/FormDialog';
import SnippetForm, { SnippetFormHandle } from '../SnippetsView/SnippetForm';

export interface IMediaSnippetFormProps {
  media: MediaInfo;
  snippet: Snippet;
  mediaData: any;
  onDismiss: () => void;
  onInsert: (output: string) => void;
}

export const MediaSnippetForm: React.FunctionComponent<IMediaSnippetFormProps> = ({ media, snippet, mediaData, onDismiss, onInsert }: React.PropsWithChildren<IMediaSnippetFormProps>) => {
  const viewData = useRecoilValue(ViewDataSelector);
  const formRef = useRef<SnippetFormHandle>(null);

  const insertToArticle = () => {
    formRef.current?.onSave();
    onDismiss();
  };

  return (
    <FormDialog 
      title={`Insert media: ${media.title || media.filename}`}
      description={`Insert the ${media.title || media.filename} media file into the current article`}
      isSaveDisabled={false}
      trigger={insertToArticle}
      dismiss={onDismiss}
      okBtnText='Insert'
      cancelBtnText='Cancel'>
    
      <SnippetForm
        ref={formRef}
        snippet={snippet}
        mediaData={mediaData}
        selection={viewData?.data?.selection}
        onInsert={onInsert} />

    </FormDialog>
  );
};
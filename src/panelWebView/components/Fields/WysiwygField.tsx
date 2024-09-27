import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ReactQuill = require('react-quill');
import 'react-quill/dist/quill.snow.css';

export interface IWysiwygFieldProps {
  text: string;
  onChange: (txtValue: string) => void;
}

const WysiwygField: React.FunctionComponent<IWysiwygFieldProps> = ({
  text,
  onChange
}: React.PropsWithChildren<IWysiwygFieldProps>) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  };

  return <ReactQuill modules={modules} value={text || ''} onChange={onChange} />;
};

export default WysiwygField;

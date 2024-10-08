import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ReactQuill = require('react-quill');
import 'react-quill/dist/quill.snow.css';

import { remark } from "remark";
import remarkHtml from "remark-html";

import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";

export function markdownToHtml(markdownText: string) {
  const file = remark().use(remarkHtml).processSync(markdownText);
  return String(file);
}

export function htmlToMarkdown(htmlText: string) {
  const file = remark()
    .use(rehypeParse, { emitParseErrors: true, duplicateAttribute: false })
    .use(rehypeRemark)
    .use(remarkStringify)
    .processSync(htmlText);

  return String(file);
}


export interface IWysiwygFieldProps {
  text: string;
  type: "HTML" | "Markdown";
  onChange: (txtValue: string) => void;
}

const WysiwygField: React.FunctionComponent<IWysiwygFieldProps> = ({
  text,
  type = "HTML",
  onChange
}: React.PropsWithChildren<IWysiwygFieldProps>) => {
  const [internalValue, setInternalValue] = React.useState<string | null | undefined>(type === "HTML" ? text : markdownToHtml(text));
  const [value, setValue] = React.useState<string | null | undefined>(type === "HTML" ? text : markdownToHtml(text));

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  };

  const onValueChange = React.useCallback((value: string) => {
    setValue(value);
    setInternalValue(value);
    onChange(type === "HTML" ? value : htmlToMarkdown(value));
  }, [onChange, type]);

  React.useEffect(() => {
    console.log("internalValue", internalValue === text);
    // if (internalValue !== text) {
    //   setInternalValue(text || '');
    //   setValue(type === "HTML" ? text : markdownToHtml(text));
    // }
  }, [text, internalValue, type]);

  return <ReactQuill modules={modules} value={value || ''} onChange={onValueChange} />;
};

export default WysiwygField;

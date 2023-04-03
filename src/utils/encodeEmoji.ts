export const encodeEmoji = (text: string) => {
  if (!text || !/\p{Extended_Pictographic}/u.test(text)) {
    return text;
  }

  const characters = [...text].map((el) => {
    if (/\p{Extended_Pictographic}/u.test(el)) {
      return `\\u${el.codePointAt(0)?.toString(16).toUpperCase()}`;
    }
    return el;
  });

  return characters.join('');
};

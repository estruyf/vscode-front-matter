import { useState, useEffect } from 'react';

export default function useDarkMode() {

  const setTheme = (elm: HTMLElement) => {
    if (elm) {
      const darkMode = elm.classList.contains('vscode-dark');
      document.documentElement.classList.remove(`${darkMode ? "light" : "dark"}`);
      document.documentElement.classList.add(`${darkMode ? "dark" : "light"}`);
    }
  };

  useEffect(() => {
    const mutationObserver = new MutationObserver((mutationsList, observer) => {
      const last = mutationsList.filter(item => item.type === "attributes" || item.attributeName === 'class').pop();
      setTheme(last?.target as HTMLElement);
    });

    setTheme(document.body);

    mutationObserver.observe(document.body, { childList: false, attributes: true })

    return () => {
      mutationObserver.disconnect();
    };
  }, ['']);

}
import { useCallback } from 'react';

export default function useDropdownStyle(inputRef: React.MutableRefObject<HTMLInputElement | null>, inputHeight?: string) {
  const bottomStyle = `calc(100% - ${inputHeight || '5px'})`;
  const listItemHeight = 28;

  const getDropdownStyle = useCallback((isOpen) => {
    if (isOpen && inputRef.current) {
      const wrapper = inputRef.current.closest(".collapsible__body");
      const dropdown = inputRef.current.parentElement?.parentElement?.querySelector('.field_dropdown');

      if (!wrapper || !dropdown) {
        return undefined;
      }

      const wrapperStyles = getComputedStyle(wrapper);
      const padding = parseInt(wrapperStyles.paddingTop) + parseInt(wrapperStyles.paddingBottom);
      const wrapperHeight = wrapper.clientHeight - padding;

      const dropdownElm: HTMLElement | null = inputRef.current.closest(".metadata_field");
      const hasStyles = dropdown.getAttribute("style")?.includes(bottomStyle);

      if (hasStyles) {
        return bottomStyle;
      }

      let dropdownHeight = dropdown?.clientHeight;
      if (dropdownHeight === 0) {
        const listItems = dropdown?.querySelectorAll('li');
        if (listItems && listItems.length > 0) {
          dropdownHeight = listItems.length * listItemHeight;
        }
      }

      if (!dropdownElm || !dropdownHeight) {
        return undefined;
      }

      const tagPickerTop = dropdownElm.offsetTop;

      const fullHeight = tagPickerTop + dropdownHeight;
      if (fullHeight > wrapperHeight) {
        return bottomStyle;
      }
    }

    return undefined;
  }, [inputRef]);

  return {
    getDropdownStyle
  };
}
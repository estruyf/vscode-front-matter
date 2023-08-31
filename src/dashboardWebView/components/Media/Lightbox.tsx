import { basename } from 'path';
import * as React from 'react';
import { useRecoilState } from 'recoil';
import useThemeColors from '../../hooks/useThemeColors';
import { LightboxAtom } from '../../state';

export interface ILightboxProps { }

export const Lightbox: React.FunctionComponent<ILightboxProps> = (
  _: React.PropsWithChildren<ILightboxProps>
) => {
  const [lightbox, setLightbox] = useRecoilState(LightboxAtom);
  const { getColors } = useThemeColors();

  if (!lightbox) {
    return null;
  }

  const hideLightbox = () => {
    setLightbox(null);
  };

  return (
    <div
      onClick={hideLightbox}
      className={`fixed top-0 left-0 right-0 bottom-0 w-full h-full flex flex-wrap items-center justify-center z-50 ${getColors(
        `bg-black bg-opacity-50`,
        `bg-[var(--frontmatter-lightbox-background)]`
      )
        }`}
    >
      <div className={`w-full h-full flex flex-wrap items-center justify-center`}>
        <img
          src={lightbox}
          alt={basename(lightbox)}
          className={`w-1/2 h-auto rounded border shadow-2xl border-[var(--frontmatter-border)] bg-[var(--vscode-sideBar-background)]`}
        />
      </div>
    </div>
  );
};

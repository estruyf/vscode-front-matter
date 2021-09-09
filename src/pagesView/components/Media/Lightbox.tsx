import { basename } from 'path';
import * as React from 'react';
import { useRecoilState } from 'recoil';
import { LightboxAtom } from '../../state';

export interface ILightboxProps {}

export const Lightbox: React.FunctionComponent<ILightboxProps> = (props: React.PropsWithChildren<ILightboxProps>) => {
  const [ lightbox, setLightbox ] = useRecoilState(LightboxAtom);
  
  if (!lightbox) {
    return null;
  }

  const hideLightbox = () => {
    setLightbox(null);
  };

  return (
    <div onClick={hideLightbox} className={`fixed top-0 left-0 right-0 bottom-0 w-full h-full flex flex-wrap items-center justify-center bg-white bg-opacity-50 z-50`}>
      <div className={`w-full h-full flex flex-wrap items-center justify-center`}>
        <img src={lightbox} alt={basename(lightbox)} className={`w-1/2 h-auto rounded-lg border border-vulcan-500 shadow-2xl`} />
      </div>
    </div>
  );
};
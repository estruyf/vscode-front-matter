import * as React from 'react';

export interface IMergeIconProps {
  className: string;
}

export const MergeIcon: React.FunctionComponent<IMergeIconProps> = ({
  className
}: React.PropsWithChildren<IMergeIconProps>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M7.586 8.00366L4 8.00366C3.44772 8.00366 3 7.55595 3 7.00366C3 6.45138 3.44772 6.00366 4 6.00366L8 6.00366C8.26509 6.00366 8.51933 6.10892 8.70685 6.2963L13.414 11H18.5845L15.2931 7.71103C14.9025 7.32065 14.9023 6.68748 15.2926 6.29681C15.683 5.90615 16.3162 5.90592 16.7068 6.2963L21.7068 11.2926C21.8945 11.4802 22 11.7346 22 11.9998C22 12.2651 21.8947 12.5195 21.7071 12.7071L16.7071 17.7071C16.3166 18.0976 15.6834 18.0976 15.2929 17.7071C14.9024 17.3166 14.9024 16.6834 15.2929 16.2929L18.5858 13H13.4142L8.70711 17.7071C8.51957 17.8947 8.26522 18 8 18H4C3.44772 18 3 17.5523 3 17C3 16.4477 3.44772 16 4 16H7.58579L11.5855 12.0003L7.586 8.00366Z"
        fill="currentcolor"
      />
    </svg>
  );
};

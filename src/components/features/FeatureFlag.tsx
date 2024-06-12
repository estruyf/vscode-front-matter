import * as React from 'react';

export interface IFeatureFlagProps {
  flag: string;
  features: string[] | null;
  alternative?: JSX.Element;
}

export const FeatureFlag: React.FunctionComponent<IFeatureFlagProps> = ({
  flag,
  features,
  alternative,
  children
}: React.PropsWithChildren<IFeatureFlagProps>) => {
  if (!features || features.length === 0 || (features.length > 0 && !features.includes(flag))) {
    if (alternative) {
      return alternative;
    }

    return null;
  }

  return <>{children}</>;
};

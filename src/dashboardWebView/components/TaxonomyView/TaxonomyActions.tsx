import { Messenger } from '@estruyf/vscode/dist/client';
import {
  ArrowUpCircleIcon,
  PencilIcon,
  PlusIcon,
  SquaresPlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import * as React from 'react';
import { useCallback } from 'react';
import { MergeIcon } from '../../../components/icons/MergeIcon';
import { DashboardMessage } from '../../DashboardMessage';
import { LinkButton } from '../Common/LinkButton';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface ITaxonomyActionsProps {
  field: string | null;
  value: string;
  unmapped?: boolean;
  onContentTagging: (value: string) => void;
}

export const TaxonomyActions: React.FunctionComponent<ITaxonomyActionsProps> = ({
  field,
  value,
  unmapped,
  onContentTagging
}: React.PropsWithChildren<ITaxonomyActionsProps>) => {
  const onEdit = useCallback(() => {
    Messenger.send(DashboardMessage.editTaxonomy, {
      type: field,
      value
    });
  }, [field, value]);

  const onAdd = useCallback(() => {
    Messenger.send(DashboardMessage.addToTaxonomy, {
      type: field,
      value
    });
  }, [field, value]);

  const onMerge = useCallback(() => {
    Messenger.send(DashboardMessage.mergeTaxonomy, {
      type: field,
      value
    });
  }, [field, value]);

  const onMove = useCallback(() => {
    Messenger.send(DashboardMessage.moveTaxonomy, {
      type: field,
      value
    });
  }, [field, value]);

  const onDelete = useCallback(() => {
    Messenger.send(DashboardMessage.deleteTaxonomy, {
      type: field,
      value
    });
  }, [field, value]);

  const onTagging = useCallback(() => {
    onContentTagging(value);
  }, [value]);

  return (
    <>
      <div className={`space-x-2`}>
        {unmapped && (
          <LinkButton
            title={l10n.t(LocalizationKey.dashboardTaxonomyViewButtonAddTitle, value)}
            onClick={onAdd}>
            <PlusIcon className={`w-4 h-4`} aria-hidden={true} />
            <span className="sr-only">
              {l10n.t(LocalizationKey.dashboardTaxonomyViewButtonAddTitle, value)}
            </span>
          </LinkButton>
        )}

        <LinkButton
          title={`Tag content`}
          onClick={onTagging}>
          <SquaresPlusIcon className={`w-4 h-4`} aria-hidden={true} />
          <span className="sr-only">{l10n.t(LocalizationKey.commonEdit)}</span>
        </LinkButton>

        <LinkButton
          title={l10n.t(LocalizationKey.dashboardTaxonomyViewButtonEditTitle, value)}
          onClick={onEdit}>
          <PencilIcon className={`w-4 h-4`} aria-hidden={true} />
          <span className="sr-only">{l10n.t(LocalizationKey.commonEdit)}</span>
        </LinkButton>

        <LinkButton
          title={l10n.t(LocalizationKey.dashboardTaxonomyViewButtonMergeTitle, value)}
          onClick={onMerge}>
          <MergeIcon className={`w-4 h-4`} aria-hidden={true} />
          <span className="sr-only">
            {l10n.t(LocalizationKey.dashboardTaxonomyViewButtonMergeTitle, value)}
          </span>
        </LinkButton>

        <LinkButton
          title={l10n.t(LocalizationKey.dashboardTaxonomyViewButtonMoveTitle)}
          onClick={onMove}>
          <ArrowUpCircleIcon className={`w-4 h-4`} aria-hidden={true} />
          <span className="sr-only">
            {l10n.t(LocalizationKey.dashboardTaxonomyViewButtonMoveTitle)}
          </span>
        </LinkButton>

        <LinkButton
          title={l10n.t(LocalizationKey.dashboardTaxonomyViewButtonDeleteTitle, value)}
          onClick={onDelete}>
          <TrashIcon className={`w-4 h-4`} aria-hidden={true} />
          <span className="sr-only">
            {l10n.t(LocalizationKey.dashboardTaxonomyViewButtonDeleteTitle, value)}
          </span>
        </LinkButton>
      </div>
    </>
  );
};

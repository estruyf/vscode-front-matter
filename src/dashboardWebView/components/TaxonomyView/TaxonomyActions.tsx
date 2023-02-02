import { Messenger } from '@estruyf/vscode/dist/client';
import {
  ArrowCircleUpIcon,
  ArrowUpIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback } from 'react';
import { MergeIcon } from '../../../components/icons/MergeIcon';
import { DashboardMessage } from '../../DashboardMessage';

export interface ITaxonomyActionsProps {
  field: string | null;
  value: string;
  unmapped?: boolean;
}

export const TaxonomyActions: React.FunctionComponent<ITaxonomyActionsProps> = ({
  field,
  value,
  unmapped
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

  return (
    <div className={`space-x-2`}>
      {unmapped && (
        <button
          className="text-gray-500 hover:text-vulcan-600 dark:text-gray-400 dark:hover:text-whisper-600"
          type={`button`}
          title={`Add ${value} to taxonomy settings`}
          onClick={onAdd}
        >
          <PlusIcon className={`w-4 h-4`} aria-hidden={true} />
          <span className="sr-only">Add to settings</span>
        </button>
      )}

      <button
        className="text-gray-500 hover:text-vulcan-600 dark:text-gray-400 dark:hover:text-whisper-600"
        type={`button`}
        title={`Edit ${value}`}
        onClick={onEdit}
      >
        <PencilIcon className={`w-4 h-4`} aria-hidden={true} />
        <span className="sr-only">Edit</span>
      </button>

      <button
        className="text-gray-500 hover:text-vulcan-600 dark:text-gray-400 dark:hover:text-whisper-600"
        type={`button`}
        title={`Merge ${value}`}
        onClick={onMerge}
      >
        <MergeIcon className={`w-4 h-4`} aria-hidden={true} />
        <span className="sr-only">Merge</span>
      </button>

      <button
        className="text-gray-500 hover:text-vulcan-600 dark:text-gray-400 dark:hover:text-whisper-600"
        type={`button`}
        title={`Move to another taxonomy type`}
        onClick={onMove}
      >
        <ArrowCircleUpIcon className={`w-4 h-4`} aria-hidden={true} />
        <span className="sr-only">Move to another taxonomy type</span>
      </button>

      <button
        className="text-gray-500 hover:text-vulcan-600 dark:text-gray-400 dark:hover:text-whisper-600"
        type={`button`}
        title={`Delete ${value}`}
        onClick={onDelete}
      >
        <TrashIcon className={`w-4 h-4`} aria-hidden={true} />
        <span className="sr-only">Delete</span>
      </button>
    </div>
  );
};

import * as React from 'react';
import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { Settings } from '../../models/Settings';
import { Status } from '../../models/Status';
import { Step } from './Step';
import { useMemo, useState } from 'react';
import { MenuItem } from '../Menu';
import { Framework, StaticFolder, Template } from '../../../models';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { FrameworkDetectors } from '../../../constants/FrameworkDetectors';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { SelectItem } from './SelectItem';
import { GeneralCommands, SETTING_GIT_ENABLED, Templates } from '../../../constants';
import { TemplateItem } from './TemplateItem';
import { Spinner } from '../Common/Spinner';
import { AstroContentTypes } from '../Configuration/Astro/AstroContentTypes';
import { ContentFolders } from '../Configuration/Common/ContentFolders';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from '../../../components/shadcn/Dropdown';

export interface IStepsToGetStartedProps {
  settings: Settings;
}

export const StepsToGetStarted: React.FunctionComponent<IStepsToGetStartedProps> = ({
  settings
}: React.PropsWithChildren<IStepsToGetStartedProps>) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [framework, setFramework] = useState<string | null>(null);
  const [taxImported, setTaxImported] = useState<boolean>(false);
  const [isGitEnabled, setIsGitEnabled] = useState<boolean>(false);
  const [isGitRepo, setIsGitRepo] = useState<boolean>(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [astroCollectionsStatus, setAstroCollectionsStatus] = useState<Status>(Status.Optional);

  const frameworks: Framework[] = FrameworkDetectors.map((detector: any) => detector.framework);

  const setFrameworkAndSendMessage = (framework: string) => {
    setFramework(framework);
    Messenger.send(DashboardMessage.setFramework, framework);
  };

  const addAssetFolder = (folder: string | StaticFolder) => {
    Messenger.send(DashboardMessage.addAssetsFolder, folder);
  }

  const triggerTemplate = (template: Template) => {
    setLoading(true);
    messageHandler.request<boolean>(DashboardMessage.triggerTemplate, template).then((result) => {
      setLoading(false);
      if (result) {
        reload();
      }
    });
  }

  const showNotification = () => {
    Messenger.send(DashboardMessage.openConfig);
  };

  const reload = () => {
    const crntState: any = Messenger.getState() || {};

    Messenger.setState({
      ...crntState,
      isWelcomeConfiguring: false
    });

    Messenger.send(DashboardMessage.reload);
  };

  const importTaxonomy = () => {
    Messenger.send(DashboardMessage.importTaxonomy);
    setTaxImported(true);
  };

  const updateSetting = (name: string, value: any) => {
    setIsGitEnabled(value);
    Messenger.send(DashboardMessage.updateSetting, {
      name,
      value,
      global: true
    });
  }

  const crntTemplates = useMemo(() => {
    if (!templates || templates.length === 0 || !settings.crntFramework) {
      return [];
    }

    return templates.filter((t) => t.type === settings.crntFramework);
  }, [templates, settings.crntFramework])

  const steps = useMemo(() => (
    [
      {
        id: `welcome-init`,
        name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedInitializeProjectName),
        description: <>{l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedInitializeProjectDescription)}</>,
        show: true,
        status: settings.initialized ? Status.Completed : Status.NotStarted,
        onClick: settings.initialized
          ? undefined
          : () => {
            Messenger.send(DashboardMessage.initializeProject);
          }
      },
      {
        id: `welcome-framework`,
        name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedFrameworkName),
        description: (
          <div>
            <div>
              {l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedFrameworkDescription)}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className='mt-4 group flex justify-center p-2 rounded-md border text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)] focus:outline-none'>
                <span className="">{framework ? framework : l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedFrameworkSelect)}</span>
                <ChevronDownIcon className="-mr-1 ml-1 w-4 h-4" aria-hidden="true" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align='start'>
                <MenuItem
                  title={l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedFrameworkSelectOther)}
                  value={`other`}
                  isCurrent={!framework}
                  onClick={(value: string) => setFrameworkAndSendMessage(value)}
                />

                <DropdownMenuSeparator />

                {frameworks.map((f) => (
                  <MenuItem
                    key={f.name}
                    title={f.name}
                    value={f.name}
                    isCurrent={f.name === framework}
                    onClick={(value: string) => setFrameworkAndSendMessage(value)}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        show: true,
        status: settings.crntFramework ? Status.Completed : Status.NotStarted,
        onClick: undefined
      },
      {
        id: `welcome-template`,
        name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedTemplateName),
        description: (
          <div className=''>
            <div className="text-sm">{l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedTemplateDescription)}</div>
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 w-full">
              {
                crntTemplates && (crntTemplates || []).map(template => (
                  <TemplateItem
                    key={template.name.toLowerCase().replace(/ /g, '-')}
                    title={template.name}
                    author={template.author}
                    version={template.version}
                    description={template.description}
                    buttonTitle={template.name}
                    onClick={() => triggerTemplate(template)} />
                ))
              }
            </div>

            <p className='mt-4 text-[var(--vscode-editorWarning-foreground)]'>
              <b>{l10n.t(LocalizationKey.commonImportant)}</b>: {l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedTemplateWarning)}</p>
          </div>
        ),
        show: (crntTemplates || []).length > 0,
        status: Status.Optional,
      },
      {
        id: `astro-content-types`,
        name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedAstroContentTypesName),
        description: (
          <AstroContentTypes
            settings={settings}
            triggerLoading={(isLoading) => setLoading(isLoading)}
            setStatus={(status) => setAstroCollectionsStatus(status)} />
        ),
        show: settings.crntFramework === 'astro',
        status: astroCollectionsStatus
      },
      {
        id: `welcome-content-folders`,
        name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedContentFoldersName),
        description: (
          <ContentFolders
            settings={settings}
            triggerLoading={(isLoading) => setLoading(isLoading)} />
        ),
        show: true,
        status:
          settings.contentFolders && settings.contentFolders.length > 0
            ? Status.Completed
            : Status.NotStarted
      },
      {
        id: `welcome-assets`,
        name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedAssetsFolderName),
        description: (
          <div className='mt-1'>
            <div className="text-sm">{l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedAssetsFolderDescription)}</div>
            <div className="mt-1 space-y-1">
              <SelectItem
                title={l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedAssetsFolderPublicTitle)}
                buttonTitle={l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedAssetsFolderPublicTitle)}
                isSelected={settings.staticFolder === "public"}
                onClick={() => addAssetFolder(`public`)} />

              <SelectItem
                title={l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedAssetsFolderAssetsTitle)}
                buttonTitle={l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedAssetsFolderAssetsTitle)}
                isSelected={settings.staticFolder === "src/assets"}
                onClick={() => addAssetFolder({
                  "path": "src/assets",
                  "relative": true
                })} />

              <p className='text-sm'>
                <b>{l10n.t(LocalizationKey.commonInformation)}</b>: {l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedAssetsFolderOtherDescription)}</p>
            </div>
          </div>
        ),
        show: settings.crntFramework === 'astro' || framework === 'astro',
        status: settings.initialized && settings.staticFolder && settings.staticFolder !== "/" ? Status.Completed : Status.NotStarted,
      },
      {
        id: `welcome-git`,
        name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedGitName),
        description: (
          <div className='mt-1'>
            <VSCodeCheckbox
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting(SETTING_GIT_ENABLED, e.target.checked)}
              checked={isGitEnabled}>
              {l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedGitDescription)}
            </VSCodeCheckbox>
          </div>
        ),
        show: isGitRepo,
        status: settings.git?.actions ? Status.Completed : Status.NotStarted
      },
      {
        id: `welcome-import`,
        name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedTagsName),
        description: <>{l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedTagsDescription)}</>,
        show: true,
        status: taxImported ? Status.Completed : Status.NotStarted,
        onClick:
          settings.contentFolders && settings.contentFolders.length > 0 ? importTaxonomy : undefined
      },
      {
        id: `welcome-show-dashboard`,
        name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedShowDashboardName),
        description: <>{l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedShowDashboardDescription)}</>,
        show: true,
        status:
          settings.initialized && settings.contentFolders && settings.contentFolders.length > 0
            ? Status.Active
            : Status.NotStarted,
        onClick:
          settings.initialized && settings.contentFolders && settings.contentFolders.length > 0
            ? () => {
              showNotification();
              reload();
            }
            : undefined
      }
    ]
  ), [settings, framework, taxImported, templates, astroCollectionsStatus, isGitRepo]);

  React.useEffect(() => {
    if (settings.crntFramework || settings.framework?.name) {
      setFramework(settings.crntFramework || settings.framework?.name || null);
    }
  }, [settings.crntFramework, settings.framework]);

  React.useEffect(() => {
    messageHandler.request<boolean>(GeneralCommands.toVSCode.git.isRepo).then((result) => {
      setIsGitRepo(result);
    });

    setIsGitEnabled(settings.git?.actions || false);
  }, [settings.git?.actions]);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch(Templates.url);

        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        }
      } catch (e) {
        setTemplates([]);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <nav aria-label="Progress">
      {
        loading && (
          <Spinner />
        )
      }
      <ol role="list">
        {steps.map((step, stepIdx) => (
          step.show && (
            <li
              key={step.id}
              className={`${stepIdx !== steps.length - 1 ? 'pb-10' : ''} relative`}
              data-test={step.id}
            >
              <Step
                name={step.name}
                description={step.description}
                status={step.status}
                showLine={stepIdx !== steps.length - 1}
                onClick={step.onClick}
              />
            </li>
          )
        ))}
      </ol>
    </nav>
  );
};

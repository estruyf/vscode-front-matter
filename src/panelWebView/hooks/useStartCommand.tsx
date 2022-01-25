import { useState, useEffect } from 'react';
import { FrameworkDetectors } from '../../constants/FrameworkDetectors';
import { PanelSettings } from '../../models';

export default function useStartCommand(settings?: PanelSettings) {
  const [startCommand, setStartCommand] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.commands?.start) {
      setStartCommand(settings?.commands?.start);
      return;
    }

    let command: string = '';
    if (settings?.framework) {
      const framework = FrameworkDetectors.find(f => f.framework.name === settings.framework);
      if (framework?.commands?.start) {
        command = framework.commands.start;
      }
    }

    setStartCommand(command);
  }, [settings?.framework, settings?.commands?.start]);

  return {
    startCommand
  };
}
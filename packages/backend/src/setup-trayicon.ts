import SysTray from 'systray';
import pkg from '../package.json';

import icon from './icon';

type TrayIconOptions = {
  onOpenDashboard: () => void;
  onRestart: () => void;
  onPause: () => void;
  onResume: () => void;
  onExit: () => void;
};

export function setupTrayIcon(props: TrayIconOptions) {
  const tray = new SysTray({
    menu: {
      icon,
      title: pkg.name,
      tooltip: pkg.name,
      items: [
        {
          title: 'Open dashboard',
          tooltip: 'Open dashboard',
          checked: false,
          enabled: true,
        },
        {
          title: 'Restart failed tasks',
          tooltip: 'Restart failed tasks',
          checked: false,
          enabled: true,
        },
        {
          title: 'Pause scheduler',
          tooltip: 'Pause scheduler',
          checked: false,
          enabled: true,
        },
        {
          title: 'Resume scheduler',
          tooltip: 'Resume scheduler',
          checked: false,
          enabled: true,
        },
        {
          title: 'Exit',
          tooltip: 'Exit',
          checked: false,
          enabled: true,
        },
      ],
    },
    debug: false,
    //copyDir: true,
  });

  tray.onClick((action) => {
    switch (action.seq_id) {
      case 0:
        props.onOpenDashboard();
        break;
      case 1:
        props.onRestart();
        break;
      case 2:
        props.onPause();
        break;
      case 3:
        props.onResume();
        break;
      case 4:
        tray.kill();
        props.onExit();
        break;
    }
  });

  return tray;
}

import { NotificationProvider } from '../ui/NotificationContext';
import { PadelBotApp } from './PadelBotApp';
import { PrivateLayout } from './PrivateLayout';

export function PadelBotWrapper() {
  return (
    <NotificationProvider>
      <PrivateLayout currentPath="/private/padel-bot">
        <PadelBotApp />
      </PrivateLayout>
    </NotificationProvider>
  );
}

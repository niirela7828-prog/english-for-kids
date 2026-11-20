import { useStore } from './lib/store';
import { NavProvider, useNav } from './lib/nav';
import { ConfettiLayer } from './components/Confetti';
import { Welcome } from './screens/Welcome';
import { MapScreen } from './screens/MapScreen';
import { StageScreen } from './screens/StageScreen';
import { UnitScreen } from './screens/UnitScreen';
import { LearnScreen } from './screens/LearnScreen';
import { GamePlay } from './screens/GamePlay';
import { DailyLesson } from './screens/DailyLesson';
import { Album } from './screens/Album';
import { BadgesScreen } from './screens/BadgesScreen';
import { Parents } from './screens/Parents';
import { getUnit } from './lib/curriculum';

function Screens() {
  const { screen, back } = useNav();
  switch (screen.name) {
    case 'map':
      return <MapScreen />;
    case 'stage':
      return <StageScreen stageId={screen.stageId} />;
    case 'unit':
      return <UnitScreen unitId={screen.unitId} />;
    case 'learn':
      return <LearnScreen unitId={screen.unitId} onDone={back} />;
    case 'game': {
      const u = getUnit(screen.unitId);
      return <GamePlay key={`${screen.unitId}-${screen.game}`} game={screen.game} pool={u.items} unitId={u.id} onContinue={back} />;
    }
    case 'daily':
      return <DailyLesson />;
    case 'album':
      return <Album />;
    case 'badges':
      return <BadgesScreen />;
    case 'parents':
      return <Parents />;
  }
}

export default function App() {
  const { profile } = useStore();
  return (
    <>
      {profile ? (
        <NavProvider>
          <Screens />
        </NavProvider>
      ) : (
        <Welcome />
      )}
      <ConfettiLayer />
    </>
  );
}

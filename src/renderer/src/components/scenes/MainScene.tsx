import { GLOBAL_ICON_SCALE } from "../../App";
import NoticeContainer from "../notice/NoticeContainer";
import QueueView from "../queue/QueueView";
import SettingsView from "../settings/SettingsView";
import SongDetail from "../song/SongDetail";
import SongView from "../song/SongView";
import { faGear, faHeadphonesSimple, faListUl, faMusic } from "@fortawesome/free-solid-svg-icons";
import Fa from "solid-fa";
import { createEffect, createSignal, onMount } from "solid-js";

const [active, setActive] = createSignal(0);

export { active };
export const ACTIVE_ALL_SONGS = 0;
export const ACTIVE_QUEUE = 1;
export const ACTIVE_PLAYLISTS = 2;
export const ACTIVE_SETTINGS = 3;

export default function MainScene() {
  let sidePane;

  onMount(() => {
    createEffect(() => {
      sidePane.children[active()]?.scrollIntoView();
    });
  });

  return (
    <div id="main" class="scene">
      <nav>
        <button class="icon hint" onClick={() => setActive(0)} title={"All songs"}>
          <Fa icon={faMusic} scale={GLOBAL_ICON_SCALE} />
        </button>
        <button class="icon hint" onClick={() => setActive(1)} title={"Current queue"}>
          <Fa icon={faHeadphonesSimple} scale={GLOBAL_ICON_SCALE} />
        </button>
        <button class="icon hint" onClick={() => setActive(2)} title={"Playlists"}>
          <Fa icon={faListUl} scale={GLOBAL_ICON_SCALE} />
        </button>
        <button class="icon hint" onClick={() => setActive(3)} title={"Settings"}>
          <Fa icon={faGear} scale={GLOBAL_ICON_SCALE} />
        </button>
      </nav>

      <div class="side-pane" ref={sidePane}>
        <SongView isAllSongs={true} />
        <QueueView />
        <div>Playlists</div>
        <SettingsView />
      </div>

      <main class="center">
        <SongDetail />
      </main>

      <NoticeContainer />
    </div>
  );
}

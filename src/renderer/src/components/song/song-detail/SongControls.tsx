import { Component, createEffect, createSignal, Match, Show, Switch } from "solid-js";
import {
  isPlaying,
  next,
  previous,
  togglePlay,
  localVolume,
  setLocalVolume,
  song,
} from "../../../components/song/song.utils";
import { isSongUndefined } from "../../../lib/song";
import Bar from "../../bar/Bar";
import IconButton from "@renderer/components/icon-button/IconButton";

type SongControlsProps = {};

const SongControls: Component<SongControlsProps> = () => {
  const [disable, setDisable] = createSignal(isSongUndefined(song()));
  const [playHint, setPlayHint] = createSignal("");

  createEffect(() => {
    const disabled = disable();

    if (disabled) {
      setPlayHint("");
      return;
    }

    setPlayHint(isPlaying() ? "Pause" : "Play");
  });

  createEffect(() => setDisable(isSongUndefined(song())));

  return (
    <div class="song-controls">
      {/* Left part */}
      <div class="song-controls__left-part">
        <IconButton>
          <Switch>
            <Match when={localVolume() === 0}>
              <i class="ri-volume-mute-fill" />
            </Match>
            <Match when={localVolume() < 0.5}>
              <i class="ri-volume-down-fill" />
            </Match>
            <Match when={localVolume() >= 0.5}>
              <i class="ri-volume-up-fill" />
            </Match>
          </Switch>
        </IconButton>
        <div class="song-controls__volume-bar">
          <Bar fill={localVolume()} setFill={setLocalVolume} />
        </div>
      </div>

      {/* Middle */}
      <div class="song-controls__middle">
        <IconButton
          onClick={() => window.api.request("queue::shuffle")}
          disabled={disable()}
          title="Shuffle"
        >
          <i class="ri-shuffle-fill" />
        </IconButton>
        <IconButton onClick={() => previous()} disabled={disable()} title="Play previous">
          <i class="ri-skip-back-mini-fill" />
        </IconButton>

        <button
          class="song-controls__toggle-play"
          onClick={() => togglePlay()}
          disabled={disable()}
          title={playHint()}
        >
          <Show when={!isPlaying()} fallback={<i class="ri-pause-fill" />}>
            <i class="ri-play-fill" />
          </Show>
        </button>

        <IconButton onClick={() => next()} disabled={disable()} title="Play next">
          <i class="ri-skip-forward-mini-fill"></i>
        </IconButton>

        <IconButton
          onClick={() => {
            // TODO - implement repeat
          }}
          disabled={disable()}
          title="Repeat"
        >
          <i class="ri-repeat-2-fill" />
        </IconButton>
      </div>

      {/* Right part */}
      <div class="song-controls__right-part">
        <IconButton>
          <i class="ri-add-fill" />
        </IconButton>
      </div>
    </div>
  );
};

export default SongControls;

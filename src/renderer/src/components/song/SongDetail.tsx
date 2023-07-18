import { Component, createEffect, createSignal, Match, onMount, Show, Switch } from 'solid-js';
import Bar from '../Bar';
import defaultBackground from "../../assets/osu-default-background.jpg";
import {
  duration,
  isPlaying,
  localVolume,
  next,
  previous, seek,
  setLocalVolume, setVolume,
  song,
  timestamp,
  togglePlay,
  volume
} from '../../lib/Music';
import { getResourcePath } from '../../lib/tungsten/resource';
import Fa from 'solid-fa';
import {
  faBackwardStep,
  faForwardStep,
  faGlobe,
  faLocationDot,
  faPause,
  faPlay,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark
} from '@fortawesome/free-solid-svg-icons';
import { globalIconScale } from '../../App';



type SongDetailProps = {}



const SongDetail: Component<SongDetailProps> = (_props) => {
  const [src, setSrc] = createSignal(defaultBackground);
  let image;

  createEffect(async () => {
    const s = song();

    if (s === undefined) {
      return;
    }

    setSrc(await getResourcePath(s.bg));
  });

  onMount(() => {
    image.addEventListener("error", () => {
      image.src = defaultBackground;
    });
  });

  return (
    <div class="container">
      <div class="song">
        <img ref={image} src={src()} alt="art"/>
        <h3>{song()?.title ?? "Title"}</h3>
        <span>{song()?.artist ?? "Artist"}</span>
      </div>

      <div class="seeker">
        <Bar
          fill={timestamp() / (duration() !== 0 ? duration() : 1)}
          setFill={seek}
        />
        <div class="time">
          <span class="currently">{timestamp()}</span><span class="duration">{duration()}</span>
        </div>
      </div>

      <div class="controls">
        <div class="wrapper">
          <button class="icon" onClick={() => togglePlay()}>
            <Show when={!isPlaying()} fallback={<Fa icon={faPause} scale={globalIconScale}/>}>
              <Fa icon={faPlay} scale={globalIconScale}/>
            </Show>
          </button>
          <button class="icon" onClick={() => previous()}>
            <Fa icon={faBackwardStep} scale={globalIconScale}/>
          </button>
          <button class="icon" onClick={() => next()}>
            <Fa icon={faForwardStep} scale={globalIconScale}/>
          </button>
          <div class="dropdown">
            <button class="icon">
              <Switch>
                <Match when={volume() === 0}>
                  <Fa icon={faVolumeXmark} scale={globalIconScale}/>
                </Match>
                <Match when={volume() < 0.5}>
                  <Fa icon={faVolumeLow} scale={globalIconScale}/>
                </Match>
                <Match when={volume() >= 0.5}>
                  <Fa icon={faVolumeHigh} scale={globalIconScale}/>
                </Match>
              </Switch>
            </button>
            <div class="menu">
              <div class="menu-wrapper">
                <div class="selectors local" title={"Sets volume on current song"}>
                  <Fa icon={faLocationDot} scale={globalIconScale}/>
                  <Bar fill={localVolume()} alignment="vertical" setFill={setLocalVolume}/>
                </div>

                <div class="selectors global" title={"Sets across the whole application"}>
                  <Fa icon={faGlobe} scale={globalIconScale}/>
                  <Bar fill={volume()} alignment="vertical" setFill={setVolume}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default SongDetail;
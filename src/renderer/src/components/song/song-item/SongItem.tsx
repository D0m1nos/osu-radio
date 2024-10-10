import { Component, createSignal, onMount } from "solid-js";
import { ResourceID, Song } from "../../../../../@types";
import { ignoreClickInContextMenu } from "../context-menu/SongContextMenu";
import draggable from "../../../lib/draggable/draggable";
import { song as selectedSong } from "../../../components/song/song.utils";
import SongHint from "../SongHint";
import SongImage from "../SongImage";
import "./styles.css";

type SongItemProps = {
  song: Song;
  group: string;
  selectable?: true;
  onSelect: (songResource: ResourceID) => any;
  draggable?: true;
  onDrop?: (before: Element | null) => any;
  children?: any;
};
const SongItem: Component<SongItemProps> = ({
  group,
  onSelect,
  song,
  children,
  draggable: isDraggable,
  onDrop,
  selectable,
}) => {
  const showSignal = createSignal(false);
  const [_coords, setCoords] = createSignal<[number, number]>([0, 0], { equals: false });
  let item;

  const showMenu = (evt: MouseEvent) => {
    if (children === undefined) {
      showSignal[1](false);
      return;
    }

    setCoords([evt.clientX, evt.clientY]);
    showSignal[1](true);
  };

  onMount(() => {
    draggable(item, {
      onClick: ignoreClickInContextMenu(() => onSelect(song.path)),
      onDrop: onDrop ?? (() => {}),
      createHint: SongHint,
      useOnlyAsOnClickBinder: !isDraggable || selectedSong().path === song.path,
    });

    if (selectable === true) {
      (item as HTMLElement).dataset.path = song.path;
    }
  });

  return (
    <div
      class="song-item"
      data-active={selectedSong().path === song.path}
      ref={item}
      data-url={song.bg}
      onContextMenu={showMenu}
    >
      <SongImage class="song-item__image" src={song.bg} group={group} />

      <div class="song-item__container">
        <h3 class="song-item__title">{song.title}</h3>
        <p class="song-item__artist">{song.artist}</p>
      </div>
    </div>
  );
};

export default SongItem;

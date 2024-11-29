import SongImage from "../../SongImage";
import DropdownList from "@renderer/components/dropdown-list/DropdownList";
import {
  addToPlaylist,
  deleteSongFromPlaylist,
  setPlaylistActivePage,
} from "@renderer/components/playlist/playlist.utils";
import { setSidebarActiveTab } from "@renderer/scenes/main-scene/main.utils";
import { SIDEBAR_PAGES } from "@renderer/scenes/main-scene/main.utils";
import { CheckSquare, PlusIcon, Square } from "lucide-solid";
import { Component, For, Show } from "solid-js";
import { PlaylistDropdown, Song } from "src/@types";

type PlaylistChooserProps = {
  song: Song;
  playlists: PlaylistDropdown[];
  onCreatePlaylistClick?: () => void;
};

const PlaylistChooser: Component<PlaylistChooserProps> = (props) => {
  return (
    <div class="flex flex-col gap-1">
      <DropdownList.Item
        onClick={() => {
          setSidebarActiveTab(SIDEBAR_PAGES.PLAYLISTS.value);
          setPlaylistActivePage({ name: "new" });
          props.onCreatePlaylistClick?.();
        }}
        class="hover:bg-surface"
      >
        <span>Create Playlist</span>
        <PlusIcon size={16} />
      </DropdownList.Item>
      <div class="h-[1px] w-full bg-surface" />

      <For
        fallback={<DropdownList.Item disabled={true}>No playlists...</DropdownList.Item>}
        each={props.playlists}
      >
        {(playlist) => <PlayListChooserItem song={props.song} playlist={playlist} />}
      </For>
    </div>
  );
};

type PlayListChooserItemProps = {
  song: Song;
  playlist: PlaylistDropdown;
};

const PlayListChooserItem: Component<PlayListChooserItemProps> = (props) => {
  return (
    <DropdownList.Item
      class="gap-3"
      onClick={() => {
        if (props.playlist.isOnSong) {
          deleteSongFromPlaylist(props.playlist.name, props.song);
        } else {
          addToPlaylist(props.playlist.name, props.song);
        }
      }}
    >
      <div class="flex items-center gap-2">
        <SongImage
          class="size-7 flex-shrink-0 rounded bg-cover"
          src={props.playlist.image}
          instantLoad
        />
        <span>{props.playlist.name}</span>
      </div>
      <Show when={props.playlist.isOnSong} fallback={<Square class="flex-shrink-0" size={16} />}>
        <CheckSquare class="flex-shrink-0" size={16} />
      </Show>
    </DropdownList.Item>
  );
};

export default PlaylistChooser;

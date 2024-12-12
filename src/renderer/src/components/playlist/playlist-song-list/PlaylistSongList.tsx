import InfiniteScroller from "../../InfiniteScroller";
import SongItem from "../../song/song-item/SongItem";
import { deleteSongFromPlaylist, setPlaylistActivePage } from "../playlist.utils";
import { namespace } from "@renderer/App";
import Button from "@renderer/components/button/Button";
import DropdownList from "@renderer/components/dropdown-list/DropdownList";
import Impulse from "@renderer/lib/Impulse";
import { ArrowLeftIcon, DeleteIcon, PencilIcon } from "lucide-solid";
import { Component, createSignal, onCleanup, onMount } from "solid-js";
import { Playlist, PlaylistSongsQueryPayload, ResourceID, Song } from "src/@types";

type PlaylistSongListProps = {
  playlist: Playlist;
};

const PlaylistSongList: Component<PlaylistSongListProps> = (props) => {
  const group = namespace.create(true);

  const [payload] = createSignal<PlaylistSongsQueryPayload>({
    playlistName: props.playlist.name,
  });

  const [, setIsQueueExist] = createSignal(false);

  const reset = new Impulse();

  onMount(async () => {
    window.api.listen("playlist::resetSongList", reset.pulse.bind(reset));
    setIsQueueExist(await window.api.request("queue::exists"));

    onCleanup(() => {
      window.api.removeListener("playlist::resetSongList", reset.pulse.bind(reset));
    });
  });

  const createQueue = async (songResource: ResourceID) => {
    await window.api.request("queue::create", {
      startSong: songResource,
      order: { direction: "asc", option: "none" },
      tags: [],
      view: { playlist: props.playlist.name },
    });
    setIsQueueExist(true);
  };

  return (
    <div class="flex h-full flex-col">
      <div class="sticky top-0 z-10 mx-5 mb-4 mt-1 flex flex-row items-center">
        <div class="flex w-full flex-row items-center gap-2.5 font-medium">
          <Button
            variant="ghost"
            size="square"
            onClick={() => setPlaylistActivePage({ name: "list" })}
          >
            <ArrowLeftIcon class="text-subtext" size={20} />
          </Button>
          <h3 class="text-xl uppercase">{props.playlist.name}</h3>
        </div>
        <Button
          variant="outlined"
          size={"square"}
          class="rounded-lg"
          onClick={() => {
            setPlaylistActivePage({
              name: "edit",
              playlist: props.playlist,
              from: { name: "songs", playlist: props.playlist },
            });
          }}
        >
          <PencilIcon size={20} />
        </Button>
      </div>
      <div class="h-full flex-grow overflow-y-auto p-5 py-0">
        <InfiniteScroller
          apiKey={"query::playlistSongs"}
          apiData={payload()}
          apiInitKey={"query::playlistSongs::init"}
          apiInitData={payload()}
          reset={reset}
          fallback={
            <div class="py-8 text-center text-lg uppercase text-subtext">No songs in playlist</div>
          }
          builder={(s) => (
            <SongItem
              song={s}
              group={group}
              onSelect={createQueue}
              contextMenu={
                <PlaylistSongListContextMenuContent song={s} playlistName={props.playlist.name} />
              }
            />
          )}
        />
      </div>
    </div>
  );
};

type PlaylistSongListContextMenuContentProps = { song: Song; playlistName: string };
const PlaylistSongListContextMenuContent: Component<PlaylistSongListContextMenuContentProps> = (
  props,
) => {
  return (
    <DropdownList class="w-52">
      <DropdownList.Item
        onClick={() => {
          deleteSongFromPlaylist(props.playlistName, props.song);
        }}
        class="text-danger"
      >
        <span>Remove from Playlist</span>
        <DeleteIcon class="opacity-80" size={20} />
      </DropdownList.Item>
    </DropdownList>
  );
};

export default PlaylistSongList;

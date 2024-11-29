import SongImage from "../../song/SongImage";
import { deletePlaylist, setPlaylistActivePage } from "../playlist.utils";
import { getPlaylistImage } from "./playlist-item.utils";
import Button from "@renderer/components/button/Button";
import DropdownList from "@renderer/components/dropdown-list/DropdownList";
import Popover from "@renderer/components/popover/Popover";
import Impulse from "@renderer/lib/Impulse";
import { EllipsisVerticalIcon, ListXIcon, PencilLineIcon } from "lucide-solid";
import { Component, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { Playlist } from "src/@types";

export type PlaylistItemProps = {
  playlist: Playlist;
  group: string;
  reset: Impulse;
};

const PlaylistItem: Component<PlaylistItemProps> = (props) => {
  let item: HTMLDivElement | undefined;

  const [localShow, setLocalShow] = createSignal(false);
  const [mousePos, setMousePos] = createSignal<[number, number] | undefined>(undefined);

  return (
    <Popover
      isOpen={localShow}
      onValueChange={setLocalShow}
      placement="right"
      offset={{ crossAxis: 5, mainAxis: 5 }}
      shift
      position={mousePos}
    >
      <Portal>
        <Popover.Overlay />
        <Popover.Content
          onClick={(e) => {
            e.stopImmediatePropagation();
            setLocalShow(false);
          }}
        >
          {/* can't pass this as a prop like in song-item because i need the editMode signal */}
          <PlaylistItemContextMenuContent reset={props.reset} playlist={props.playlist} />
        </Popover.Content>
      </Portal>

      <div
        class="group -m-1.5 flex flex-row gap-4 rounded-lg border border-transparent p-1.5 py-1 hover:bg-surface"
        classList={{
          "bg-surface": localShow(),
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setMousePos([e.clientX, e.clientY]);
          setLocalShow(true);
        }}
        onClick={() => {
          setPlaylistActivePage({ name: "songs", playlist: props.playlist });
        }}
        ref={item}
      >
        <div class="flex items-center justify-center rounded-lg">
          <SongImage
            src={getPlaylistImage(props.playlist)}
            group={props.group}
            class="h-16 w-16 rounded-lg bg-cover bg-center"
          />
        </div>

        <div class="flex w-full items-center justify-between">
          <div class="flex flex-col justify-center text-base font-medium text-text">
            <h3 class="text-xl font-bold">{props.playlist.name}</h3>
            <p class="text-base text-subtext">{props.playlist.count} songs</p>
          </div>
          <Popover.Anchor>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setMousePos(undefined);
                setLocalShow(true);
              }}
              class="opacity-0 group-hover:opacity-100"
              classList={{
                "opacity-100": localShow(),
              }}
              variant="ghost"
              size="square"
            >
              <EllipsisVerticalIcon />
            </Button>
          </Popover.Anchor>
        </div>
      </div>
    </Popover>
  );
};

type PlaylistItemContextMenuContentProps = {
  playlist: Playlist;
  reset: Impulse;
};
const PlaylistItemContextMenuContent: Component<PlaylistItemContextMenuContentProps> = (props) => {
  return (
    <DropdownList class="w-40">
      <DropdownList.Item
        onClick={() => {
          setPlaylistActivePage({
            name: "edit",
            playlist: props.playlist,
            from: { name: "list" },
          });
        }}
      >
        <span>Edit playlist</span>
        <PencilLineIcon class="text-subtext" size={20} />
      </DropdownList.Item>
      <DropdownList.Item
        onClick={() => {
          deletePlaylist(props.playlist.name, props.reset);
        }}
        class="text-danger"
      >
        <span>Delete playlist</span>
        <ListXIcon class="opacity-80" size={20} />
      </DropdownList.Item>
    </DropdownList>
  );
};

export default PlaylistItem;

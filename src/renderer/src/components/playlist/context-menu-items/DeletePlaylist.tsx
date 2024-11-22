import { deletePlaylist } from "../playlist.utils";
import SongContextMenuItem from "@renderer/components/song/context-menu/SongContextMenuItem";
import Impulse from "@renderer/lib/Impulse";
import { ListXIcon } from "lucide-solid";
import { Component } from "solid-js";

type DeletePlaylistProps = {
  name: string;
  reset: Impulse;
};

const DeletePlaylist: Component<DeletePlaylistProps> = (props) => {
  return (
    <SongContextMenuItem
      onClick={() => {
        deletePlaylist(props.name, props.reset);
      }}
      class="hover:bg-red/20"
    >
      <p class="text-red">Delete playlist</p>
      <ListXIcon class="text-red" size={20} />
    </SongContextMenuItem>
  );
};

export default DeletePlaylist;

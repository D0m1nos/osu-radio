import { PlaylistDropdown, Song } from "../../../../../../@types";
import PlaylistChooser from "./PlaylistChooser";
import DropdownList from "@renderer/components/dropdown-list/DropdownList";
import { ListPlus } from "lucide-solid";
import { Component, createSignal, onCleanup, onMount } from "solid-js";

type AddToPlaylistProps = {
  song: Song;
  onCreatePlaylistClick?: () => void;
};

const AddToPlaylist: Component<AddToPlaylistProps> = (props) => {
  const [playlists, setPlaylists] = createSignal<PlaylistDropdown[]>([]);
  async function fetchPlaylistDropdown() {
    const result = await window.api.request("query::playlistDropdown", props.song);

    if (result.isNone) {
      setPlaylists([]);
      return;
    }

    setPlaylists(result.value.playlists);
  }

  onMount(() => {
    fetchPlaylistDropdown();
    window.api.listen("playlist::resetDropdown", fetchPlaylistDropdown);

    onCleanup(() => {
      window.api.removeListener("playlist::resetDropdown", fetchPlaylistDropdown);
    });
  });

  return (
    <DropdownList.Sub>
      <DropdownList.Sub.Trigger>
        <span>Add to Playlist</span>
        <ListPlus class="text-subtext" size={20} />
      </DropdownList.Sub.Trigger>

      <DropdownList.Sub.Content class="w-fit max-w-80">
        <PlaylistChooser
          onCreatePlaylistClick={props.onCreatePlaylistClick}
          playlists={playlists()}
          song={props.song}
        />
      </DropdownList.Sub.Content>
    </DropdownList.Sub>
  );
};

export default AddToPlaylist;

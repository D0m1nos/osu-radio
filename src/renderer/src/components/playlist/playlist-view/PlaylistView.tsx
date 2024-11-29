import { NewPlaylist } from "../new-playlist/NewPlaylist";
import { PlaylistEdit } from "../playlist-edit/PlaylistEdit";
import PlaylistList from "../playlist-list/PlaylistList";
import PlaylistSongList from "../playlist-song-list/PlaylistSongList";
import { playlistActivePage, PlaylistPageEdit, PlaylistPageSong } from "../playlist.utils";
import { Component, Match, Switch } from "solid-js";

const PlaylistView: Component = () => {
  return (
    <Switch>
      <Match when={playlistActivePage().name === "list"}>
        <PlaylistList />
      </Match>
      <Match when={playlistActivePage().name === "songs"}>
        <PlaylistSongList playlist={(playlistActivePage() as PlaylistPageSong).playlist} />
      </Match>
      <Match when={playlistActivePage().name === "edit"}>
        <PlaylistEdit
          backTo={(playlistActivePage() as PlaylistPageEdit).from}
          playlist={(playlistActivePage() as PlaylistPageEdit).playlist}
        />
      </Match>
      <Match when={playlistActivePage().name === "new"}>
        <NewPlaylist />
      </Match>
    </Switch>
  );
};

export default PlaylistView;

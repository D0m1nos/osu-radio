import { addNotice } from "../notice/NoticeContainer";
import Impulse from "@renderer/lib/Impulse";
import { BadgeCheckIcon, CircleXIcon } from "lucide-solid";
import { createSignal } from "solid-js";
import { Playlist, Song } from "src/@types";

export type PlaylistPageNew = {
  name: "new";
};

export type PlaylistPageList = {
  name: "list";
};

export type PlaylistPageSong = {
  name: "songs";
  playlist: Playlist;
};

export type PlaylistPageEdit = {
  name: "edit";
  playlist: Playlist;
  from: PlaylistPageList | PlaylistPageSong;
};

export type PlaylistPage = PlaylistPageNew | PlaylistPageList | PlaylistPageSong | PlaylistPageEdit;

export const [playlistActivePage, setPlaylistActivePage] = createSignal<PlaylistPage>({
  name: "list",
});

export function noticeError(error: string) {
  addNotice({
    title: "Error",
    description: error,
    variant: "error",
    icon: CircleXIcon({ size: 20 }),
  });
}

export async function deletePlaylist(name: string, reset: Impulse) {
  const result = await window.api.request("playlist::delete", name);
  if (result.isError) {
    noticeError(result.error);
  } else {
    reset.pulse();
    addNotice({
      variant: "success",
      title: "Playlist deleted",
      description: "Playlist " + name + " successfully deleted!",
      icon: BadgeCheckIcon({ size: 20 }),
    });
  }
}

export async function deleteSongFromPlaylist(playlistName: string, song: Song) {
  const result = await window.api.request("playlist::remove", playlistName, song);
  if (result.isError) {
    noticeError(result.error);
    return;
  }
}

export async function addToPlaylist(name: string, song: Song) {
  const result = await window.api.request("playlist::add", name, song);
  if (result.isError) {
    noticeError(result.error);
    return;
  }
}

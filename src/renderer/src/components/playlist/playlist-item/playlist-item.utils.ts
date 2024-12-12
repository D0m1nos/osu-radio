import { Playlist } from "src/@types";

export function getPlaylistImage(playlist: Pick<Playlist, "songs" | "image">) {
  const { songs, image } = playlist;
  if (image) {
    return image;
  }

  if (songs.length === 0 || songs[0].bg === undefined || songs[0].bg === "") {
    return "";
  }

  return songs[0].bg;
}

export function ignoreClickInContextMenu(fn: (evt: MouseEvent) => any): (evt: MouseEvent) => void {
  return (evt: MouseEvent) => {
    const t = evt.target;

    if (!(t instanceof HTMLElement)) {
      return;
    }

    fn(evt);
  };
}

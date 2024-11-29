import { PlaylistForm } from "../playlist-form/PlaylistForm";
import { PlaylistTitle } from "../playlist-title/PlaylistTitle";
import { noticeError, PlaylistPage, setPlaylistActivePage } from "../playlist.utils";
import Button from "@renderer/components/button/Button";
import { addNotice } from "@renderer/components/notice/NoticeContainer";
import { BadgeCheckIcon } from "lucide-solid";
import { Component, createMemo, createSignal } from "solid-js";
import { Playlist } from "src/@types";

type PlaylistEditProps = {
  playlist: Playlist;
  backTo: PlaylistPage;
};

export const PlaylistEdit: Component<PlaylistEditProps> = (props) => {
  const [playlistImage, setPlaylistImage] = createSignal(props.playlist.image ?? "");
  const [playlistName, setPlaylistName] = createSignal(props.playlist.name ?? "");

  const updatePlaylist = async () => {
    const result = await window.api.request("playlist::update", props.playlist.name, {
      name: playlistName(),
      image: playlistImage(),
    });
    if (result.isError) {
      noticeError(result.error);
      return;
    }

    addNotice({
      title: "Updated playlist",
      description: "Playlist updated successfully!",
      variant: "success",
      icon: BadgeCheckIcon({ size: 20 }),
    });
    setPlaylistActivePage(props.backTo);
  };

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (!isValid()) return;

    updatePlaylist();
  };

  const isValid = createMemo(() => PlaylistForm.isValid(playlistName()));

  return (
    <form class="flex h-full flex-col gap-6 px-5 pb-6" onSubmit={handleSubmit}>
      <PlaylistTitle backTo={props.backTo} title="Edit playlist" />
      <PlaylistForm
        playlistImage={{ value: playlistImage, onChange: setPlaylistImage }}
        playlistName={{ value: playlistName, onChange: setPlaylistName }}
      />
      <Button
        type="submit"
        disabled={!isValid()}
        class="mt-auto text-center"
        size="large"
        variant="primary"
      >
        Save
      </Button>
    </form>
  );
};

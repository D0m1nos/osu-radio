import { PlaylistForm } from "../playlist-form/PlaylistForm";
import { PlaylistTitle } from "../playlist-title/PlaylistTitle";
import { noticeError, setPlaylistActivePage } from "../playlist.utils";
import Button from "@renderer/components/button/Button";
import { addNotice } from "@renderer/components/notice/NoticeContainer";
import { CircleCheckIcon } from "lucide-solid";
import { Component, createMemo, createSignal } from "solid-js";

export const NewPlaylist: Component = () => {
  const [playlistName, setPlaylistName] = createSignal("");
  const [playlistImage, setPlaylistImage] = createSignal("");

  const isValid = createMemo(() => PlaylistForm.isValid(playlistName()));

  const createPlaylist = async () => {
    if (!isValid()) {
      return;
    }

    const result = await window.api.request("playlist::create", {
      name: playlistName(),
      image: playlistImage(),
    });
    if (result.isError) {
      noticeError(result.error);
      return;
    }

    addNotice({
      title: "Playlist created",
      description: "The playlist " + playlistName() + " has been successfully created!",
      variant: "success",
      icon: <CircleCheckIcon size={20} />,
    });
    setPlaylistActivePage({ name: "list" });
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    createPlaylist();
  };

  return (
    <form class="flex h-full flex-col gap-6 px-5 pb-6" onSubmit={handleSubmit}>
      <PlaylistTitle title="New playlist" />
      <PlaylistForm
        playlistName={{
          value: playlistName,
          onChange: setPlaylistName,
        }}
        playlistImage={{
          value: playlistImage,
          onChange: setPlaylistImage,
        }}
      />
      <Button disabled={!isValid()} class="mt-auto text-center" size="large" variant="primary">
        Create
      </Button>
    </form>
  );
};

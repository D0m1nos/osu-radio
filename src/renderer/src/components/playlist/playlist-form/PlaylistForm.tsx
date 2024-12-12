import Button from "@renderer/components/button/Button";
import { Input } from "@renderer/components/input/Input";
import SongImage from "@renderer/components/song/SongImage";
import useControllableState from "@renderer/lib/controllable-state";
import { TrashIcon, UploadIcon } from "lucide-solid";
import { Accessor, Component, Show } from "solid-js";

type PlaylistFormContentProps = {
  playlistImage?: {
    value: Accessor<string>;
    onChange: (value: string) => void;
  };
  playlistName?: {
    value: Accessor<string>;
    onChange: (value: string) => void;
  };
};

const PlaylistFormContent: Component<PlaylistFormContentProps> = (props) => {
  const [playlistImage, setPlaylistImage] = useControllableState({
    defaultProp: "",
    prop: props.playlistImage?.value,
    onChange: props.playlistImage?.onChange,
  });
  const [playlistName, setPlaylistName] = useControllableState({
    defaultProp: "",
    prop: props.playlistName?.value,
    onChange: props.playlistName?.onChange,
  });

  const handleImageUpload = async () => {
    const result = await window.api.request("dir::openFile", {
      title: "Select playlist image",
      filters: [
        {
          name: "Images",
          extensions: ["jpg", "jpeg", "png", "gif", "webp"],
        },
      ],
    });

    if (result.isNone) {
      return;
    }

    setPlaylistImage(result.value);
  };

  const handleImageDelete = () => {
    setPlaylistImage("");
  };

  return (
    <>
      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium text-subtext">Playlist picture</p>
        <div class="flex items-end gap-2">
          <div class="relative h-36 w-36" onClick={handleImageUpload}>
            <SongImage
              src={playlistImage()}
              instantLoad={true}
              class="h-full w-full rounded-lg bg-cover bg-center"
            />
            <div class="absolute left-0 top-0 grid h-full w-full place-items-center rounded-lg bg-black/50 opacity-0 transition-opacity duration-200 hover:opacity-100">
              <UploadIcon size={20} />
            </div>
          </div>
          <Show when={playlistImage()}>
            <Button type="button" onClick={handleImageDelete} variant="outlined" size="square">
              <TrashIcon size={20} />
            </Button>
          </Show>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium text-subtext">Name</p>
        <Input
          autofocus
          variant="outlined"
          type="text"
          placeholder="Playlist name"
          value={playlistName()}
          onInput={(e) => setPlaylistName(e.target.value)}
        />
      </div>
    </>
  );
};

export const PlaylistForm = Object.assign(PlaylistFormContent, {
  isValid: (playlistName: string) => {
    return playlistName.trim() !== "";
  },
});

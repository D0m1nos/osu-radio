import { PlaylistPage, setPlaylistActivePage } from "../playlist.utils";
import Button from "@renderer/components/button/Button";
import { ArrowLeftIcon } from "lucide-solid";
import { Component } from "solid-js";

type PlaylistTitleProps = {
  title: string;
  backTo?: PlaylistPage;
};

export const PlaylistTitle: Component<PlaylistTitleProps> = (props) => {
  return (
    <div class="flex w-full flex-row items-center gap-2.5 py-1 font-medium">
      <Button
        variant="ghost"
        size="square"
        type="button"
        onClick={() => setPlaylistActivePage(props.backTo ?? { name: "list" })}
      >
        <ArrowLeftIcon class="text-subtext" size={20} />
      </Button>
      <h3 class="text-xl uppercase">{props.title}</h3>
    </div>
  );
};

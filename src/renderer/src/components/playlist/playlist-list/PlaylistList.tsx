import InfiniteScroller from "../../InfiniteScroller";
import PlaylistItem from "../playlist-item/PlaylistItem";
import { setPlaylistActivePage } from "../playlist.utils";
import { namespace } from "@renderer/App";
import Button from "@renderer/components/button/Button";
import { Input } from "@renderer/components/input/Input";
import Impulse from "@renderer/lib/Impulse";
import { PlusIcon, SearchIcon } from "lucide-solid";
import { Component, onCleanup, onMount } from "solid-js";

const PlaylistList: Component = () => {
  const resetListing = new Impulse();

  const group = namespace.create(true);

  onMount(() => {
    window.api.listen("playlist::resetList", resetListing.pulse.bind(resetListing));
  });

  onCleanup(() => {
    window.api.removeListener("playlist::resetList", resetListing.pulse.bind(resetListing));
  });

  return (
    <>
      <PlaylistSearch />

      <div class="flex-grow overflow-y-auto p-5 py-0">
        <InfiniteScroller
          apiKey={"query::playlists"}
          apiInitKey={"query::playlists::init"}
          reset={resetListing}
          fallback={<div class="py-8 text-center text-lg uppercase text-subtext">No playlists</div>}
          builder={(playlist) => (
            <PlaylistItem playlist={playlist} group={group} reset={resetListing} />
          )}
        />
      </div>
    </>
  );
};

const PlaylistSearch: Component = () => {
  return (
    <div class="flex gap-2 px-5 pb-2 pt-1">
      <div class="relative flex-1">
        <Input
          variant="outlined"
          type="text"
          id="search_input"
          placeholder="Search in your playlists... (WIP)"
        />
        <label
          class="absolute right-3.5 top-1/2 -translate-y-1/2 transform text-xl text-subtext"
          for="search_input"
        >
          <SearchIcon size={20} class="opacity-70" />
        </label>
      </div>
      <Button
        onClick={() => {
          setPlaylistActivePage({ name: "new" });
        }}
        class="rounded-lg text-xl"
        variant="outlined"
        size="square"
      >
        <PlusIcon size={20} />
      </Button>
    </div>
  );
};

export default PlaylistList;

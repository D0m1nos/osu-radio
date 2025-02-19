import { namespace } from "@renderer/App";
import InfiniteScroller from "@renderer/components/InfiniteScroller";
import Button from "@renderer/components/button/Button";
import DropdownList from "@renderer/components/dropdown-list/DropdownList";
import SongItem from "@renderer/components/song/song-item/SongItem";
import Impulse from "@renderer/lib/Impulse";
import { Song } from "@shared/types/common.types";
import { RequestAPI } from "@shared/types/router.types";
import { ListPlusIcon, DeleteIcon } from "lucide-solid";
import { Component, createSignal, For, onCleanup, onMount, Show } from "solid-js";

const SongQueue: Component = () => {
  const [manualQueue, setManualQueue] = createSignal<Song[]>([]);

  const [count, setCount] = createSignal(0);
  const resetListing = new Impulse();
  const group = namespace.create(true);

  const onDrop = (s: Song) => {
    return async (before: Element | null) => {
      await window.api.request(
        "queue::place",
        s.path,
        (before as HTMLElement | null)?.dataset.path,
      );
    };
  };

  const refreshManualQueue = async () => {
    const q = await window.api.request("manualQueue::list");
    setManualQueue(q);
  };

  onMount(async () => {
    window.api.listen("queue::created", () => {
      resetListing.pulse.bind(resetListing);
      resetListing.pulse(); // to refresh the queue when removing a song through the context menu
      refreshManualQueue();
    });
    refreshManualQueue();
  });

  onCleanup(() => {
    window.api.removeListener("queue::created", () => {
      resetListing.pulse.bind(resetListing);
      resetListing.pulse();
      refreshManualQueue();
    });
  });

  return (
    <div class="flex w-full flex-col">
      <div class="flex-grow overflow-y-auto px-4">
        <Show when={manualQueue().length > 0}>
          <div class="flex flex-col">
            <div class="flex flex-row items-center gap-2 px-1 pb-2 pt-5">
              <h2 class="text-md font-bold">
                <span>Next in queue</span>
                <span class="text-subtext"> ({manualQueue().length})</span>
              </h2>
              <Button
                size={"small"}
                variant={"outlined"}
                onClick={() => {
                  window.api.request("manualQueue::clear");
                  refreshManualQueue();
                }}
              >
                <span class="font-bold text-danger opacity-80">Clear</span>
              </Button>
            </div>
            <div class="flex flex-col gap-y-4">
              <For each={manualQueue()}>
                {(s, idx) => (
                  <SongItem
                    song={s}
                    group={group}
                    selectable={true}
                    onSelect={() => {
                      window.api.request("manualQueue::play", idx());
                      refreshManualQueue();
                    }}
                    onDrop={onDrop(s)}
                    contextMenu={
                      <QueueContextMenuContent song={s} event={"manualQueue::removeSong"} />
                    }
                  />
                )}
              </For>
            </div>
          </div>
        </Show>
        <div class="flex items-center justify-between px-1 pt-5">
          <h2 class="text-md font-bold">
            <span>Next songs</span>
            <span class="text-subtext"> ({count()})</span>
          </h2>
        </div>
        <InfiniteScroller
          apiKey={"query::queue"}
          apiInitKey={"query::queue::init"}
          setCount={setCount}
          reset={resetListing}
          fallback={<div class="py-8 text-center text-subtext">No queue...</div>}
          builder={(s) => (
            <SongItem
              song={s}
              group={group}
              selectable={true}
              onSelect={() => {
                window.api.request("queue::play", s.path);
                refreshManualQueue();
              }}
              onDrop={onDrop(s)}
              contextMenu={<QueueContextMenuContent song={s} event={"queue::removeSong"} />}
            />
          )}
        />
      </div>
    </div>
  );
};

type QueueContextMenuContentProps = { song: Song; event: keyof RequestAPI };
const QueueContextMenuContent: Component<QueueContextMenuContentProps> = (props) => {
  return (
    <DropdownList class="w-52">
      <DropdownList.Item>
        <span>Add to Playlist</span>
        <ListPlusIcon class="text-subtext" size={20} />
      </DropdownList.Item>
      <DropdownList.Item
        onClick={() => {
          window.api.request(props.event, props.song.path);
        }}
        class="text-danger"
      >
        <span>Remove from queue</span>
        <DeleteIcon class="opacity-80" size={20} />
      </DropdownList.Item>
    </DropdownList>
  );
};

export default SongQueue;

import { Router } from "@main/lib/route-pass/Router";
import { filter } from "@main/lib/song/filter";
import { indexMapper } from "@main/lib/song/indexMapper";
import order from "@main/lib/song/order";
import { Storage } from "@main/lib/storage/Storage";
import { mainWindow } from "@main/main";
import { none, some } from "@shared/lib/rust-types/Optional";
import { fail, ok } from "@shared/lib/rust-types/Result";
import { shuffle } from "@shared/lib/tungsten/collections";
import errorIgnored from "@shared/lib/tungsten/errorIgnored";
import {
  Optional,
  QueueCreatePayload,
  QueueView,
  Result,
  Song,
  SongIndex,
} from "@shared/types/common.types";

let queue: Song[];
let manualQueue: Song[] = [];

Router.respond("queue::exists", () => {
  return queue !== undefined || manualQueue !== undefined;
});

let index = 0;

let isPlaying: "queue" | "manualQueue" | undefined;

let lastPayload: QueueCreatePayload | undefined;

Router.respond("queue::create", async (_evt, payload) => {
  isPlaying = "queue";

  if (comparePayload(payload, lastPayload)) {
    // Payload is practically same. Find start song and play queue from there
    const newIndex = queue.findIndex((s) => s.path === payload.startSong);

    if (newIndex === -1 || newIndex === index) {
      return;
    }

    index = newIndex;
    lastPayload = payload;
    await Router.dispatch(mainWindow, "queue::songChanged", queue[index]).catch(errorIgnored);
    return;
  }

  lastPayload = payload;
  /**
   * Create list of {@link SongIndex} from current {@link QueueView}. This list is filtered via payload
   * specifications. Afterward it is mapped back to {@link Song} object
   */
  queue = Array.from(indexMapper(filter(getIndexes(payload.view), payload)));

  /**
   * Create ordering function from order literal {@link QueueCreatePayload}
   */
  const ordering = order(payload.order);

  if (!ordering.isError) {
    queue.sort(ordering.value);
  }

  // Set playing index
  const songIndex = queue.findIndex((s) => s.path === payload.startSong);

  if (songIndex !== -1) {
    index = songIndex;
  } else {
    index = 0;
  }

  await Router.dispatch(mainWindow, "queue::created").catch(errorIgnored);
  await Router.dispatch(mainWindow, "queue::songChanged", queue[index]).catch(errorIgnored);
});

function getIndexes(view: QueueView): SongIndex[] {
  if (view.playlists !== undefined) {
    //todo implement multi playlist playback
    return [];
  }

  if (view.isAllSongs) {
    const indexes = Storage.getTable("system").get("indexes");
    if (indexes.isNone) {
      return [];
    }

    return indexes.value;
  }

  if (view.playlist) {
    //todo get playlist
    return [];
  }

  return [];
}

function comparePayload(
  current: QueueCreatePayload,
  last: QueueCreatePayload | undefined,
): boolean {
  if (last === undefined) {
    return false;
  }

  if (typeof current.searchQuery !== typeof last.searchQuery) {
    return false;
  }

  if (current.searchQuery !== undefined && last.searchQuery !== undefined) {
    if (current.searchQuery.query !== last.searchQuery.query) {
      return false;
    }
  }

  if (current.order !== last.order) {
    return false;
  }

  if (JSON.stringify(current.view) !== JSON.stringify(last.view)) {
    return false;
  }

  if (current.tags.length !== last.tags.length) {
    return false;
  }

  return JSON.stringify(current.tags) === JSON.stringify(last.tags);
}

Router.respond("queue::duration", (): Optional<number> => {
  const d = duration();

  if (d.isError) {
    return none();
  }

  return some(d.value);
});

Router.respond("queue::remainingDuration", (): Optional<number> => {
  const d = duration(index);

  if (d.isError) {
    return none();
  }

  return some(d.value);
});

function duration(startIndex = 0): Result<number, string> {
  if (queue === undefined) {
    return fail("Queue is not defined.");
  }

  let sum = 0;

  for (let i = startIndex; i < queue.length; i++) {
    const s = queue[i];
    sum += s.duration;
  }

  return ok(sum);
}

Router.respond("queue::shuffle", async () => {
  // Shuffle whole queue except currently playing song. Its position will be first in shuffled queue
  if (queue === undefined) {
    return;
  }

  const current = queue[index].path;
  shuffle(queue);

  for (let i = 0; i < queue.length; i++) {
    if (queue[i].path !== current) {
      continue;
    }

    if (i === 0) {
      break;
    }

    const t = queue[i];
    queue[i] = queue[0];
    queue[0] = t;
    break;
  }

  index = 0;

  await Router.dispatch(mainWindow, "queue::created").catch(errorIgnored);

  if (isPlaying === "queue") {
    await Router.dispatch(mainWindow, "queue::songChanged", queue[index]).catch(errorIgnored);
  }
});

Router.respond("queue::place", (_evt, what, after) => {
  // Find index of subject
  const whatIndex = queue.findIndex((s) => s.path === what);

  if (whatIndex === -1) {
    return;
  }

  const s = queue[whatIndex];
  queue.splice(whatIndex, 1);

  if (after === undefined) {
    // After is referring to the head of the queue. Place subject at the very start
    queue.unshift(s);

    if (whatIndex === index) {
      // Update currently playing index
      index = 0;
      return;
    }

    if (whatIndex > index) {
      // Subject was moved before currently playing thus currently playing must be increased
      index++;
    }

    return;
  }

  const afterIndex = queue.findIndex((s) => s.path === after);

  if (afterIndex === -1) {
    // After index was not found... put subject back
    queue.splice(whatIndex, 0, s);
    return;
  }

  queue.splice(afterIndex + 1, 0, s);

  if (whatIndex === index) {
    // Subject was currently playing before move operation. Update currently playing index
    index = afterIndex + 1;
    return;
  }

  if (whatIndex > index && afterIndex < index) {
    // Moved subject that was after currently playing before currently playing -> increment
    index++;
  }

  if (whatIndex < index && afterIndex + 1 >= index) {
    // Moved subject that was before currently playing after currently playing -> decrement
    index--;
  }
});

Router.respond("queue::play", async (_evt, song) => {
  // Point currently playing index to given song
  const newIndex = queue.findIndex((s) => s.path === song);

  console.log("queue (before): ", isPlaying);

  if (newIndex === -1 || (newIndex === index && isPlaying === "queue")) {
    return;
  }

  // Remove playing song from manual queue
  if (isPlaying == "manualQueue") {
    manualQueue.shift();
  }

  index = newIndex;

  isPlaying = "queue";

  console.log("queue (after): ", isPlaying);

  await Router.dispatch(mainWindow, "queue::songChanged", queue[index]).catch(errorIgnored);
});

Router.respond("queue::removeSong", async (_evt, what) => {
  if (what === undefined) {
    return;
  }

  const whatIndex = queue.findIndex((s) => s.path === what);

  if (whatIndex === -1) {
    return;
  }

  if (whatIndex < index) {
    index--;
  }

  queue.splice(whatIndex, 1);

  await Router.dispatch(mainWindow, "queue::created").catch(errorIgnored);

  if (whatIndex === index) {
    if (index === queue.length - 1) {
      index--;
    }

    if (isPlaying === "queue") {
      await Router.dispatch(mainWindow, "queue::songChanged", queue[index]).catch(errorIgnored);
    }
  }
});

Router.respond("queue::current", () => {
  if (isPlaying == "manualQueue") {
    return some(manualQueue[0]);
  } else {
    if (queue === undefined || queue[index] === undefined) {
      return none();
    }

    return some(queue[index]);
  }
});

Router.respond("queue::previous", async () => {
  if (queue === undefined) {
    return;
  }

  if (index == 0) {
    return;
  }

  index--;

  if (isPlaying === "manualQueue") {
    manualQueue.shift();
    isPlaying = "queue";
  }

  await Router.dispatch(mainWindow, "queue::songChanged", queue[index]).catch(errorIgnored);
});

Router.respond("queue::next", async () => {
  if (manualQueue.length > 0) {
    if (isPlaying === "manualQueue") {
      manualQueue.shift();
    } else {
      isPlaying = "manualQueue";
      index++;
    }

    if (manualQueue.length > 0) {
      await Router.dispatch(mainWindow, "queue::songChanged", manualQueue[0]).catch(errorIgnored);

      return;
    }
  }

  if (queue === undefined) {
    return;
  }

  if (isPlaying === "manualQueue") {
    index--;
  }

  if (++index === queue.length) {
    index = 0;
  }

  isPlaying = "queue";

  await Router.dispatch(mainWindow, "queue::songChanged", queue[index]).catch(errorIgnored);
});

Router.respond("manualQueue::play", async (_evt, song) => {
  // Point currently playing index to given song
  const newIndex = manualQueue.findIndex((s) => s.path === song);

  console.log(manualQueue.map((e) => e.title));
  console.log(manualQueue.find((s) => s.path === song)?.title);
  console.log(newIndex, isPlaying);

  if (newIndex === -1 || (newIndex === 0 && isPlaying === "manualQueue")) {
    return;
  }

  // Remove previous songs in the manual queue
  // BUG: if a song is present multiple times in a row nothing happens no matter which one gets clicked
  manualQueue.splice(0, newIndex);

  isPlaying = "manualQueue";

  await Router.dispatch(mainWindow, "queue::songChanged", manualQueue[0]).catch(errorIgnored);
});

Router.respond("manualQueue::add", async (_evt, song) => {
  const s = Storage.getTable("songs").get(song);

  if (s.isNone) {
    return;
  }

  manualQueue.push(s.value);

  await Router.dispatch(mainWindow, "queue::created").catch(errorIgnored);
});

Router.respond("manualQueue::removeSong", async (_evt, what) => {
  if (what === undefined) {
    return;
  }

  const whatIndex = manualQueue.findIndex((s) => s.path === what);

  if (whatIndex === -1) {
    return;
  }

  manualQueue.splice(whatIndex, 1);

  await Router.dispatch(mainWindow, "queue::created").catch(errorIgnored);

  if (whatIndex === 0 && isPlaying === "manualQueue") {
    if (manualQueue.length === 0) {
      await Router.dispatch(mainWindow, "queue::songChanged", queue[index]).catch(errorIgnored);
    } else {
      await Router.dispatch(mainWindow, "queue::songChanged", manualQueue[0]).catch(errorIgnored);
    }
  }
});

Router.respond("manualQueue::clear", async () => {
  manualQueue = [];

  if (isPlaying == "manualQueue") {
    if (queue !== undefined) {
      await Router.dispatch(mainWindow, "queue::songChanged", queue[index]).catch(errorIgnored);
      isPlaying = "queue";
    } else {
      isPlaying = undefined;
    }
  }
});

Router.respond("manualQueue::list", () => {
  return manualQueue;
});

const BUFFER_SIZE = 50;

Router.respond("query::queue::init", () => {
  const count = queue !== undefined ? queue.length - index : 0;

  return some({
    initialIndex: Math.floor(index / BUFFER_SIZE),
    count,
  });
});

Router.respond("query::queue", (_evt, request) => {
  // Queue view may be rendered only around currently playing. When user scrolls up and there is content that could be
  // loaded and prepended the request.direction is "up". If user scrolls down the request.direction is "down". For given
  // request create new page of size BUFFER_SIZE and send it to client to. This way user will load the whole list
  // incrementally, and it will reduce initial load lag

  if (
    queue === undefined ||
    request.index < 0 ||
    request.index > Math.floor(queue.length / BUFFER_SIZE)
  ) {
    return none();
  }

  let start = index;

  if (request.index > 0) {
    start = (request.index - Math.floor(index / BUFFER_SIZE)) * BUFFER_SIZE + index;
  }

  if (request.direction === "up") {
    return some({
      index: request.index - 1,
      total: queue.length - (index + 1),
      items: queue.slice(start, start + BUFFER_SIZE),
    });
  }

  return some({
    index: request.index + 1,
    total: queue.length - (index + 1),
    items: queue.slice(start, start + BUFFER_SIZE),
  });
});

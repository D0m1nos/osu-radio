import { OsuParser } from "../lib/osu-file-parser/OsuParser";
import { Router } from "../lib/route-pass/Router";
import { fail, ok } from "../lib/rust-like-utils-backend/Result";

Router.respond("collections::getCollections", async () => {
  const collectionFile = await OsuParser.parseCollection();
  if (!collectionFile.isError) {
    return ok(collectionFile.value);
  }
  return fail("Failed to get collections ");
});

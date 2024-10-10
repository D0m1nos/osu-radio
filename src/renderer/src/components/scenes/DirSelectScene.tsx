import "../../assets/css/scenes/dir-select.css";
import { createSignal } from "solid-js";

export default function DirSelectScene() {
  const [dir, setDir] = createSignal("");

  const selectDir = async () => {
    const opt = await window.api.request("dir::select");
    if (opt.isNone) {
      return;
    }

    setDir(opt.value);
  };

  const autodetectDir = async () => {
    const autoGetDir = await window.api.request("dir::autoGetOsuDir");
    if (autoGetDir.isNone) {
      return;
    }

    setDir(autoGetDir.value);
  };

  const submitDir = async () => {
    await window.api.request("dir::submit", dir());
  };

  return (
    <div id="dir-select" class="scene">
      <div class="column">
        <h2>Your osu! folder:</h2>
        <code classList={{ empty: dir() === "" }}>
          {dir() === "" ? "[No folder selected]" : dir()}
        </code>
        <div class="row">
          <button onClick={autodetectDir}>Autodetect folder</button>
          <button onClick={selectDir}>Select folder</button>
          <button onClick={submitDir}>Submit</button>
        </div>
      </div>
    </div>
  );
}

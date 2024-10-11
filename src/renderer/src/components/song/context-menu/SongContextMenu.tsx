import { Accessor, Component, createEffect, For, onCleanup, onMount, Show, Signal } from "solid-js";
import Gradient from "../../Gradient";
import "../../../assets/css/song/song-context-menu.css";

type SongContextMenuProps = {
  show: Signal<boolean>;
  coords: Accessor<[number, number]>;
  container: any;
  children: any;
};

const SongContextMenu: Component<SongContextMenuProps> = (props) => {
  const [show, setShow] = props.show;
  let menu;

  const windowContextMenu = (evt: MouseEvent) => {
    const t = evt.target;

    if (!(t instanceof HTMLElement)) {
      return;
    }

    const targetItem = t.closest(".song-item");
    const menuParent = menu?.closest(".song-item");

    if (targetItem === menuParent) {
      evt.stopPropagation();
      return;
    }

    setShow(false);
  };

  const calculatePosition = () => {
    const c = props.coords();
    menu?.style.setProperty("--x", `${Math.round(c[0])}px`);
    menu?.style.setProperty("--y", `${Math.round(c[1])}px`);
  };

  onMount(() => {
    createEffect(() => {
      const s = show();

      if (s === false) {
        window.removeEventListener("contextmenu", windowContextMenu);
        return;
      }

      calculatePosition();
      window.addEventListener("click", () => setShow(false), { once: true });
      window.addEventListener("contextmenu", windowContextMenu);
    });
  });

  onCleanup(() => {
    window.removeEventListener("click", () => setShow(false));
    window.removeEventListener("contextmenu", windowContextMenu);
    menu?.removeEventListener("click", (evt) => evt.stopPropagation());
  });

  return (
    <Show when={show()}>
      <div class={"song-menu"} ref={menu}>
        <Gradient classTop={"song-menu-container"}>
          <For each={props.children}>{(child) => child}</For>
        </Gradient>
      </div>
    </Show>
  );
};

export default SongContextMenu;

export function ignoreClickInContextMenu(fn: (evt: MouseEvent) => any): (evt: MouseEvent) => void {
  return (evt: MouseEvent) => {
    const t = evt.target;

    if (!(t instanceof HTMLElement)) {
      fn(evt);
      return;
    }

    const menu = t.closest(".song-menu");

    if (menu !== null) {
      return;
    }

    fn(evt);
  };
}

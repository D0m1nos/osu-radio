import Popover, { usePopover } from "../popover/Popover";
import type { Props as PopoverProps } from "../popover/Popover";
import DropdownList from "./DropdownList";
import type { Props as DropdownListItemProps } from "./DropdownListItem";
import { createContext, ParentComponent, useContext, splitProps, mergeProps } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

type Props = JSX.IntrinsicElements["div"];

const useProviderValue = () => {
  const popover = usePopover();

  let mouseLeaveTimeout: NodeJS.Timeout;
  const clearMouseLeaveTimeout = () => {
    clearTimeout(mouseLeaveTimeout);
  };

  const handleTriggerMouseEnter = () => {
    popover.open();
  };

  const handleTriggerMouseLeave = () => {
    clearMouseLeaveTimeout();
    mouseLeaveTimeout = setTimeout(() => {
      popover.close();
    }, 50);
  };

  const handleTriggerKeyUp = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      popover.open();
      popover.focusFirstItemOnContent();
    }
  };

  return {
    handleTriggerMouseEnter,
    handleTriggerMouseLeave,
    clearMouseLeaveTimeout,
    handleTriggerKeyUp,
  };
};

const useDropdownSub = () => {
  const state = useContext(DropdownSubContext);
  if (!state) {
    throw new Error(
      "useDropdownSub needs to be used inside of the `DropdownSubProvider` component.",
    );
  }
  return state;
};

export const DropdownSubContext = createContext<ReturnType<typeof useProviderValue>>();

type DropdownSubRootProps = Props & PopoverProps;
const DropdownSubRoot: ParentComponent<DropdownSubRootProps> = (_props) => {
  const [props, rest] = splitProps(_props, ["children"]);
  const mergedProps = mergeProps<DropdownSubRootProps[]>(
    {
      shift: true,
      flip: true,
      placement: "right",
      offset: {
        crossAxis: 0,
        mainAxis: -6,
      },
    },
    rest,
  );

  return (
    <Popover {...mergedProps}>
      <DropdownSubContext.Provider value={useProviderValue()}>
        {props.children}
      </DropdownSubContext.Provider>
    </Popover>
  );
};

const DropdownSubTrigger: ParentComponent<DropdownListItemProps> = (props) => {
  const { handleTriggerMouseEnter, handleTriggerMouseLeave, handleTriggerKeyUp } = useDropdownSub();

  return (
    <Popover.Anchor
      class="relative -mx-2 flex flex-col px-2 before:absolute before:-bottom-2 before:-right-1 before:h-5 before:w-5 before:rotate-45"
      onMouseEnter={handleTriggerMouseEnter}
      onMouseLeave={handleTriggerMouseLeave}
    >
      <DropdownList.Item onKeyUp={handleTriggerKeyUp} {...props} />
    </Popover.Anchor>
  );
};

const DropdownSubContent: ParentComponent<Props> = (props) => {
  const { clearMouseLeaveTimeout } = useDropdownSub();

  return (
    <Popover.Portal>
      <Popover.Content onMouseEnter={clearMouseLeaveTimeout} {...props}>
        <DropdownList>{props.children}</DropdownList>
      </Popover.Content>
    </Popover.Portal>
  );
};

export const DropdownSub = Object.assign(DropdownSubRoot, {
  Trigger: DropdownSubTrigger,
  Content: DropdownSubContent,
});

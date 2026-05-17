import { useEffect, RefObject } from "react";

export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  ignoreSelector?: string
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;

      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(target)) {
        return;
      }

      // Do nothing if clicking an ignored element/selector (like the toggle button)
      if (ignoreSelector && target.closest(ignoreSelector)) {
        return;
      }

      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, ignoreSelector]);
}

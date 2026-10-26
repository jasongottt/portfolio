import { useEffect, useState } from "react";

/**
 * The layout switches on viewport shape as well as width: a tall tablet gets
 * the phone layout even when it is wider than a phone.
 */
export function useViewport() {
  const [size, setSize] = useState(() => ({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 800 : window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () =>
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isPortrait = size.height > size.width;
  const isPhone = size.width <= 900 || (isPortrait && size.width <= 1200);

  return { isPhone };
}

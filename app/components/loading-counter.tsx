"use client"

import { animate, motion, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

type LoadingCounterProps = {
  onFinish?: () => void;
};

export default function LoadingCounter({ onFinish }: LoadingCounterProps) {
  const count = useMotionValue(0);
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    // animate count from 0 to 100
    const controls = animate(count, 100, { duration: 2 });
    const unsubscribe = count.onChange((v) => {
      const rounded = Math.round(v);
      setValue(rounded);
      if (rounded >= 100) {
        // finished
        onFinish?.();
        controls.stop();
      }
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, onFinish]);

  return (
    <motion.pre style={text} aria-hidden={false}>
      {value}
    </motion.pre>
  );
}

const text: React.CSSProperties = {
  fontSize: 64,
  color: "#fff",
  margin: 0,
};

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";

function Counter() {
  const [count, setCount] = useState(() => {
    const savedCount = localStorage.getItem("count");
    return savedCount !== null ? parseInt(savedCount, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem("count", count);
  }, [count]);

  return (
    <div className="counter">
      <motion.h2
        key={count}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="count"
      >
        {count}
      </motion.h2>

      <div className="btn-group">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="btn"
          onClick={() => setCount(count - 1)}
        >
          <div className="flex">
            <Minus />
            <span>Decrement</span>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="btn primary"
          onClick={() => setCount(count + 1)}
        >
          <div className="flex">
            <Plus />
            <span>Increment</span>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="btn reset"
          onClick={() => setCount(0)}
        >
          <div className="flex">
            <RotateCcw />
            <span>Reset</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

export default Counter;

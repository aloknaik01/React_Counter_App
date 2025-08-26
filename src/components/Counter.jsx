import React, { useState } from "react";
import { motion } from "framer-motion";

function Counter() {
  const [count, setCount] = useState(0);

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
          ➖ Decrement
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="btn primary"
          onClick={() => setCount(count + 1)}
        >
          ➕ Increment
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="btn reset"
          onClick={() => setCount(0)}
        >
          🔄 Reset
        </motion.button>
      </div>
    </div>
  );
}

export default Counter;

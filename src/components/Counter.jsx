import React, { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ marginTop: "40px" }}>
      <motion.h2
        key={count} // important for animation
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {count}
      </motion.h2>

      <div>
        <button onClick={() => setCount(count - 1)}>- Decrement</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount(count + 1)}>+ Increment</button>
      </div>
    </div>
  );
}

export default Counter;

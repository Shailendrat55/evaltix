import { useEffect, useState } from "react";

export default function Timer({ onTimeUp }) {
  const [time, setTime] = useState(20 * 60);

  useEffect(() => {
    if (time <= 0) {
      onTimeUp();
      return;
    }
    const interval = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [time]);

  return <h2>Time Left: {Math.floor(time/60)}:{String(time%60).padStart(2,"0")}</h2>;
}

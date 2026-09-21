// hooks/candidate/useCameraMic.js
import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Manages independent camera and microphone permission requests.
 * Returns status per device plus the raw streams for preview/monitoring.
 */
export default function useCameraMic() {
  const [camStatus, setCamStatus] = useState("idle"); // idle | requesting | granted | denied
  const [micStatus, setMicStatus] = useState("idle");
  const [error, setError] = useState(null);

  const videoStreamRef = useRef(null);
  const audioStreamRef = useRef(null);

  const requestCamera = useCallback(async () => {
    setCamStatus("requesting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStreamRef.current = stream;
      setCamStatus("granted");
      return stream;
    } catch (err) {
      setCamStatus("denied");
      setError(
        err.name === "NotAllowedError"
          ? "Camera access was denied. Please allow it to continue."
          : "Could not access your camera."
      );
      return null;
    }
  }, []);

  const requestMic = useCallback(async () => {
    setMicStatus("requesting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setMicStatus("granted");
      return stream;
    } catch (err) {
      setMicStatus("denied");
      setError(
        err.name === "NotAllowedError"
          ? "Microphone access was denied. Please allow it to continue."
          : "Could not access your microphone."
      );
      return null;
    }
  }, []);

  const stopAll = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioStreamRef.current?.getTracks().forEach((t) => t.stop());
    videoStreamRef.current = null;
    audioStreamRef.current = null;
  }, []);

  useEffect(() => {
    return () => stopAll();
  }, [stopAll]);

  return {
    camStatus,
    micStatus,
    error,
    videoStream: videoStreamRef.current,
    audioStream: audioStreamRef.current,
    requestCamera,
    requestMic,
    stopAll,
    bothGranted: camStatus === "granted" && micStatus === "granted",
  };
}
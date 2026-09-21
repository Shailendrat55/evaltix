  // import { useState } from "react";
  // import { useNavigate } from "react-router-dom";
  // import { examStart } from "../api/api"; // 👈 Import API

  // export default function Rules() {
  //   const [accepted, setAccepted] = useState(false);
  //   const [loading, setLoading] = useState(false);
  //   const navigate = useNavigate();

  //   const handleStart = async () => {
  //     if (!accepted) {
  //       alert("⚠️ You must accept the rules to start the exam.");
  //       return;
  //     }

  //     try {
  //       setLoading(true);
  //       const userId = localStorage.getItem("userId");
  //       await examStart(userId); // 👈 Call API with userId
  //       navigate("/exam");
  //     } catch (err) {
  //       console.error("Failed to start exam", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   return (
  //     <div style={styles.container}>
  //       <h1>📚 Exam Rules</h1>

  //       <ul style={styles.list}>
  //         <li>1. The exam duration is 20 minutes.</li>
  //         <li>2. Do not switch tabs during the exam. 4 violations = auto-submit.</li>
  //         <li>3. Copying, pasting, right-clicking, or refreshing is prohibited.</li>
  //         <li>4. Do not open developer tools. Doing so counts as a violation.</li>
  //         <li>5. Answer all questions honestly. Cheating will auto-submit your exam.</li>
  //         {/* <li>6. Your answers are auto-saved locally.</li> */}
  //         <li>6. Once submitted, answers cannot be changed.</li>
  //         <li>7. Everything is recorded each button press.</li>
  //         {/* <li>7. Everything is recorded each button press.</li> */}

  //       </ul>

  //       <div style={styles.checkboxContainer}>
  //         <input
  //           type="checkbox"
  //           checked={accepted}
  //           onChange={e => setAccepted(e.target.checked)}
  //         />
  //         <span style={{ marginLeft: 8 }}>I have read and agree to the exam rules</span>
  //       </div>

  //       <button
  //         onClick={handleStart}
  //         disabled={!accepted || loading}
  //         style={{
  //           ...styles.button,
  //           backgroundColor: accepted && !loading ? "#4caf50" : "#aaa",
  //           cursor: accepted && !loading ? "pointer" : "not-allowed",
  //         }}
  //       >
  //         {loading ? "Starting..." : "Start Exam"}
  //       </button>
  //     </div>
  //   );
  // }

  // const styles = {
  //   container: {
  //     maxWidth: 600,
  //     margin: "50px auto",
  //     padding: 20,
  //     textAlign: "center",
  //     fontFamily: "Arial, sans-serif",
  //     border: "1px solid #ccc",
  //     borderRadius: 10,
  //     backgroundColor: "#f9f9f9",
  //     boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  //   },
  //   list: {
  //     textAlign: "left",
  //     marginBottom: 20,
  //     lineHeight: 1.6,
  //   },
  //   checkboxContainer: {
  //     marginBottom: 20,
  //     display: "flex",
  //     alignItems: "center",
  //     justifyContent: "center",
  //   },
  //   button: {
  //     padding: "10px 25px",
  //     fontSize: 16,
  //     border: "none",
  //     borderRadius: 5,
  //     color: "#fff",
  //   },
  // };
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { examStart } from "../api/api";

export default function Rules() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaAllowed, setMediaAllowed] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const navigate = useNavigate();

  /* =========================
     REQUEST CAMERA + MIC
  ========================= */
  const requestCameraMic = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(mediaStream);
      setMediaAllowed(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Prepare recorder
      mediaRecorderRef.current = new MediaRecorder(mediaStream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

    } catch (err) {
      alert("⚠️ Camera & Microphone access is mandatory to start the exam");
      setMediaAllowed(false);
    }
  };

  /* =========================
     START RECORDING
  ========================= */
  const startRecording = () => {
    if (mediaRecorderRef.current) {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      console.log("🎥 Recording started");
    }
  };

  /* =========================
     STOP RECORDING
  ========================= */
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });

        console.log("🎬 Recording ready:", blob);

        // 🔥 yahan backend upload karega (future)
        // uploadRecording(blob);
      };
    }
  };

  /* =========================
     START EXAM
  ========================= */
  const handleStart = async () => {
    if (!accepted) {
      alert("⚠️ You must accept the rules to start the exam.");
      return;
    }

    if (!mediaAllowed) {
      alert("⚠️ Please allow Camera & Microphone first.");
      return;
    }

    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      startRecording(); // 🎥 START RECORDING

      await examStart(userId);
      navigate("/exam");
    } catch (err) {
      console.error("Failed to start exam", err);
      alert("❌ Unable to start exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>📚 Exam Rules</h1>

      <ul style={styles.list}>
        <li>1. Exam duration is 20 minutes.</li>
        <li>2. Do not switch tabs (4 violations = auto submit).</li>
        <li>3. Copy, paste, right-click & refresh are blocked.</li>
        <li>4. Opening DevTools is prohibited.</li>
        <li>5. Camera & Mic will be recorded during exam.</li>
        <li>6. Once submitted, answers cannot be changed.</li>
        <li>7. Every activity is monitored.</li>
      </ul>

      {/* CAMERA PREVIEW */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{
            width: 230,
            margin: "12px auto",
            borderRadius: 8,
            border: "2px solid green",
            display: "block",
          }}
        />
      )}

      {/* CAMERA BUTTON */}
      <button
        onClick={requestCameraMic}
        style={{
          ...styles.permissionBtn,
          backgroundColor: mediaAllowed ? "#4caf50" : "#f44336",
        }}
      >
        {mediaAllowed ? "✅ Camera & Mic Allowed" : "🎥 Allow Camera & Mic"}
      </button>

      {/* RULE ACCEPT */}
      <div style={styles.checkboxContainer}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <span style={{ marginLeft: 8 }}>
          I have read and agree to the exam rules
        </span>
      </div>

      {/* START BUTTON */}
      <button
        onClick={handleStart}
        disabled={!accepted || !mediaAllowed || loading}
        style={{
          ...styles.startBtn,
          backgroundColor:
            accepted && mediaAllowed && !loading ? "#4caf50" : "#aaa",
          cursor:
            accepted && mediaAllowed && !loading
              ? "pointer"
              : "not-allowed",
        }}
      >
        {loading ? "Starting..." : "Start Exam"}
      </button>
    </div>
  );
}

/* =========================
     STYLES
========================= */
const styles = {
  container: {
    maxWidth: 600,
    margin: "50px auto",
    padding: 20,
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    border: "1px solid #ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  list: {
    textAlign: "left",
    marginBottom: 15,
    lineHeight: 1.6,
  },
  checkboxContainer: {
    margin: "15px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  permissionBtn: {
    padding: "8px 18px",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    marginBottom: 10,
  },
  startBtn: {
    padding: "10px 26px",
    fontSize: 16,
    border: "none",
    borderRadius: 5,
    color: "#fff",
  },
};

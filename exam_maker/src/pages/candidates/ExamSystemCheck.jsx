// pages/candidates/examSystemCheck.jsx
import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, Mic, CheckCircle2, XCircle } from "lucide-react";
import { startCandidateExam } from "../../api/api";
import useCameraMic from "../../hooks/useCameraMic";

export default function ExamSystemCheck() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const {
    camStatus,
    micStatus,
    error: mediaError,
    videoStream,
    requestCamera,
    requestMic,
    bothGranted,
  } = useCameraMic();

  const [starting, setStarting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Bind the video stream to the <video> element once granted
  useEffect(() => {
    if (camStatus === "granted" && videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [camStatus, videoStream]);

const handleContinue = async () => {
  try {
    setStarting(true);
    setSubmitError(null);

    const data = await startCandidateExam(assignmentId);

    console.log("START EXAM RESPONSE:", data);
    console.log("ATTEMPT ID:", data?.data?.attempt?.id);

    if (!data?.data?.attempt?.id) {
      throw new Error("Attempt ID was not returned");
    }
    navigate(`/exam/assignmentID/${data.data.attempt.id}/start`);
  } catch (err) {
    console.error("Failed to start exam:", err);

    setSubmitError(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to start exam. Please try again."
    );
  } finally {
    setStarting(false);
  }
};

  const error = mediaError || submitError;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">
          System Check
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          Allow camera and microphone access to begin your exam.
        </p>

        <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
          {camStatus === "granted" ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera size={28} className="text-slate-600" />
          )}
        </div>

        <PermissionRow
          icon={<Camera size={16} />}
          label="Camera"
          status={camStatus}
          onRequest={requestCamera}
        />
        <PermissionRow
          icon={<Mic size={16} />}
          label="Microphone"
          status={micStatus}
          onRequest={requestMic}
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3 mt-4">
            {error}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!bothGranted || starting}
          className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium mt-5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
        >
          {starting ? "Starting exam..." : "Continue to Exam"}
        </button>
      </div>
    </div>
  );
}

function PermissionRow({ icon, label, status, onRequest }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <span className="text-slate-400">{icon}</span>
        {label}
        {status === "granted" && (
          <CheckCircle2 size={15} className="text-emerald-500 ml-1" />
        )}
        {status === "denied" && (
          <XCircle size={15} className="text-red-500 ml-1" />
        )}
      </div>

      {status === "granted" ? (
        <span className="text-xs font-medium text-emerald-600">Allowed</span>
      ) : (
        <button
          onClick={onRequest}
          disabled={status === "requesting"}
          className="text-xs font-medium px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 transition-colors"
        >
          {status === "requesting"
            ? "Requesting..."
            : status === "denied"
            ? "Retry"
            : "Allow"}
        </button>
      )}
    </div>
  );
}
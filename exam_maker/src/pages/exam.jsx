import { useEffect, useState, useRef, useCallback } from "react";
import questions from "./question"; // 50 question set: 25 MCQ + 25 Code
import "./exam.css";
import Cookies from "js-cookie";
import {  examSubmit } from "../api/api";
const STORAGE_KEY = "exam_answers_v1";
const MAX_VIOLATIONS = 4;

// Fisher-Yates shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Pick random N questions of a given type
function pickQuestions(allQuestions, type, n) {
  const filtered = allQuestions.filter(q => q.type === type);
  return shuffleArray(filtered).slice(0, n);
}

// Random exam generator: 10 MCQ + 10 Code
function generateExamSet(allQuestions) {
  const mcqs = pickQuestions(allQuestions, "mcq", 10).map(q => ({
    ...q,
    options: shuffleArray(q.options), // shuffle MCQ options
  }));
  const codes = pickQuestions(allQuestions, "code", 10);
  return shuffleArray([...mcqs, ...codes]);
}

export default function App() {
  const [questionsSet] = useState(() => generateExamSet(questions));
  const [current, setCurrent] = useState(0);
  const userID = localStorage.getItem("userId");
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const EXAM_STARTED_KEY = "exam_started";
  const [output, setOutput] = useState("");
  const [time, setTime] = useState(20 * 60); // 20 minutes
  const [submitted, setSubmitted] = useState(false);
  const [violationCount, setViolationCount] = useState(0);

  const maliciousTriggered = useRef(false);
  const q = questionsSet[current];

  /* =========================
     SAVE ANSWERS
  ========================= */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  /* =========================
     COMPILE & SUBMIT
  ========================= */
  const compileAndSubmit = useCallback(async (reason = "MANUAL", vCount = null) => {
    if (submitted) return;

    const finalViolations = vCount !== null ? vCount : violationCount;

    const payload = {
      submittedAt: new Date().toISOString(),
      reason,
      violations: finalViolations,
      answers: answers,
      results: questionsSet.map(q => {
        let isCorrect = false;
        if (q.type === "mcq") isCorrect = answers[q.id] === q.answer;

        if (q.type === "code" && answers[q.id]) {
          try {
            isCorrect = q.testCases.every(tc => {
              const args = Array.isArray(tc.input) ? tc.input : [tc.input];
              const match = answers[q.id].match(/function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/);
              if (!match) return false;
              const funcName = match[1];
              const fn = new Function(`${answers[q.id]}; return ${funcName};`)();
              return String(fn(...args)) === String(tc.output);
            });
          } catch { isCorrect = false; }
        }

        return {
          id: q.id,
          type: q.type,
          question: q.question,
          userAnswer: answers[q.id] || null,
          correctAnswer: q.answer || q.testCases,
          isCorrect
        };
      })
    };

    console.log("FINAL SUBMISSION PAYLOAD:", payload);
    
    try {
      const response = await examSubmit(userID, payload);
      if (response) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(EXAM_STARTED_KEY);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        Cookies.remove('exam_token');
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Submission failed", err);
    }
  }, [submitted, violationCount, answers, questionsSet]);

  /* =========================
     REGISTER VIOLATION
  ========================= */
  const registerViolation = useCallback((reason) => {
    if (submitted || maliciousTriggered.current) return;

    setViolationCount(prev => {
      const next = prev + 1;

      if (next >= MAX_VIOLATIONS) {
        maliciousTriggered.current = true;
        compileAndSubmit(reason, next);
      }

      return next;
    });
  }, [submitted, compileAndSubmit]);

  /* =========================
     BLOCK KEYS, DEVTOOLS, REFRESH
  ========================= */
  useEffect(() => {
    const handler = e => {
      const k = e.key.toLowerCase();
      if (
        k === "f5" ||
        k === "f12" ||
        ((e.ctrlKey || e.metaKey) && k === "r") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(k))
      ) {
        e.preventDefault();
        registerViolation("DEVTOOLS_OR_REFRESH");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [registerViolation]);

  /* =========================
     BLOCK COPY / PASTE / RIGHT CLICK
  ========================= */
  useEffect(() => {
    const block = e => {
      e.preventDefault();
      registerViolation("COPY_PASTE");
    };

    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("paste", block);
    document.addEventListener("contextmenu", block);

    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("contextmenu", block);
    };
  }, [registerViolation]);

  /* =========================
     TAB SWITCH DETECTION
  ========================= */
  useEffect(() => {
    const onBlur = () => registerViolation("TAB_SWITCH");
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [registerViolation]);

  /* =========================
     WINDOW CLOSE / RELOAD
  ========================= */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (submitted) return;
      e.preventDefault();
      e.returnValue = "Are you sure you want to finish the exam?";
    };

    const handleUnload = () => {
      Cookies.remove("exam_token");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EXAM_STARTED_KEY);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, [submitted]);

  /* =========================
     TIMER
  ========================= */
  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(t);
          compileAndSubmit("TIME_UP");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [submitted, compileAndSubmit]);

  /* =========================
     RUN CODE
  ========================= */
  const runCode = () => {
    if (!answers[q.id]) {
      setOutput("⚠️ Please write your function first");
      return;
    }

    try {
      const results = q.testCases.map(tc => {
        const args = Array.isArray(tc.input) ? tc.input : [tc.input];
        const code = answers[q.id];

        // extract first function name
        const match = code.match(/function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/);
        if (!match) throw new Error("No function found in your code");

        const funcName = match[1];

        const fn = new Function(`${code}; return ${funcName};`)();
        const res = fn(...args);

        return String(res) === String(tc.output)
          ? `✅ Input: ${JSON.stringify(tc.input)} → ${res}`
          : `❌ Input: ${JSON.stringify(tc.input)} → Expected ${tc.output}, Got ${res}`;
      });

      setOutput(results.join("\n"));
    } catch (e) {
      setOutput("❌ " + e.message);
    }
  };

  if (submitted) return <h1 className="center" style={{ color: "green", display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>✅ Exam Finished</h1>;

  return (
    <div className="container no-copy">
      <header>
        <h2>IT Online Exam</h2>
        <span>⏱ {Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</span>
      </header>

      <p className="muted">
        Violations: {violationCount}/{MAX_VIOLATIONS}
      </p>

      <h3>
        Q{current + 1}. {q.question}
      </h3>

      {q.type === "mcq" &&
        q.options.map(opt => (
          <label key={opt} className="option">
            <input
              type="radio"
              checked={answers[q.id] === opt}
              onChange={() =>
                setAnswers({ ...answers, [q.id]: opt })
              }
            />
            {opt}
          </label>
        ))}

      {q.type === "code" && (
        <>
          <textarea
            value={answers[q.id] || ""}
            onChange={e =>
              setAnswers({ ...answers, [q.id]: e.target.value })
            }
            placeholder={`function ${q.functionName || 'solution'}() {\n\n}`}
          />
          {/* <button className="run" onClick={runCode}>▶ Run Code</button> */}
          {/* {output && <pre>{output}</pre>} */}
        </>
      )}

      <footer>
        <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>Prev</button>
        {current < questionsSet.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)}>Next</button>
        ) : (
          <button className="submit" onClick={() => compileAndSubmit("MANUAL")}>Submit Exam</button>
        )}
      </footer>
    </div>
  );
}
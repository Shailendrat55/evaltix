import React, { useState } from "react";
import CodeEditor from "./codeEditor";

export default function Question({ q, answer = "", setAnswer }) {
  const [output, setOutput] = useState("");

  // MCQ
  if (q.type === "mcq") {
    return (
      <div className="question" style={{ marginBottom: 20 }}>
        <h3>{q.id}. {q.question}</h3>
        {q.options.map((opt, i) => (
          <label key={i} style={{ display: "block", margin: "5px 0" }}>
            <input
              type="radio"
              checked={answer === i}
              onChange={() => setAnswer(i)}
            />{" "}
            {opt}
          </label>
        ))}
      </div>
    );
  }

  // Run code
  const runCode = () => {
    if (!answer.trim()) {
      setOutput("⚠️ Please write code before running");
      return;
    }

    try {
      const fn = new Function(
        "args",
        `
        ${answer}
        return ${q.functionName}(...args);
        `
      );

      const results = q.testCases.map(tc => {
        const args = Array.isArray(tc.input)
          ? tc.input
          : [tc.input];

        const res = fn(args);
        return res === tc.output
          ? "✅ Test passed"
          : `❌ Expected: ${tc.output}, Got: ${res}`;
      });

      setOutput(results.join("\n"));
    } catch (e) {
      setOutput("❌ Error: " + e.message);
    }
  };

  return (
    <div className="question" style={{ marginBottom: 30 }}>
      <h3>{q.id}. {q.question}</h3>

      <CodeEditor code={answer} setCode={setAnswer} />

      <button
        onClick={runCode}
        style={{
          marginTop: 10,
          padding: "6px 14px",
          borderRadius: 6,
          border: "none",
          background: "#2563eb",
          color: "#fff",
          cursor: "pointer"
        }}
      >
        ▶ Run Code
      </button>

      {output && (
        <pre
          style={{
            background: "#111827",
            color: "#e5e7eb",
            padding: 12,
            borderRadius: 6,
            marginTop: 10
          }}
        >
          {output}
        </pre>
      )}
    </div>
  );
}

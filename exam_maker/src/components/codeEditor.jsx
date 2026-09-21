import React from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, setCode }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, marginBottom: 20 }}>
      <Editor
        height="250px"
        defaultLanguage="javascript"
        value={code}
        onChange={setCode}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
}

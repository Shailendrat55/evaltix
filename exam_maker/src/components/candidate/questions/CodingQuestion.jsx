export default function CodingQuestion({
  question,
  value,
  onChange,
}) {
  const code =
    typeof value === "object" && value !== null
      ? value.code
      : value || "";

  const language = question.language || "javascript";

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {question.text || question.question}
      </h2>

      {question.description && (
        <p className="mb-4 text-sm text-gray-600">
          {question.description}
        </p>
      )}

      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase text-gray-500">
          {language}
        </span>
      </div>

      <textarea
        className="min-h-80 w-full rounded-lg border border-gray-300 bg-gray-950 p-4 font-mono text-sm text-white outline-none focus:border-blue-500"
        value={code}
        onChange={(event) =>
          onChange({
            questionId:
              question.questionId ?? question.id,
            language,
            code: event.target.value,
          })
        }
        placeholder="Write your solution here..."
        spellCheck={false}
      />
    </section>
  );
}
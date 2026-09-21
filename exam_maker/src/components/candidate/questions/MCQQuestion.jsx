export default function MCQQuestion({ question, value, onChange }) {
  console.log("FULL MCQ QUESTION:", question);
  console.log("OPTIONS:", question.options);
  console.log("CHOICES:", question.choices);

  const options =
    question.options ||
    question.choices ||
    question.mcqOptions ||
    question.question?.options ||
    question.question?.choices ||
    [];

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {question.description ||
          question.text ||
          question.question?.text ||
          question.question}
      </h2>

      <div className="space-y-3">
        {options.length === 0 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            No MCQ options found.
          </div>
        ) : (
          options.map((option, index) => {
            const optionValue = String(
              option.value ??
                option.id ??
                option.optionId ??
                index
            );

            const optionLabel =
              option.label ??
              option.text ??
              option.optionText ??
              option.value ??
              option;

            return (
              <label
                key={optionValue}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name={`question-${question.attemptQuestionId}`}
                  value={optionValue}
                  checked={String(value?.selectedOptionId ?? value ?? "") === optionValue}
                  onChange={(event) =>
                    onChange({
                      questionId:
                        question.questionId ?? question.id,
                      selectedOptionId: event.target.value,
                    })
                  }
                />

                <span>{optionLabel}</span>
              </label>
            );
          })
        )}
      </div>
    </section>
  );
}
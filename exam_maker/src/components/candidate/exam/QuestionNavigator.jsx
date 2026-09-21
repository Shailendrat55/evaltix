export default function QuestionNavigator({
	questions,
	currentIndex,
	answeredMap,
	onSelect,
}) {
	return (
		<aside className="w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4">
			<h2 className="mb-3 text-sm font-semibold text-gray-700">Questions</h2>
			<div className="grid grid-cols-4 gap-2">
				{questions.map((question, index) => {
					const questionId = question.attemptQuestionId;
					const isCurrent = index === currentIndex;
					const isAnswered = answeredMap[questionId];

					return (
						<button
							key={questionId || index}
							type="button"
							onClick={() => onSelect(index)}
							aria-label={`Go to question ${index + 1}`}
							className={`h-9 rounded border text-sm ${
								isCurrent
									? "border-blue-600 bg-blue-600 text-white"
									: isAnswered
									? "border-green-300 bg-green-50 text-green-700"
									: "border-gray-300 bg-white text-gray-700"
							}`}
						>
							{index + 1}
						</button>
					);
				})}
			</div>
		</aside>
	);
}

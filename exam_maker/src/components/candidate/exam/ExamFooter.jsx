export default function ExamFooter({
	currentIndex,
	totalQuestions,
	onPrevious,
	onNext,
	onSubmit,
}) {
	const isFirstQuestion = currentIndex === 0;
	const isLastQuestion = currentIndex === totalQuestions - 1;

	return (
		<footer className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
			<button
				type="button"
				onClick={onPrevious}
				disabled={isFirstQuestion}
				className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				Previous
			</button>
			<div className="flex gap-3">
				<button
					type="button"
					onClick={onNext}
					disabled={isLastQuestion}
					className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
				>
					Next
				</button>
				<button
					type="button"
					onClick={onSubmit}
					className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
				>
					Submit
				</button>
			</div>
		</footer>
	);
}

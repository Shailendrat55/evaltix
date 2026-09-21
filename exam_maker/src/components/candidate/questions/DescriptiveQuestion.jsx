export default function DescriptiveQuestion({ question, value, onChange }) {
	return (
		<section>
			<h2 className="mb-4 text-lg font-semibold text-gray-900">
				{question.text || question.question}
			</h2>
			<textarea
				className="min-h-64 w-full rounded border border-gray-300 p-3 text-sm"
				value={value || ""}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Type your answer here..."
			/>
		</section>
	);
}

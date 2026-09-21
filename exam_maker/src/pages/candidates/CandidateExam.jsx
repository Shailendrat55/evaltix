import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ExamHeader from "../../components/candidate/exam/ExamHeader";
import QuestionNavigator from "../../components/candidate/exam/QuestionNavigator";
import ExamFooter from "../../components/candidate/exam/ExamFooter";
import MCQQuestion from "../../components/candidate/questions/MCQQuestion";
import DescriptiveQuestion from "../../components/candidate/questions/DescriptiveQuestion";
import CodingQuestion from "../../components/candidate/questions/CodingQuestion";
import { getAttempt, submitAttempt } from "../../api/api";
import useAttempt from "../../hooks/useAttempt";
import useAutoSaveAnswer from "../../hooks/useAutoSaveAnswer";
import LoadingSpinner from "../../components/candidate/common/LoadingSpinner";

export default function CandidateExam() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const {
    attempt,
    questions,
    answers,
    answeredMap,
    loading,
    error,
    setAnswer,
    markAnswered,
  } = useAttempt(attemptId);

  const { status: saveStatus, queueSave, flush } = useAutoSaveAnswer(attemptId);

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];
  console.log("Question",currentQuestion)

  const handleAnswerChange = (answerPayload) => {
    if (!currentQuestion) return;
    const { attemptQuestionId } = currentQuestion;

    setAnswer(attemptQuestionId, answerPayload);
    queueSave(attemptQuestionId, answerPayload);
    markAnswered(attemptQuestionId);
  };

  const goToQuestion = (index) => {
    if (index < 0 || index >= questions.length) return;
    flush(); // make sure any pending save fires before switching questions
    setCurrentIndex(index);
  };

  const handlePrevious = () => goToQuestion(currentIndex - 1);
  const handleNext = () => goToQuestion(currentIndex + 1);

  const handleAutoSubmit = async () => {
    flush();
    try {
      await submitAttempt(attemptId);
    } finally {
      navigate(`/candidate/exam/${attemptId}/submitted`);
    }
  };

  const handleManualSubmitClick = () => {
    flush();
    navigate(`/candidate/exam/${attemptId}/review`);
  };

if (loading) {
  return <LoadingSpinner fullScreen label="Loading exam..." />;
}

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );
  }

  if (!attempt || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No questions found for this attempt.
      </div>
    );
  }

  const renderQuestionInput = () => {
    const savedAnswer = answers[currentQuestion.attemptQuestionId];

    switch (currentQuestion.type) {
      case "MCQ":
        return (
          <MCQQuestion
            question={currentQuestion}
            value={savedAnswer}
            onChange={handleAnswerChange}
          />
        );
      case "DESCRIPTIVE":
        return (
          <DescriptiveQuestion
            question={currentQuestion}
            value={savedAnswer}
            onChange={handleAnswerChange}
          />
        );
      case "CODING":
        return (
          <CodingQuestion
            question={currentQuestion}
            value={savedAnswer}
            onChange={handleAnswerChange}
          />
        );
      default:
        return (
          <div className="text-red-600">
            Unsupported question type: {currentQuestion.type}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ExamHeader
        examTitle={attempt.examTitle}
        currentQuestion={currentIndex + 1}
        totalQuestions={questions.length}
        expiresAt={attempt.expiresAt}
        onExpire={handleAutoSubmit}
      />

      <div className="flex flex-1 overflow-hidden">
        <QuestionNavigator
          questions={questions}
          currentIndex={currentIndex}
          answeredMap={answeredMap}
          onSelect={goToQuestion}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-2 text-sm text-gray-500">
              Question {currentIndex + 1} · {currentQuestion.marks}{" "}
              {currentQuestion.marks === 1 ? "mark" : "marks"}
            </div>

            {renderQuestionInput()}

            {saveStatus !== "idle" && (
              <div className="mt-3 text-xs text-gray-400">
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "Saved"}
                {saveStatus === "error" && (
                  <span className="text-red-500">
                    Failed to save answer — check your connection.
                  </span>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <ExamFooter
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleManualSubmitClick}
      />
    </div>
  );
}
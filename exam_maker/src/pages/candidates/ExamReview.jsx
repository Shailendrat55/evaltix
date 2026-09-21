import { useState } from "react";
import ConfirmSubmitModal from "../../components/candidate/common/ConfirmSubmitModal";
import StatusBadge from "../../components/candidate/common/StatusBadge";
import { submitAttempt } from "../../api/api";

export default function ExamReview({ attemptId, answeredCount, totalQuestions }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      await submitAttempt(attemptId);
      // navigate to /candidate/exam/:attemptId/submitted
    } finally {
      setSubmitting(false);
      setModalOpen(false);
    }
  };

  return (
    <div>
      <StatusBadge status="IN_PROGRESS" />

      <button onClick={() => setModalOpen(true)}>Submit Exam</button>

      <ConfirmSubmitModal
        open={modalOpen}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        submitting={submitting}
      />
    </div>
  );
}
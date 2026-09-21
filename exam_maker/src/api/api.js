import api from "./index";

export const login = async (payload) => {
  try {
    const response = await api.post(`/api/v1/auth/login`, payload);
    if (response) {
      return response;
    }
  } catch (error) {
    alert(error.response.data.message);
    console.error("error while login", error);
  }
};

export const createUser = async (payload) => {
  try {
    const response = await api.post(
      `/api/v1/admin/users`,
      payload
    );

    return response.data;
  } catch (error) {
    console.error("Error while creating user", error);

    alert(
      error.response?.data?.message ||
      "Unable to create candidate"
    );

    throw error;
  }
};

// export const users = async () => {
//   try {
//     const response = await api.get(`/api/v1/admin/users`);
//     if (response) {
//       return response;
//     }
//   } catch (error) {
//     alert(error.response.data.message);
//     console.error("error while fetching users", error);
//   }
// };
export const getCandidates = async () => {
  try {
    const response = await api.get(`/api/v1/admin/users/candidates`);
    if (response) {
      return response;
    } 
  } catch (error) {
    alert(error.response.data.message);
    console.error("error while fetching users", error);
  }
};

export const examStart = async (userId) => {
  try {
    const response = await api.post(`/api/exam/start/${userId}`);
    if (response) {
      return response;
    }
  } catch (error) {
    alert(error.response.data.message);
    console.error("error while exam start", error);
  }
};

export const examSubmit = async (userId, payload) => {
  try {
    const response = await api.post(`/api/exam/submit/${userId}`, payload);
    if (response) {
      return response;
    }
  } catch (error) {
    alert(error.response.data.message);
    console.error("error while exam submit", error);
  }
};

export const createExam = async (payload) => {
  try {
    const response = await api.post(
      `/api/v1/admin/exams`,
      payload
    );

    if (response) {
      return response;
    }

  } catch (error) {
    alert(error.response?.data?.message || "Failed to create exam");
    console.error("error while creating exam", error);
  }
};

export const getExams = async () => {
  try {
    const response = await api.get(`/api/v1/admin/exams`);
    if (response) {
      return response;
    }
  } catch (error) {
    alert(error.response?.data?.message || "Failed to fetch exams");
    console.error("error while fetching exams", error);
  }
};

export const getExamById = async (examId) => {
  try {
    const response = await api.get(`/api/v1/admin/exams/${examId}`);
    if (response) {
      return response;
    }
  } catch (error) {
    alert(error.response?.data?.message || "Failed to fetch exam details");
    console.error("error while fetching exam details", error);
  }
};

export const updateExam = async (id, data) => {
  try {
    const response = await api.put(`/api/v1/admin/exams/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating exam:", error);
    throw error;
  }
};

export const createQuestion = async (payload) => {
  try {
    let endpoint = "";
    switch (payload.type) {
      case "MCQ": endpoint = "/api/v1/admin/questions/mcq"; break;
      case "CODING": endpoint = "/api/v1/admin/questions/coding"; break;
      case "DESCRIPTIVE": endpoint = "/api/v1/admin/questions/descriptive"; break;
      default: throw new Error("Invalid question type");
    }
    const response = await api.post(endpoint, payload);
    return response.data;   // unwrap, like the others
  } catch (error) {
    alert(error.response?.data?.message || error.message || "Failed to create question");
    console.error("Error while creating question:", error);
    throw error;
  }
};

export const bulkUploadMCQCsv = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/api/v1/admin/questions/mcq/bulk-upload-csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getQuestions = async (page = 1, pageSize = 9) => {
    try {
        const response = await api.get("/api/v1/admin/questions", {
            params: { page, pageSize },
        });
        return response.data; // { data, pagination: { page, pageSize, totalCount, totalPages } }
    } catch(error){
        console.error(
            "Error fetching questions",error);
        throw error;
      }
  };

export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/api/v1/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting question", error);
    throw error;
  }
};

export const updateQuestion = async (questionId, payload) => {
  try {
    const response = await api.put(
      `/api/v1/admin/questions/${questionId}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating question", error);
    throw error;
  }
};

export const getQuestionById = async (questionId) => {
  try {
    const response = await api.get(`/api/v1/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching question by ID", error);
    throw error;
  }
};

export const getExamAssignments = async (examId) => {
  try {
    const response = await api.get(`/api/v1/admin/exams/${examId}/assignments`);
    return response.data;
  }
  catch (error) {
    console.error("Error fetching exam assignments", error);
    throw error;
  }
};

export const assignExamToCandidate = async (examId, candidateId) => {
  try {
    const response = await api.post(
      `/api/v1/admin/exam-assignments`,
      {
        candidateId,
        examId: Number(examId),
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error assigning exam to candidate",
      error
    );

    throw error;
  }
};

export const getCandidateAssignments = async (candidateId) => {
  try {
    const response = await api.get(`/api/v1/admin/candidates/${candidateId}/assignments`);
    return response.data;
  }
  catch (error) {
    console.error("Error fetching candidate assignments", error);
    throw error;
  }
};

export const updateAssignment = async (assignmentId, data) => {
  try {
    const response = await api.put(
      `/api/v1/admin/exam-assignments/${assignmentId}`,
      {
        user_id: data.user_id,
        email: data.email,
        exam_id: data.exam_id,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error updating assignment:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const getallCandidates = async () => {
  try {
    const response = await api.get("/api/v1/admin/exam-assignments");

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching candidates:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const getAssignedExam = async () => {
  try {
    const response = await api.get("/api/v1/candidate/exams");

    return response.data;
  } catch(error) {
    console.error(
      "Error fetching candidate's exam:",
      error.response?.data || error.message
    );

    throw error;
  }
}

export const startCandidateExam = async (assignmentId) => {
  try {
    const response = await api.post(
      `/api/v1/candidate/exams/${assignmentId}/start`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error starting exam:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const getAttempt = async (attemptId) => {
  try {
    const response = await api.get(
      `/api/v1/candidate/exams/attempts/${attemptId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching attempt:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const saveAnswer = async (attemptId, attemptQuestionId, answerPayload) => {
  try {
    const response = await api.post(
      `/api/v1/candidate/exams/attempts/${attemptId}/questions/${attemptQuestionId}/answer`,
      answerPayload
    );
    return response.data;
  } catch (error) {
    console.error("Error saving answer:", error.response?.data || error.message);
    throw error;
  }
};

export const submitAttempt = async (attemptId) => {
  try {
    const response = await api.post(`/api/v1/candidate/exams/attempts/${attemptId}/submit`);
    return response.data;
  } catch (error) {
    console.error("Error submitting attempt:", error.response?.data || error.message);
    throw error;
  }
};
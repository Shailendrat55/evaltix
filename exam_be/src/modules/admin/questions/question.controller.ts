import { NextFunction, Request, Response } from "express";

import questionService from "./question.service";

import { bulkCreateMCQFromCsv } from "./services/csv-import.service";
import questionRepository from "./question.repository";


// =====================================
// Create MCQ
// =====================================

export const createMCQ = async (
  req: Request,
  res: Response
) => {
  try {

    const question =
      await questionService.createMCQ(req.body);


    return res.status(201).json({
      success: true,
      message: "MCQ created successfully",
      data: question,
    });


  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};




// =====================================
// Create Coding Question
// =====================================

export const createCoding = async (
  req: Request,
  res: Response
) => {

  try {

    const question =
      await questionService.createCoding(req.body);


    return res.status(201).json({
      success: true,
      message: "Coding question created successfully",
      data: question,
    });


  } catch (error: any) {
    console.log("Error creating coding question:", error);
    return res.status(500).json({
      success: false,
      message: error,
    });

  }

};



// =====================================
// Create Descriptive Question
// =====================================

export const createDescriptive = async (
  req: Request,
  res: Response
) => {

  try {

    const question =
      await questionService.createDescriptive(req.body);


    return res.status(201).json({
      success: true,
      message: "Descriptive question created successfully",
      data: question,
    });


  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};



// =====================================
// Get All Questions
// =====================================

export const getQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 9;

        const result = await questionRepository.getAllQuestions(page, pageSize);
        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};



// =====================================
// Get Question By ID
// =====================================

export const getQuestionById = async (
  req: Request,
  res: Response
) => {

  try {

    const question =
      await questionService.getQuestionById(
        req.params.id
      );


    if(!question){

      return res.status(404).json({
        success:false,
        message:"Question not found"
      });

    }


    return res.status(200).json({
      success:true,
      data:question
    });


  } catch(error:any){

    return res.status(500).json({
      success:false,
      message:error.message
    });

  }

};



// =====================================
// Update Question
// =====================================

export const updateQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const updatedQuestion =
            await questionService.updateQuestion(
                id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message: "Question updated successfully",
            data: updatedQuestion,
        });

    } catch (error: any) {
        console.error("Update question error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update question",
        });
    }
};



// =====================================
// Delete Question
// =====================================

export const deleteQuestion = async (
  req: Request,
  res: Response
) => {

  try {


    await questionService.deleteQuestion(
      req.params.id
    );


    return res.status(200).json({
      success:true,
      message:"Question deleted successfully"
    });


  } catch(error:any){

    return res.status(500).json({
      success:false,
      message:error.message
    });

  }

};

export const bulkUploadMCQCsv = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required (field name: 'file')" });
    }

    const createdBy = (req as any).user?.id;
    const result = await bulkCreateMCQFromCsv(req.file.buffer, createdBy);

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
import { NextFunction, Request, Response } from "express";

import {
  createExamService,
  getAllExamsService,
  getExamByIdService,
  deleteExamByIdService,
  updateExamByIdService
} from "./exams.service";


export const createExamController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    const createdBy = req.user?.email;

    const result = await createExamService(
      data,
      createdBy
    );

    return res.status(201).json({
      success: true,
      message: "Exam created successfully",
      data: result
    });

  } catch (error) {
    next(error);
  }
};

export const getAllExamsController = async (
  req:Request,
  res:Response
)=>{

  try{

    const exams =
      await getAllExamsService();


    res.json({
      success:true,
      data:exams
    });


  }catch(error:any){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

};

export const getExamByIdController = async (
  req:Request,
  res:Response
)=>{
  const { id } = req.params;

  try{
    const exam = await getExamByIdService(id);

    if(!exam){
      return res.status(404).json({
        success:false,
        message:"Exam not found"
      });
    }

    res.json({
      success:true,
      data:exam
    });

  }catch(error:any){
    res.status(500).json({
      success:false,
      message:error.message
    });
  }
};

export const deleteExamByIdController = async (
  req:Request,
  res:Response
)=>{
  const { id } = req.params;


  try{
    await deleteExamByIdService(id);

    res.json({
      success:true,
      message:"Exam deleted successfully"
    });

  }catch(error:any){
    res.status(500).json({
      success:false,
      message:error.message
    });
  }
};

export const updateExamByIdController = async (
  req:Request,
  res:Response
)=>{
  const { id } = req.params;
  const data = req.body;

  try{
    const updatedExam = await updateExamByIdService(id, data);

    if(!updatedExam){
      return res.status(404).json({
        success:false,
        message:"Exam not found"
      });
    }

    res.json({
      success:true,
      message:"Exam updated successfully",
      data:updatedExam
    });

  }catch(error:any){
    res.status(500).json({
      success:false,
      message:error.message
    });
  }

};
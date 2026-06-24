import * as studentService from "../services/student.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";

export const getStudents = asyncHandler(async (req, res) => {
  const { data, meta } = await studentService.listStudents(req.query);
  sendSuccess(res, { message: "Students retrieved", data, meta });
});

export const getStudent = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  sendSuccess(res, { message: "Student retrieved", data: student });
});

export const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: "Student created successfully",
    data: student,
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body);
  sendSuccess(res, { message: "Student updated successfully", data: student });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await studentService.deleteStudent(req.params.id);
  sendSuccess(res, { message: "Student deleted successfully", data: student });
});

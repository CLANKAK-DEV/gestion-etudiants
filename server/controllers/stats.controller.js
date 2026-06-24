import * as studentService from "../services/student.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";

export const getOverview = asyncHandler(async (_req, res) => {
  const stats = await studentService.getStats();
  sendSuccess(res, { message: "Statistics retrieved", data: stats });
});

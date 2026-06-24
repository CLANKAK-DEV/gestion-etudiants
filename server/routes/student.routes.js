import { Router } from "express";
import * as controller from "../controllers/student.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createStudentSchema,
  updateStudentSchema,
  idParamSchema,
  listQuerySchema,
} from "../validators/student.validator.js";

const router = Router();

router
  .route("/")
  .get(validate(listQuerySchema, "query"), controller.getStudents)
  .post(validate(createStudentSchema, "body"), controller.createStudent);

router
  .route("/:id")
  .get(validate(idParamSchema, "params"), controller.getStudent)
  .put(
    validate(idParamSchema, "params"),
    validate(updateStudentSchema, "body"),
    controller.updateStudent,
  )
  .delete(validate(idParamSchema, "params"), controller.deleteStudent);

export default router;

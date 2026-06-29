import { Router } from "express"
import { auth } from "../../middlewares/auth"
import { Role } from "../../../generated/prisma/enums"
import { commentController } from "./comment.controller"

const router = Router()

export const commentRoutes = router

router.post("/",auth(Role.ADMIN,Role.AUTHOR,Role.USER),commentController.createComment)
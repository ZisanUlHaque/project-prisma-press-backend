import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";
import { SubscriptionStatus } from "../../generated/prisma/enums";

export const subscriptionGuard = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId,
      },
    });

    if (!subscription) {
      throw new Error("Please subscribed to get access to premium contents");
    }
    if (subscription?.status !== SubscriptionStatus.ACTIVE) {
      throw new Error("You Are not subscribed");
    }

    next();
  });
};

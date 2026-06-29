import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IcreatePostPayload, IUpdatePostPayload } from "./post.interface";

const createPost = async (payload: IcreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });

  return result;
};
const getAllPosts = async () => {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });

  return posts;
};
const getPostsStats = async() => {
  const tranactionResult = await prisma.$transaction(
    async(tx) =>{
      const totalPost = await tx.post.count();

      const totalPublishedPost = await tx.post.count({
        where : {
          status : PostStatus.PUBLISHED
        }
      })

      const totalDraftPost = await tx.post.count({
        where : {
          status : PostStatus.DRAFT
        }
      })

      const totalArchivedPost = await tx.post.count({
        where : {
          status : PostStatus.ARCHIVED
        }
      })

      const totalComments = await tx.comment.count();

      const totalApprovedComment = await tx.comment.count({
        where : {
          status : CommentStatus.APPROVED
        }
      })

      const totalRejectComment = await tx.comment.count({
        where : {
          status : CommentStatus.REJECT
        }
      })

      const totalPostViewsAggregate = await tx.post.aggregate({
        _sum : {
          views  : true
        }
      })

      const totalPostViews = totalPostViewsAggregate._sum.views

      return {
        totalPost,
        totalDraftPost,
        totalApprovedComment,
        totalArchivedPost,
        totalComments,
        totalPublishedPost,
        totalRejectComment,
        totalPostViews
      }
    }
  );

  return tranactionResult
};

const getMyPosts = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      comments: true,
      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return result;
};

const getPostById = async (postId: string) => {
  //   await prisma.post.update({
  //     where: {
  //       id: postId,
  //     },
  //     data: {
  //       views: {
  //         increment: 1,
  //       },
  //     },
  //   });

  // const post = await prisma.post.findUniqueOrThrow({
  //   where: {
  //     id: postId,
  //   },
  //   include: {
  //     author: {
  //       omit: {
  //         password: true,
  //       },
  //     },
  //     comments: {
  //       where: {
  //         status: CommentStatus.APPROVED,
  //       },
  //       orderBy: {
  //         createdAt: "desc",
  //       },
  //     },
  //     _count: {
  //       select: {
  //         comments: true,
  //       },
  //     },
  //   },
  // });

  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    const post = await tx.post.findUniqueOrThrow({
      where: {
        id: postId,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return post
  });
 return transactionResult
};

const updatePost = async (
  postId: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not owner of this post");
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });

  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not owner of this post");
  }

  const result = await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  return null;
};

export const postService = {
  createPost,
  getAllPosts,
  getPostsStats,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
};

import { prisma } from "~/db.server";

export async function getPosts() {
  return await prisma.post.findMany();
  
  // to get only specific fields
  // return await prisma.post.findMany({select: {title: true, slug: true}});
}
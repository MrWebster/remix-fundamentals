import { LoaderArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import { getPost } from "~/models/post.server";

export const loader = async ({ params }: LoaderArgs) => {
  if (!params.slug) throw new Error("Slug doesn't exist");

  const post = await getPost(params.slug);

  if (!post) throw new Error("Post not found");

  return json({
    post,
    html: marked(post.markdown), // here we can run this library on the server side so that it's not needed on the client.
  });
};

export default function Post() {
  const { post, html } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}

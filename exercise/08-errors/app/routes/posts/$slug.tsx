import { marked } from "marked";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getPost } from "~/models/post.server";

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();

  if (caught.status === 404) {
    return <div>Post not found: {params.slug}</div>;
  }

  return <div>unexpected error</div>;
}

export async function loader({ params }: LoaderArgs) {
  invariant(params.slug, `params.slug is required`);

  const post = await getPost(params.slug);
  if (!post) {
    throw new Response("not found", { status: 404 });
  }

  const html = marked(post.markdown);
  return json({ post, html });
}

export default function PostSlug() {
  const { post, html } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}

// 🐨 Add an ErrorBoundary component to this
// 💰 You can use the ErrorFallback component from "~/components"

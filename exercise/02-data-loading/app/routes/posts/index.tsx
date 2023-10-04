import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getPosts } from "~/models/posts.server";

export async function loader() {
  const posts = await getPosts();
  return json({
    posts,
  }); // <-- send the data from your backend
}

export default function Posts() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <main>
      <h1>Posts</h1>
      {posts.map((post) => (
        <div key={post.slug}>{post.title}</div>
      ))}
    </main>
  );
}

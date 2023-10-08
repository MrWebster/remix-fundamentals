import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import invariant from "tiny-invariant";

// 🐨 you'll need to import `deletePost` and `updatePost` here as well.
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "~/models/post.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.slug, "slug not found");
  if (params.slug === "new") {
    return json({ post: null });
  }

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);
  return json({ post });
}

// 🐨 you'll need the `params` in the action
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  invariant(typeof intent === "string", "unknown form intent");

  if (intent === "delete") {
    invariant(typeof params.slug === "string", "slug undefined");
    await deletePost(params.slug);
    return redirect("/posts/admin");
  }

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");
  console.log(title, slug, markdown);

  const errors = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  // 🐨 if the params.slug is "new" then create a new post
  // otherwise update the post.
  if (intent === "create") {
    await createPost({ title, slug, markdown });
  } else {
    await updatePost({ title, slug, markdown });
  }

  return redirect("/posts/admin");
}

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function PostAdmin() {
  const data = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  const transition = useTransition();
  // 🐨 now that there can be multiple transitions on this page
  // we'll need to disambiguate between them. You can do that with
  // the "intent" in the form data.
  // 💰 transition.submission?.formData.get("intent")
  const intent = transition.submission?.formData.get("intent");
  const isSubmitting = Boolean(transition.submission);
  // 🐨 create an isUpdating and isDeleting variable based on the transition
  // 🐨 create an isNewPost variable based on whether there's a post on `data`.
  const isCreating = Boolean(intent === "create" && transition.submission);
  const isUpdating = Boolean(intent === "update" && transition.submission);
  const isDeleting = Boolean(intent === "delete" && transition.submission);
  const isNewPost = Boolean(data.post === null);

  return (
    <Form method="post">
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input
            type="text"
            name="title"
            className={inputClassName}
            key={data?.post?.slug ?? "new"}
            defaultValue={data?.post?.title}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input
            type="text"
            name="slug"
            className={`${inputClassName} disabled:opacity-60`}
            key={data?.post?.slug ?? "new"}
            defaultValue={data?.post?.slug}
            disabled={Boolean(data.post)}
          />
        </label>
        {isNewPost ? null : (
          <input type="hidden" name="slug" value={data?.post?.slug} />
        )}
      </p>
      <p>
        <label htmlFor="markdown">
          Markdown:{" "}
          {errors?.markdown ? (
            <em className="text-red-600">{errors.markdown}</em>
          ) : null}
        </label>
        <br />
        <textarea
          id="markdown"
          rows={8}
          name="markdown"
          className={`${inputClassName} font-mono`}
          key={data?.post?.slug ?? "new"}
          defaultValue={data?.post?.markdown}
        />
      </p>
      <div className="flex justify-end gap-4">
        {!isNewPost ? (
          <p className="text-right">
            <button
              type="submit"
              // 🐨 add a name of "intent" and a value of "create" if this is a new post or "update" if it's an existing post
              name="intent"
              value="delete"
              className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
              // 🐨 this should be disabled if we're creating *or* updating
              disabled={isSubmitting}
            >
              {/* 🐨 if this is a new post then this works fine as-is, but if we're updating it should say "Updating..." / "Update" */}
              {isDeleting ? "Deleting..." : "Delete Post"}
            </button>
          </p>
        ) : null}
        {/* 💰 The button's "name" prop should be "intent" and the "value" prop should be "delete" */}
        {/* 💰 Here's some good looking classes for it: className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300" */}
        {/* 🐨 It should say "Deleting..." when a submission with the intent "delete" is ongoing, and "Delete" otherwise. */}
        {isNewPost ? (
          <p className="text-right">
            <button
              type="submit"
              name="intent"
              value="create"
              // 🐨 add a name of "intent" and a value of "create" if this is a new post or "update" if it's an existing post
              className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
              // 🐨 this should be disabled if we're creating *or* updating
              disabled={isSubmitting}
            >
              {/* 🐨 if this is a new post then this works fine as-is, but if we're updating it should say "Updating..." / "Update" */}
              {isCreating ? "Creating..." : "Create Post"}
            </button>
          </p>
        ) : (
          <p className="text-right">
            <button
              type="submit"
              name="intent"
              value="update"
              // 🐨 add a name of "intent" and a value of "create" if this is a new post or "update" if it's an existing post
              className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
              // 🐨 this should be disabled if we're creating *or* updating
              disabled={isSubmitting}
            >
              {/* 🐨 if this is a new post then this works fine as-is, but if we're updating it should say "Updating..." / "Update" */}
              {isUpdating ? "Updating..." : "Update Post"}
            </button>
          </p>
        )}
      </div>
    </Form>
  );
}

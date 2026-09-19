import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import type { BlogPostRow } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBlogsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const posts = (data ?? []) as BlogPostRow[];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{posts.length} posts</p>
          <p className="mt-0.5 text-xs text-stone-400">
            Create rich posts with cover photos and formatted content.
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1f5c45] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174a37]"
        >
          <Plus className="h-4 w-4" />
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-[#d8e0d6] bg-white px-5 py-12 text-center text-sm text-muted shadow-sm">
          No blog posts yet. Create your first post with the rich editor.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#d8e0d6] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#f3f6f2] text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Post</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eee6]">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#f8faf7]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f3f6f2]">
                          {post.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#0f2a22]">
                            {post.title}
                          </p>
                          <p className="truncate text-xs text-muted">{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#0f2a22]">{post.category}</td>
                    <td className="px-5 py-3">
                      <PublishedBadge published={post.published} />
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {new Date(post.created_at).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/blogs/${post.id}`}
                          className="rounded-lg border border-[#d8e0d6] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1f5c45] hover:bg-[#f3f6f2]"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          table="blog_posts"
                          id={post.id}
                          confirmMessage={`Delete “${post.title}”?`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

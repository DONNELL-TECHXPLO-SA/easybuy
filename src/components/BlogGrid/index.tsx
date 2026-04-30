import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import BlogItem from "../Blog/BlogItem";
import { createClient } from "@/lib/supabase/server";

type BlogRow = {
  id: number;
  title: string;
  img: string;
  views: number;
  published_at: string | null;
};

const BlogGrid = async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, img, views, published_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(12);

  const posts = (data ?? []) as BlogRow[];

  return (
    <>
      <Breadcrumb title={"Blog Grid"} pages={["blog grid"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {posts.length === 0 ? (
            <p className="text-center text-dark-4">No blog posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-7.5">
              {posts.map((p) => (
                <BlogItem
                  key={p.id}
                  blog={{
                    title: p.title,
                    img: p.img,
                    views: p.views,
                    date: p.published_at
                      ? new Date(p.published_at).toLocaleDateString("en-ZA", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogGrid;

import { getPost, getAdjacentPosts, getBlogPosts } from "@/data/blog";
import { PostHeader } from "@/components/blog/PostHeader";
import { BlogContent } from "@/components/blog/BlogContent";
import { CommentBox } from "@/components/blog/CommentBox";
import { PostNavigation } from "@/components/blog/PostNavigation";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSafeHtmlServer } from "@/lib/sanitize-server";

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate dynamic metadata for each blog post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  const { title, summary, publishedAt, image, authors } = post.metadata;
  const ogImage = image
    ? (image.startsWith("http") ? image : `https://8gent.app${image}`)
    : "https://8gent.app/8gent-logo.png";

  return {
    title: `${title} | 8gent Blog`,
    description: summary,
    keywords: [
      "8gent",
      "8gent blog",
      title,
      "AI",
      "Product Strategy",
      "Technology",
      "Dublin Ireland",
      "Creative Technologist",
      ...(authors?.map((a) => a.name) || []),
    ],
    authors: authors?.map((a) => ({ name: a.name })) || [
      { name: "8gent", url: "https://8gent.app" },
    ],
    openGraph: {
      title: title,
      description: summary,
      url: `https://8gent.app/blog/${slug}`,
      type: "article",
      publishedTime: publishedAt,
      authors: authors?.map((a) => a.name) || ["8gent"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title: title,
      description: summary,
      card: "summary_large_image",
      creator: "@James__Spalding",
      images: [ogImage],
    },
    alternates: {
      canonical: `https://8gent.app/blog/${slug}`,
    },
  };
}

export default async function Blog({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const { title, publishedAt, summary, gradient, authors, image } = post.metadata;
  const { previousPost, nextPost } = await getAdjacentPosts(slug);

  return (
    <div className="min-h-screen">
      {/* Structured data for SEO */}
      <ArticleJsonLd
        title={title}
        description={summary}
        publishedAt={publishedAt}
        slug={post.slug}
        authors={authors}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://8gent.app" },
          { name: "Blog", url: "https://8gent.app/blog" },
          { name: title, url: `https://8gent.app/blog/${post.slug}` },
        ]}
      />

      {/* Content wrapper with subtle animation */}
      <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
        <div className="py-8 lg:py-12">
          <PostHeader
            title={title}
            summary={summary}
            publishedAt={publishedAt}
            authors={authors || []}
          />

          <BlogContent
            heroImageGradient={gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}
            imageCaption={undefined}
            postSlug={post.slug}
            heroImageUrl={image}
          >
            {/* SECURITY: Sanitize HTML to prevent XSS even from trusted MDX sources */}
            <div dangerouslySetInnerHTML={createSafeHtmlServer(post.source)} />
          </BlogContent>

          {/* Post Navigation - Previous/Next */}
          <div className="max-w-4xl mx-auto mt-8 sm:mt-12">
            <PostNavigation previousPost={previousPost} nextPost={nextPost} />
          </div>

          <div className="max-w-4xl mx-auto mt-12 sm:mt-16 lg:mt-20">
            <CommentBox postId={post.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}

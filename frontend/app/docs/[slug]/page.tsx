import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocArticleClient from "./DocArticleClient";
import { docsData } from "../data";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(docsData).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = docsData[slug];

  if (!article) {
    return {
      title: "Doc Not Found | EMBLE",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = `https://emble.in/docs/${slug}`;

  return {
    title: `${article.title} | EMBLE Docs`,
    description: article.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${article.title} | EMBLE Docs`,
      description: article.description,
      url: canonicalUrl,
      siteName: "EMBLE",
      type: "article",
    },
  };
}

export default async function DocArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = docsData[slug];

  if (!article) {
    notFound();
  }

  return <DocArticleClient article={article} />;
}

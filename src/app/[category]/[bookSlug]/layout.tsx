import type { Metadata } from "next";
import { findBookBySlug } from "../../../utils/slugify";
import type { Book } from "../../../types";
import JsonLd from "../../../components/JsonLd";

async function fetchAllBooks(): Promise<Book[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const res = await fetch(`${baseUrl}/api/v1/books`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function resolveBook(
  params: Promise<{ bookSlug: string; category: string }>
): Promise<{ book: Book | null; bookSlug: string; category: string }> {
  const { bookSlug, category } = await params;
  if (!bookSlug) return { book: null, bookSlug: "", category };
  const books = await fetchAllBooks();
  const found = findBookBySlug(books ?? [], bookSlug);
  return { book: found ?? null, bookSlug, category };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookSlug: string; category: string }>;
}): Promise<Metadata> {
  const { book, bookSlug, category } = await resolveBook(params);
  if (!book) {
    return { title: "Book Not Found" };
  }

  const title = book.title;
  const description =
    book.description?.length > 160
      ? book.description.slice(0, 157) + "..."
      : book.description || `Explore "${book.title}" by Sayyid Abul A'la Maududi`;

  return {
    title,
    description,
    openGraph: {
      title: book.title,
      description,
      type: "book",
      locale: "en_US",
      siteName: "Maududi's Legacy",
      url: `/${category}/${bookSlug}`,
      images: book.imageUrl
        ? [{ url: book.imageUrl, alt: book.title }]
        : [{ url: "/logo.png", width: 160, height: 40, alt: "Maududi's Legacy" }],
    },
    twitter: {
      card: "summary_large_image",
      title: book.title,
      description,
      images: book.imageUrl ? [book.imageUrl] : ["/logo.png"],
    },
    other: {
      "book:author": "https://jamaat.org/founder",
      "book:tag": book.category || "Islamic scholarship",
    },
  };
}

export default async function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ bookSlug: string; category: string }>;
}) {
  const { book, bookSlug, category } = await resolveBook(params);

  return (
    <>
      {book && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "Book",
          name: book.title,
          author: {
            "@type": "Person",
            name: "Sayyid Abul A'la Maududi",
            url: "https://jamaat.org/founder",
          },
          description: book.description?.slice(0, 500),
          image: book.imageUrl,
          about: {
            "@type": "Thing",
            name: book.category || "Islamic Scholarship",
          },
          inLanguage: ["en", "ur", "ar"],
          isAccessibleForFree: true,
          url: `/${category}/${bookSlug}`,
        }} />
      )}
      {children}
    </>
  );
}

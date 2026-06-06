import type { Metadata } from "next";
import { deslugifyCategory } from "../../utils/slugify";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const title = category ? deslugifyCategory(category) : 'All Books';
  return { title };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";
import { BlogEditor } from "@/features/blogs/components/blog-editor";
export const metadata: Metadata = { title: "Edit Blog" };
export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <BlogEditor blogId={id} />; }

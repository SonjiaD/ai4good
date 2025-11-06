// src/api/images.ts
export type StoryImage = {
  url: string;
  page?: number;
  prompt?: string;
  error?: string;
};

export type StoryResponse = {
  message: string;
  count: number;
  images: StoryImage[];
};

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://localhost:5000/api";

export async function generateImagesFromPdf(
  file: File,
  opts?: { max_pages?: number; size?: string }
): Promise<StoryResponse> {
  const fd = new FormData();
  fd.append("pdf", file);
  if (opts?.max_pages) fd.append("max_pages", String(opts.max_pages));
  if (opts?.size) fd.append("size", opts.size);
  else fd.append("size", "1024x1024");

  const res = await fetch(`${API_BASE}/images/story`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

// If you really want the old name, re-export it like this:
// export const uploadStoryForImages = generateImagesFromPdf;

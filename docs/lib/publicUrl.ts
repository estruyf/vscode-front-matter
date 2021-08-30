

export function publicUrl() {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
    return `https://frontmatter.codes`;
  } else {
    return `https://${process.env.VERCEL_URL}`;
  }
}
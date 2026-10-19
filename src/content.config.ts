import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    // Drafts are built only by `pnpm dev`, never into the deployed site.
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };

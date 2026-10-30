import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const photographersCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/photographers" }),
  schema: z.object({
    name: z.string(),
    image: z.string(),
    uniqueId: z.string(),
    location: z.string().optional(),
    social: z.object({
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      email: z.string().optional(),
      facebook: z.string().optional(),
      linkedin: z.string().optional(),
      website: z.string().optional(),
    }),
  }),
});

const photosCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/photos" }),
  schema: z.object({
    title: z.string(),
    photographer: z.string(),
    category: z.string(),
    photographerId: z.string(),
    image: z.string(),
    year: z.number(),
    featured: z.boolean().optional(),
  }),
});

const categoriesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/categories" }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
  }),
});

export const collections = {
  "photographers": photographersCollection,
  "photos": photosCollection,
  "categories": categoriesCollection,
};

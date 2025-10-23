import { defineCollection, z } from "astro:content";

const photographersCollection = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    image: z.string(),
    slug: z.string(),
    social: z.object({
      twitter: z.string().optional(),
      instagram: z.string().optional(),
    }),
  }),
});

const photosCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    photographer: z.string(),
    category: z.string(),
    slug: z.string(),
    image: z.string(),
    year: z.number(),
  }),
});

export const collections = {
  "photographers": photographersCollection,
  "photos": photosCollection,
};

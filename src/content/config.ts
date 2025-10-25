import { defineCollection, z } from "astro:content";

const photographersCollection = defineCollection({
  type: "content",
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
  type: "content",
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

export const collections = {
  "photographers": photographersCollection,
  "photos": photosCollection,
};

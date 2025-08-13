// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const eventsCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    seoTitle: z.string(),
    seoDescription: z.string(),
    socialImage: image().optional(),

    eventName: z.string(),
    eventDate: z.date(),
    eventYear: z.string(),
    eventJobs: z.array(z.string()),
    eventFormats: z.array(z.string()),
    
    eventFeaturedMedia: z.object({
        type: z.enum(['image', 'youtube']),
        // CORRECTED: Use image() for local image files
        src: image().optional(), 
        videoId: z.string().optional(),
        alt: z.string(),
    }),
    eventGallery: z.array(z.object({
        type: z.enum(['image', 'youtube']),
        // CORRECTED: Use image() for local image files
        src: image().optional(), 
        videoId: z.string().optional(),
        title: z.string(),
    }))
  }),
});





// NEW: Add a collection for your journal posts
const journalCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    tag: z.string(),
    date: z.date(),
    mediaType: z.enum(['image', 'video']),
    // CORRECTED: Remove the .extend() call
    mediaSrc: image().optional(),
    videoSrc: z.string().optional(),
    author: z.string(),
    postType: z.enum(['internal', 'external']),
    externalUrl: z.string().optional(), 
  }),
});


export const collections = {
  'events': eventsCollection,
  'journal': journalCollection, // The key 'journal' must match the folder name
};
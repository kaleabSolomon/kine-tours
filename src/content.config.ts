import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One full-bleed etching section per place. The markdown body is the intro copy.
const places = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/places' }),
	schema: ({ image }) =>
		z.object({
			order: z.number(),
			name: z.string(), // full name, e.g. "Lion of Judah"
			title: z.string(), // the huge word set in the sky, e.g. "Judah"
			kicker: z.string(), // italic line beside the title, e.g. "the lion of"
			coordinates: z.string(),
			region: z.string(),
			ink: z.enum(['axum', 'lalibela', 'lion']), // maps to --color-ink-<ink>
			titleSide: z.enum(['left', 'right']),
			image: image(),
			imageAlt: z.string(),
			imagePosition: z.string().default('center bottom'),
			cta: z.string(), // primary button label, e.g. "See the unseen Axum"
		}),
});

// Upcoming journeys. The markdown body is the short description.
const journeys = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/journeys' }),
	schema: ({ image }) =>
		z.object({
			order: z.number(),
			title: z.string(),
			place: reference('places'),
			dates: z.string(),
			length: z.string(),
			priceFrom: z.number(), // USD
			image: image(),
			imageAlt: z.string(),
			imagePosition: z.string().default('center 80%'),
		}),
});

export const collections = { places, journeys };

import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  real,
  timestamp,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nativeName: varchar("native_name", { length: 100 }).notNull(),
  flag: varchar("flag", { length: 10 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userLanguages = pgTable(
  "user_languages",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    languageId: integer("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "cascade" }),
    translationLanguageId: integer("translation_language_id").references(
      () => languages.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_language_unique_idx").on(table.userId, table.languageId),
    index("user_languages_user_id_idx").on(table.userId),
  ]
);

export const vocabulary = pgTable(
  "vocabulary",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    languageId: integer("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "cascade" }),
    word: text("word").notNull(),
    meaning: text("meaning").notNull(),
    pronunciation: text("pronunciation"),
    partOfSpeech: varchar("part_of_speech", { length: 50 }),
    status: varchar("status", { length: 20 }).default("new").notNull(), // new, learning, familiar, strong, mastered
    recognitionScore: integer("recognition_score").default(0).notNull(),
    recallScore: integer("recall_score").default(0).notNull(),
    reviewCount: integer("review_count").default(0).notNull(),
    correctCount: integer("correct_count").default(0).notNull(),
    wrongCount: integer("wrong_count").default(0).notNull(),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }).defaultNow().notNull(),
    intervalDays: integer("interval_days").default(0).notNull(),
    easeFactor: real("ease_factor").default(2.5).notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("vocabulary_user_lang_idx").on(table.userId, table.languageId),
    index("vocabulary_user_status_idx").on(table.userId, table.status),
    index("vocabulary_user_next_review_idx").on(table.userId, table.nextReviewAt),
    index("vocabulary_user_created_at_idx").on(table.userId, table.createdAt),
  ]
);

export const vocabularyExamples = pgTable("vocabulary_examples", {
  id: serial("id").primaryKey(),
  vocabularyId: integer("vocabulary_id")
    .notNull()
    .references(() => vocabulary.id, { onDelete: "cascade" }),
  sentence: text("sentence").notNull(),
  translation: text("translation"),
  source: text("source"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vocabularyReviews = pgTable(
  "vocabulary_reviews",
  {
    id: serial("id").primaryKey(),
    vocabularyId: integer("vocabulary_id")
      .notNull()
      .references(() => vocabulary.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    reviewType: varchar("review_type", { length: 20 }).notNull(), // recognition, recall
    isCorrect: boolean("is_correct").notNull(),
    difficulty: varchar("difficulty", { length: 20 }).notNull(), // forgot, hard, good, easy
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("reviews_vocab_reviewed_at_idx").on(table.vocabularyId, table.reviewedAt),
    index("reviews_user_id_idx").on(table.userId),
  ]
);

export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("tags_user_name_unique_idx").on(table.userId, table.name),
  ]
);

export const vocabularyTags = pgTable(
  "vocabulary_tags",
  {
    vocabularyId: integer("vocabulary_id")
      .notNull()
      .references(() => vocabulary.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.vocabularyId, table.tagId] }),
  ]
);

// Drizzle Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  userLanguages: many(userLanguages),
  vocabulary: many(vocabulary),
  tags: many(tags),
}));

export const languagesRelations = relations(languages, ({ many }) => ({
  userLanguages: many(userLanguages),
  vocabulary: many(vocabulary),
}));

export const userLanguagesRelations = relations(userLanguages, ({ one }) => ({
  language: one(languages, {
    fields: [userLanguages.languageId],
    references: [languages.id],
  }),
  translationLanguage: one(languages, {
    fields: [userLanguages.translationLanguageId],
    references: [languages.id],
  }),
}));

export const vocabularyRelations = relations(vocabulary, ({ one, many }) => ({
  language: one(languages, {
    fields: [vocabulary.languageId],
    references: [languages.id],
  }),
  examples: many(vocabularyExamples),
  reviews: many(vocabularyReviews),
  tags: many(vocabularyTags),
}));

export const vocabularyExamplesRelations = relations(vocabularyExamples, ({ one }) => ({
  vocabulary: one(vocabulary, {
    fields: [vocabularyExamples.vocabularyId],
    references: [vocabulary.id],
  }),
}));

export const vocabularyReviewsRelations = relations(vocabularyReviews, ({ one }) => ({
  vocabulary: one(vocabulary, {
    fields: [vocabularyReviews.vocabularyId],
    references: [vocabulary.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  vocabulary: many(vocabularyTags),
}));

export const vocabularyTagsRelations = relations(vocabularyTags, ({ one }) => ({
  vocabulary: one(vocabulary, {
    fields: [vocabularyTags.vocabularyId],
    references: [vocabulary.id],
  }),
  tag: one(tags, {
    fields: [vocabularyTags.tagId],
    references: [tags.id],
  }),
}));

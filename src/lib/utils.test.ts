import test from "node:test";
import assert from "node:assert/strict";
import { normalizeWord, compareRecallAnswer } from "./utils";

test("Vocabulary Normalization & Answer Matching", async (t) => {
  await t.test("normalizes whitespace and case", () => {
    assert.equal(normalizeWord("  Gemütlich  "), "gemütlich");
    assert.equal(normalizeWord("Hello    World"), "hello world");
    assert.equal(normalizeWord("BONJOUR"), "bonjour");
  });

  await t.test("compareRecallAnswer handles case, whitespace, and punctuation", () => {
    assert.ok(compareRecallAnswer("gemütlich", "gemütlich"));
    assert.ok(compareRecallAnswer(" Gemütlich! ", "gemütlich"));
    assert.ok(compareRecallAnswer("l'amour.", "l'amour"));
    assert.ok(compareRecallAnswer("  der Hund  ", "der hund"));
    assert.ok(!compareRecallAnswer("gemütlich", "gemutlich"), "umlaut differences should not falsely match");
    assert.ok(!compareRecallAnswer("apple", "banana"));
  });
});

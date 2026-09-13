import test from "node:test";
import assert from "node:assert/strict";
import {
  createVocabulary,
  getVocabularyForUser,
  getVocabularyByIdForUser,
  updateVocabulary,
  deleteVocabulary,
  findDuplicateWord,
  reorderVocabulary,
} from "./vocabulary";
import { getReviewQueue, submitReview } from "./reviews";

test("Vocabulary CRUD, Duplicate Detection, and Authorization", async (t) => {
  const timestamp = Date.now();
  const userA = `test_user_a_${timestamp}`;
  const userB = `test_user_b_${timestamp}`;
  const langId = 2; // German

  let createdWordId: number;

  await t.test("user can create a vocabulary item", async () => {
    const res = await createVocabulary(userA, {
      languageId: langId,
      word: "seltsam",
      meaning: "aneh / janggal (strange)",
      pronunciation: "ˈzɛltzaːm",
      partOfSpeech: "adjective",
      exampleSentence: "Das ist sehr seltsam.",
      exampleTranslation: "Itu sangat aneh.",
    });

    assert.ok(res.success, "Word should be created successfully");
    assert.ok(res.item, "Created item should exist");
    assert.equal(res.item.status, "new");
    assert.equal(res.item.word, "seltsam");
    createdWordId = res.item.id;
  });

  await t.test("duplicate detection prevents creating the same word in same language", async () => {
    // Exact same with different casing & spacing
    const dupRes = await createVocabulary(userA, {
      languageId: langId,
      word: "  Seltsam  ",
      meaning: "another meaning",
    });

    assert.equal(dupRes.success, false, "Should reject duplicate word");
    assert.ok(dupRes.duplicate, "Should return existing duplicate word");
    assert.equal(dupRes.duplicate?.id, createdWordId);
  });

  await t.test("same word in different language is allowed", async () => {
    const englishLangId = 1;
    const diffLangRes = await createVocabulary(userA, {
      languageId: englishLangId,
      word: "seltsam",
      meaning: "borrowed word in english",
    });

    assert.ok(diffLangRes.success, "Allowed in different language");
  });

  await t.test("user can access their own vocabulary", async () => {
    const word = await getVocabularyByIdForUser(userA, createdWordId);
    assert.ok(word);
    assert.equal(word?.word, "seltsam");
  });

  await t.test("user B cannot access user A vocabulary (Authorization isolation)", async () => {
    const word = await getVocabularyByIdForUser(userB, createdWordId);
    assert.equal(word, null, "User B must not see User A's vocabulary item");

    const userBList = await getVocabularyForUser(userB);
    const hasWord = userBList.some((w) => w.id === createdWordId);
    assert.equal(hasWord, false, "User B list must not include User A's word");
  });

  await t.test("user B cannot update user A vocabulary", async () => {
    const updateRes = await updateVocabulary(userB, createdWordId, {
      meaning: "Hacked meaning",
    });
    assert.equal(updateRes, null, "User B must fail to update User A's word");

    // Verify word was not updated
    const word = await getVocabularyByIdForUser(userA, createdWordId);
    assert.equal(word?.meaning, "aneh / janggal (strange)");
  });

  await t.test("user B cannot delete user A vocabulary", async () => {
    const deleteRes = await deleteVocabulary(userB, createdWordId);
    assert.equal(deleteRes, false, "User B must fail to delete User A's word");

    // Verify word still exists
    const word = await getVocabularyByIdForUser(userA, createdWordId);
    assert.ok(word, "Word must still exist");
  });

  await t.test("user A can update their vocabulary", async () => {
    const updated = await updateVocabulary(userA, createdWordId, {
      meaning: "aneh atau ganjil (strange / weird)",
    });
    assert.ok(updated);
    assert.equal(updated?.meaning, "aneh atau ganjil (strange / weird)");
  });

  await t.test("review queue includes new and due words and prioritizes correctly", async () => {
    const queue = await getReviewQueue(userA, langId);
    assert.ok(queue.length > 0);
    const target = queue.find((q) => q.id === createdWordId);
    assert.ok(target, "Newly created word should be in review queue");
    assert.ok(target?.options && target.options.length >= 4, "Recognition distractors generated");
  });

  await t.test("submitting a review updates next review date and logs history", async () => {
    const reviewResult = await submitReview(userA, {
      vocabularyId: createdWordId,
      reviewType: "recognition",
      difficulty: "good",
    });

    assert.ok(reviewResult);
    assert.equal(reviewResult?.vocabulary.status, "learning");
    assert.equal(reviewResult?.vocabulary.correctCount, 1);
    assert.ok(reviewResult?.vocabulary.nextReviewAt.getTime() > Date.now());
  });

  await t.test("user A can delete their vocabulary item", async () => {
    const deleted = await deleteVocabulary(userA, createdWordId);
    assert.equal(deleted, true);

    const check = await getVocabularyByIdForUser(userA, createdWordId);
    assert.equal(check, null);
  });

  await t.test("reorderVocabulary updates orderIndex and persists custom sorting", async () => {
    const w1 = await createVocabulary(userA, { languageId: langId, word: "eins", meaning: "one", status: "new" });
    const w2 = await createVocabulary(userA, { languageId: langId, word: "zwei", meaning: "two", status: "new" });
    const w3 = await createVocabulary(userA, { languageId: langId, word: "drei", meaning: "three", status: "new" });

    assert.ok(w1.item && w2.item && w3.item);

    // Reorder so w3 is first, then w1, then w2
    const success = await reorderVocabulary(userA, [
      { id: w3.item.id, status: "new", orderIndex: 0 },
      { id: w1.item.id, status: "new", orderIndex: 1 },
      { id: w2.item.id, status: "new", orderIndex: 2 },
    ]);
    assert.equal(success, true);

    const list = await getVocabularyForUser(userA, langId, { sortBy: "custom" });
    const newItems = list.filter((i) => ["eins", "zwei", "drei"].includes(i.word));
    assert.equal(newItems.length, 3);
    assert.equal(newItems[0].word, "drei");
    assert.equal(newItems[1].word, "eins");
    assert.equal(newItems[2].word, "zwei");
  });
});

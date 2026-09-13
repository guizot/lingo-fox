import test from "node:test";
import assert from "node:assert/strict";
import { calculateNextReview } from "./algorithm";

test("Spaced Repetition Algorithm", async (t) => {
  const baseDate = new Date("2026-01-01T12:00:00Z");

  await t.test("new word moves to learning on first successful review", () => {
    const newWord = {
      status: "new" as const,
      intervalDays: 0,
      easeFactor: 2.5,
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0,
      recognitionScore: 0,
      recallScore: 0,
    };

    const result = calculateNextReview(newWord, "good", "recognition", baseDate);

    assert.equal(result.status, "learning");
    assert.equal(result.intervalDays, 1);
    assert.equal(result.correctCount, 1);
    assert.equal(result.wrongCount, 0);
    assert.equal(result.reviewCount, 1);
    assert.ok(result.recognitionScore > 0);
    // Scheduled for next day
    assert.equal(result.nextReviewAt.toISOString(), "2026-01-02T12:00:00.000Z");
  });

  await t.test("wrong answer (forgot) demotes status and sets interval to 1 day", () => {
    const strongWord = {
      status: "strong" as const,
      intervalDays: 7,
      easeFactor: 2.5,
      reviewCount: 5,
      correctCount: 5,
      wrongCount: 0,
      recognitionScore: 80,
      recallScore: 80,
    };

    const result = calculateNextReview(strongWord, "forgot", "recall", baseDate);

    assert.equal(result.status, "familiar", "strong should demote to familiar on wrong");
    assert.equal(result.intervalDays, 1, "wrong words must be reviewed tomorrow");
    assert.equal(result.wrongCount, 1);
    assert.ok(result.easeFactor < 2.5);
  });

  await t.test("wrong answer never demotes below learning to new", () => {
    const learningWord = {
      status: "learning" as const,
      intervalDays: 1,
      easeFactor: 2.2,
      reviewCount: 3,
      correctCount: 1,
      wrongCount: 2,
      recognitionScore: 30,
      recallScore: 20,
    };

    const result = calculateNextReview(learningWord, "forgot", "recognition", baseDate);

    assert.equal(result.status, "learning", "should stay learning and not become new");
    assert.equal(result.intervalDays, 1);
    assert.equal(result.wrongCount, 3);
  });

  await t.test("hard answer keeps status and makes modest interval increase", () => {
    const familiarWord = {
      status: "familiar" as const,
      intervalDays: 3,
      easeFactor: 2.5,
      reviewCount: 4,
      correctCount: 3,
      wrongCount: 1,
      recognitionScore: 60,
      recallScore: 50,
    };

    const result = calculateNextReview(familiarWord, "hard", "recall", baseDate);

    assert.equal(result.status, "familiar", "status should remain unchanged on hard");
    assert.ok(result.intervalDays >= 3);
    assert.equal(result.correctCount, 4);
  });

  await t.test("easy answer promotes status faster and boosts ease factor", () => {
    const learningWord = {
      status: "learning" as const,
      intervalDays: 1,
      easeFactor: 2.5,
      reviewCount: 1,
      correctCount: 1,
      wrongCount: 0,
      recognitionScore: 40,
      recallScore: 40,
    };

    const result = calculateNextReview(learningWord, "easy", "recognition", baseDate);

    assert.equal(result.status, "familiar", "easy answer on learning promotes to familiar");
    assert.ok(result.intervalDays >= 4);
    assert.ok(result.easeFactor > 2.5);
  });

  await t.test("consistent good reviews promote all the way to mastered", () => {
    let word: Parameters<typeof calculateNextReview>[0] = {
      status: "new",
      intervalDays: 0,
      easeFactor: 2.5,
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0,
      recognitionScore: 0,
      recallScore: 0,
    };

    // Review 1: new -> learning
    let res = calculateNextReview(word, "good", "recall", baseDate);
    assert.equal(res.status, "learning");
    word = { ...word, ...res };

    // Review 2: learning -> familiar
    res = calculateNextReview(word, "good", "recall", baseDate);
    assert.equal(res.status, "familiar");
    word = { ...word, ...res };

    // Advance reviews to strong
    word.correctCount = 4;
    word.intervalDays = 5;
    res = calculateNextReview(word, "good", "recall", baseDate);
    assert.equal(res.status, "strong");
    word = { ...word, ...res };

    // Advance reviews to mastered
    word.correctCount = 6;
    word.intervalDays = 14;
    res = calculateNextReview(word, "good", "recall", baseDate);
    assert.equal(res.status, "mastered");
    assert.equal(res.intervalDays, 30);
  });

  await t.test("mastered demotion cascade on consecutive mistakes", () => {
    let word: Parameters<typeof calculateNextReview>[0] = {
      status: "mastered",
      intervalDays: 30,
      easeFactor: 2.6,
      reviewCount: 10,
      correctCount: 9,
      wrongCount: 1,
      recognitionScore: 90,
      recallScore: 90,
    };

    // Mistake 1: mastered -> strong
    let res = calculateNextReview(word, "forgot", "recall", baseDate);
    assert.equal(res.status, "strong");
    word = { ...word, ...res };

    // Mistake 2: strong -> familiar
    res = calculateNextReview(word, "forgot", "recall", baseDate);
    assert.equal(res.status, "familiar");
    word = { ...word, ...res };

    // Mistake 3: familiar -> learning
    res = calculateNextReview(word, "forgot", "recall", baseDate);
    assert.equal(res.status, "learning");
    word = { ...word, ...res };

    // Mistake 4: learning stays learning
    res = calculateNextReview(word, "forgot", "recall", baseDate);
    assert.equal(res.status, "learning");
    assert.equal(res.intervalDays, 1);
  });
});

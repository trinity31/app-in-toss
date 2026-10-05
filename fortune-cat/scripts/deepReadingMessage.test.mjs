import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDeepReadingMessage } from '../src/utils/deepReadingMessage.js';

const reading = '## 관계의 흐름\n\n연락의 횟수가 자연스럽게 변화하는지 확인해 보세요.\n\n---';
const questions = ['바쁜 시기 동안 어떤 마음가짐이 필요할까요?', '그가 "괜찮아"라고 말하면요?', '12월에는 어떤 신호를 기대할까요?'];
const metadata = JSON.stringify({ follow_up_questions: questions });

test('screenshot case separates appended metadata and replaces generic fallback buttons', () => {
  assert.deepEqual(normalizeDeepReadingMessage(`${reading}\n${metadata}`, ['기본 질문']), {
    content: reading, followUpQuestions: questions,
  });
});

test('separates fenced metadata in saved assistant messages', () => {
  assert.deepEqual(normalizeDeepReadingMessage(`${reading}\n\n\`\`\`json\n${metadata}\n\`\`\`\n`, []), {
    content: reading, followUpQuestions: questions,
  });
});

test('unwraps complete JSON responses including fenced responses', () => {
  const content = JSON.stringify({ reading, follow_up_questions: questions });
  for (const value of [content, `\`\`\`json\n${content}\n\`\`\``]) {
    assert.deepEqual(normalizeDeepReadingMessage(value), { content: reading, followUpQuestions: questions });
  }
});

test('ordinary reading and supplied questions remain unchanged', () => {
  assert.deepEqual(normalizeDeepReadingMessage(reading, questions), { content: reading, followUpQuestions: questions });
});

test('does not remove invalid JSON, unrelated JSON, or JSON discussed within prose', () => {
  for (const content of [
    `${reading}\n{"follow_up_questions": ["미완성"`,
    `${reading}\n{"follow_up_questions": [1]}`,
    `${reading}\n{"other": true}`,
    `${reading}\n${metadata}\n이 내용도 풀이의 일부입니다.`,
    `${reading}\n${JSON.stringify({ follow_up_questions: questions, other: true })}`,
  ]) {
    assert.deepEqual(normalizeDeepReadingMessage(content, questions), { content, followUpQuestions: questions });
  }
});

test('handles absent content and malformed question fields without crashing', () => {
  assert.deepEqual(normalizeDeepReadingMessage(null, 'invalid'), { content: '', followUpQuestions: [] });
});

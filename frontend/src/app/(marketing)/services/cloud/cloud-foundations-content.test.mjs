import test from 'node:test';
import assert from 'node:assert/strict';
import { isCloudContent } from './cloud-foundations-content.ts';

test('cloud relevance uses real authored metadata across broad cloud topics', () => {
  for (const fields of [['AWS migration'], ['Reducing cloud costs'], ['DevOps reliability'], ['Terraform infrastructure'], ['Azure foundations'], ['Google Cloud reporting']]) {
    assert.equal(isCloudContent(fields), true, fields.join(' '));
  }
});

test('unrelated articles and projects are not substituted for missing cloud content', () => {
  for (const fields of [[], ['AI customer support', 'RAG', 'Knowledge retrieval'], ['CRM implementation'], ['Data migration', 'Customer records']]) {
    assert.equal(isCloudContent(fields), false, fields.join(' '));
  }
});

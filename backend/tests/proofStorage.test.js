import test from 'node:test';
import assert from 'node:assert/strict';
import { UTApi } from 'uploadthing/server';
import { proofAcl, proofUrl, storeProof } from '../utils/proofStorage.js';

test('proof ACL maps public/private configuration to the v7.7 UploadThing values', async (t) => {
  const prior = process.env.UPLOADTHING_PROOF_ACL;
  const calls = [];
  t.mock.method(UTApi.prototype, 'uploadFiles', async (_file, options) => {
    calls.push(options.acl);
    return { error: null, data: { key: 'proof-key', ufsUrl: 'https://test.ufs.sh/f/proof-key' } };
  });
  try {
    delete process.env.UPLOADTHING_PROOF_ACL;
    assert.deepEqual(proofAcl(), { configured: 'private', uploadthing: 'private' });
    assert.deepEqual(await storeProof(Buffer.from('image')), {
      key: 'proof-key',
      url: 'https://test.ufs.sh/f/proof-key',
      acl: 'private',
    });
    process.env.UPLOADTHING_PROOF_ACL = 'public';
    assert.deepEqual(proofAcl(), { configured: 'public', uploadthing: 'public-read' });
    assert.deepEqual(await storeProof(Buffer.from('image')), {
      key: 'proof-key',
      url: 'https://test.ufs.sh/f/proof-key',
      acl: 'public',
    });
    assert.deepEqual(calls, ['private', 'public-read']);
    assert.equal(
      await proofUrl('proof-key', 'public', 'https://test.ufs.sh/f/proof-key'),
      'https://test.ufs.sh/f/proof-key'
    );
    assert.throws(
      () => {
        process.env.UPLOADTHING_PROOF_ACL = 'invalid';
        proofAcl();
      },
      { statusCode: 503, diagnosticCode: 'INVALID_PROOF_ACL' }
    );
  } finally {
    if (prior === undefined) delete process.env.UPLOADTHING_PROOF_ACL;
    else process.env.UPLOADTHING_PROOF_ACL = prior;
  }
});

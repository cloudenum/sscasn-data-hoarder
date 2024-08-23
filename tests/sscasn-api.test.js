import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import SscasnApi from '../lib/services/sscasn-api.js';
import nock from 'nock';

describe('SscasnApi', function () {
  const kodeRefPend = "5191141";

  before(function () {
    // Set up nock to intercept HTTP requests
    nock(SscasnApi.baseUrl)
      .persist()
      .get(uri => uri.includes('some-endpoint'))
      .reply(200, { success: true });

    nock(SscasnApi.baseUrl)
      .persist()
      .get('/2024/portal/spf')
      .query({ kode_ref_pend: kodeRefPend, offset: 0 })
      .reply(200, { data: 'some data' });
  });

  after(function () {
    // Clean up nock
    nock.cleanAll();
  });

  it('should make a GET request successfully', async function () {
    const response = await SscasnApi.get('some-endpoint');
    const data = response.data;
    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.success, true);
  });

  it('should get Formasi CPNS successfully', async function () {
    const response = await SscasnApi.getAllFormasi(kodeRefPend, null, 0);
    const data = response.data;
    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.data, 'some data');
  });
});

'use strict';

import axios from 'axios';

axios.defaults.adapter = 'http';

class SscasnApi {
  static baseUrl = "https://api-sscasn.bkn.go.id";
  static defaultHeaders = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US",
    "Connection": "keep-alive",
    "Origin": "https://sscasn.bkn.go.id",
    "Referer": "https://sscasn.bkn.go.id/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
  };

  constructor() {
    //
  }

  /**
   * GET request
   * 
   * @param {string|URL|null} uri
   * @param {object?} data
   * @param {object?} headers 
   * @returns {Promise}
   */
  static get(uri = null, data = {}, headers = {}) {
    uri = uri ?? '';
    const url = new URL(uri, SscasnApi.baseUrl);

    if (data) {
      Object.keys(data).forEach(key => url.searchParams.append(key, data[key]));
    }

    return axios({
      method: 'GET',
      url: url.toString(),
      headers: {
        ...SscasnApi.defaultHeaders,
        ...headers
      },
    })
  }

  /**
   * Get Formasi CPNS 
   * 
   * @param {string} kodeRefPend 
   * @param {string} intansiId 
   * @param {int} offset 
   * @returns {Promise}
   */
  static getAllFormasi(kodeRefPend, intansiId = null, offset = 0) {
    return SscasnApi.get('/2024/portal/spf', SscasnApi.filterData({
      kode_ref_pend: kodeRefPend,
      instansi_id: intansiId,
      offset
    }));
  }

  static getDetailFormasi(formasiId) {
    return SscasnApi.get(`/2024/portal/spf/${formasiId}`);
  }

  static filterData(data) {
    return Object.fromEntries(Object.entries(data).filter(([_, v]) => v != null));
  }
}

export default SscasnApi;

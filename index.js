let translate = require('npm-address-translator');
let axios = require('axios');

class XayaExplorerRPC {
  constructor(host, username, password, port, timeout) {
    this.host = host;
    this.username = username;
    this.password = password;
    this.port = port;
    this.timeout = timeout;

    //this.instance = axios.create({})
  }

  /**
   * @param  {String} Method  name of the method being called
   * @param  {Array}  params  various number of arguments based on method
   * @return {String} body    the plaintext body to POST
   */
  async buildBody(method, ...params) {
    var time = Date.now();

    let body = {
      jsonrpc: '1.0',
      id: time,
      method: method
    };

    if (params.length) {
      body.params = params;
    }

    return JSON.stringify(body);
  }

  /**
   * @param  {String} Method  name of the method
   * @param  {...[type]} params   varies based on the method
   * @return {String} Header  plaintext request object to POST to the node
   */
  async performMethod(method, ...params) {
    if (params.length) {
      var body = await this.buildBody(method.toLowerCase(), ...params);
    } else {
      var body = await this.buildBody(method.toLowerCase());
    }
    let req = {
      method: 'POST',
      url: `http://${this.host}:${this.port}/`,
      auth: { username: `${this.username}`, password: `${this.password}` },
      headers: {
        'Content-Type': 'text/plain'
      },
      timeout: `${this.timeout}`,
      data: `${body}`
    };
    return req;
  }
  

  /**
   * @return {Object} array   version, walletversion, balance, block height, difficulty, tx fee
   */
  async getblockchaininfo() {
    let req = await this.performMethod('getblockchaininfo');

    return axios(req)
      .then(response => {
        return response.data.result;
      })
      .catch(err => {
        console.log('failed in getblockchaininfo', err.response.data);
      });
  }
  
  /**
   * @param  {Number}  blocknumber  block number you want the hash of
   * @return {String}  blockhash
   */
  async getblockhash(...params) {
    let req = await this.performMethod('getblockhash', ...params);

    return axios(req)
      .then(response => {
        return response.data.result;
      })
      .catch(err => {
        console.log('failed in getblockhash', err.response.data);
      });
  }


  /**
   * @param  {String} blockhash
   * @return {obj} data       returns the block info
   */
  async getblock(...params) {
    let req = await this.performMethod('getblock', ...params);

    return axios(req)
      .then(response => {
        return response.data.result;
      })
      .catch(err => {
        console.log('failed in getblock', err);
        return err.message;
      });
  }

  
  isValidAddress(...x) {
    const test = '[13CH][a-km-zA-HJ-NP-Z0-9]{30,33}';
    const cashRegEx = /^((?:bitcoincash):)?(?:[023456789acdefghjklmnpqrstuvwxyz]){42}$/gi;
    let testRegEx = new RegExp(test, 'i');

    if (testRegEx.test(x)) {
      return testRegEx.test(x);
    } else {
      return cashRegEx.test(x);
    }
  }

  translateAddress(address) {
    let test = '[13CH][a-km-zA-HJ-NP-Z0-9]{30,33}';
    let testRegEx = new RegExp(test, 'i');
    if (testRegEx.test(address)) {
      let translated = translate.translateAddress(address);
      if (translated.origCoin == 'BTC') {
        return translated.origAddress;
      } else {
        return translated.resultAddress;
      }
    }
  }
}

module.exports = XayaExplorerRPC;

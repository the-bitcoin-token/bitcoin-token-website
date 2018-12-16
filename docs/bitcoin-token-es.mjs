import BitcoinSource from 'bitcoinsource';
import axios from 'axios';

const BITCOIN_NETWORK = 'testnet';
const MIN_SATOSHI_AMOUNT = 546;
const MIN_NON_DUST_AMOUNT = 2750;
const DEFAULT_FEE = 2000;
const BLOCK_EXPLORER_URL =
  'https://tbch.blockdozer.com/api';
const UN_P2SH_URL = 'http://localhost:3000';

var config = {
  BITCOIN_NETWORK,
  BLOCK_EXPLORER_URL,
  MIN_SATOSHI_AMOUNT,
  MIN_NON_DUST_AMOUNT,
  UN_P2SH_URL,
  DEFAULT_FEE
};

//      

BitcoinSource.versionGuard = () => true;

BitcoinSource.Networks.defaultNetwork =
  BitcoinSource.Networks[config.BITCOIN_NETWORK];

//      
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["toJSON"] }] */

class OutputData {
              

  constructor(kind        ) {
    this.kind = kind;
  }

  toJSON() {
    return {}
  }
}

/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

/**
 * A custom Error class to get better stack traces.
 *
 * @author Clemens Ley
 */
class TokenError extends Error {
  constructor(title, detail, ...params) {
    super(...params);
    this.name = 'Error';
    this.message = title + (detail ? `: ${detail}` : '');

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TokenError);
    }
  }
}

//      

function getPropertyDescriptor(f     ) {
  return {
    writable: true,
    value: f
  }
}

function toBuffer(string        )         {
  return Buffer.from(string)
}

function fromBuffer(buffer        )         {
  return buffer.toString()
}

function renameProp(
  oldProp        ,
  newProp        ,
  // $FlowFixMe
  { [oldProp]: old, ...others }        
) {
  return { [newProp]: old, ...others }
}

//      

/**
 * Executes an axios request and unwraps either the resulting response or error.
 * Throws a {@link TokeError} if communication with the server fails or if the
 * request results in an error status code.
 *
 * @throws {TokeError}
 */
const _unwrap = async (request              )               => {
  try {
    const response = await request;
    return response.data
  } catch (error) {
    if (error.response) {
      const { status, statusText, data } = error.response;
      const { method, url } = error.response.config || {
        method: 'unknown',
        url: 'unknown'
      };
      const requestData = error.response.config.data;
      const message =
        data.error || (data.indexOf('Code:') !== -1 ? data : statusText);
      throw new TokenError(`
Communication Error

status\t${status} ${statusText}
message\t${message}
request\t${method} ${url}${requestData ? `\ndata\t${requestData}` : ''}`)
    } else {
      throw new TokenError('Communication error', 'Service unavailable.')
    }
  }
};

/**
 * Executes a get request to the given route. Throws a {@link TokeError} if the
 * request or the communication fails.
 *
 * @throws {TokeError}
 */
const _get = async (
  route        ,
  baseUrl         = config.BLOCK_EXPLORER_URL
)               => _unwrap(axios.get(`${baseUrl}${route}`));

/**
 * Executes a post request to the given route with the given data as body.
 * Throws a {@link TokeError} if the request or the communication fails.
 *
 * @returns {*}
 * @throws {TokeError}
 */
const _post = async (
  route        ,
  data        ,
  baseUrl         = config.BLOCK_EXPLORER_URL
)               => _unwrap(axios.post(`${baseUrl}${route}`, data));

/* ---- Blockchain Api ---- */

/**
 * Retrieves the given address' history, or throws a {@link TokeError} if the
 * request cannot be completed.
 *
 * @throws {TokeError}
 */
const getAddress = async (address         )                  =>
  _get(`/addr/${address.toString()}`);

/**
 * Retrieves the given address' balance in satoshis, or throws a
 * {@link TokeError} if the request cannot be completed.
 *
 * @throws {TokeError}
 */
const getBalance = async (address         )                  => {
  const { balanceSat, unconfirmedBalanceSat } = await getAddress(address);
  return balanceSat + unconfirmedBalanceSat
};

/**
 * Sends a raw, hex-encoded transaction for broadcasting. Returns the resulting
 * transaction's id, or throws a {@link TokeError} if the request cannot be
 * completed.
 *
 * @throws {TokeError}
 */
const sendTransaction = async (
  transaction                 
)                         => {
  const res = await _post('/tx/send', { rawtx: transaction.toString() });
  return renameProp('txid', 'txId', res)
};

/**
 * Removes duplicates from an array of utxos
 */
const removeDuplicates = (array            )             =>
  array.filter(
    (el, index, self) =>
      self.findIndex(t => t.txId === el.txId && t.vout === el.vout) === index
  );

const getTransaction = async (txId        )                  =>
  _get(`/tx/${txId}`);

const getRawTransaction = async (txId        )                  => {
  const transactionInfo = await _get(`/rawtx/${txId}`);
  return transactionInfo.rawtx
};

/**
 * Retrieves the given address' unspent outputs(UTXO set), or throws a
 * {@link TokeError} if the request cannot be completed.
 *
 * @throws {TokeError}
 */
const getUtxos = async (address         )                      => {
  const addressString = address.toString();
  const explorerUtxos = await _get(`/addr/${addressString}/utxo`);
  const utxos = explorerUtxos.map(utxo => renameProp('txid', 'txId', utxo));

  // the insight api might return a list with duplicates we need to eliminate
  const deDuplicatedUtxso = removeDuplicates(utxos);
  return deDuplicatedUtxso.map(utxo => {
    utxo.spent = false;
    return utxo
  })
};

const getTxo = async (outputId          )               => {
  const transaction = await getTransaction(outputId.txId);
  const output = transaction.vout[outputId.outputNumber];

  const address = output.scriptPubKey.addresses[0];
  const { txId } = outputId;
  const vout = outputId.outputNumber;
  const amount = parseFloat(output.value);
  const satoshis = amount * 1e8;
  const height = transaction.blockheight;
  const { confirmations } = transaction;
  const spent = !!output.spentTxId;
  const scriptPubKey = output.scriptPubKey.hex;
  return {
    address,
    txId,
    vout,
    scriptPubKey,
    amount,
    satoshis,
    height,
    confirmations,
    spent
  }
};

/* ---- Unp2sh Api ---- */

const postOutputData = async (data                            ) =>
  _post('/', data, config.UN_P2SH_URL);

const getOutputData = async (txId        ) =>
  _get(`/un-p2sh/${txId}`, config.UN_P2SH_URL);

// Todo: the argument to this function should be of type PublicKey
const getTokenUtxos = async (publicKey        ) =>
  _get(`/txos/${publicKey}`, config.UN_P2SH_URL);

const setTxoSpent = async (txId        , vOut        ) =>
  _post(`/txos/set-spent/`, { txId, vOut }, config.UN_P2SH_URL);

//      

const { PublicKey, Transaction: Transaction$1 } = BitcoinSource;

/**
 * @author Clemens Ley
 * @param {Array<PublicKey>} publicKeys - an array of publicKeys
 * @param {Array<string>} data - an array of string
 */
class ScriptOutputData extends OutputData {
                            
                              
                 

  constructor(
    data                      ,
    publicKeys                   ,
    amount         
  ) {
    super('script');
    this.publicKeys = publicKeys || [];
    this.data = data || [];
    this.amount = amount || config.MIN_NON_DUST_AMOUNT;
  }

  getData(key        ) {
    return this.data[key]
  }

  getSerializeData()                {
    const nested                    = Object.entries(this.data);
    const flat                        = nested.reduce(
      (acc, val) => acc.concat(val),
      []
    );
    // $FlowFixMe
    const buffers                = flat.map(toBuffer);
    return buffers
  }

  setSerializedData(buffers               )       {
    const strings = buffers.map(fromBuffer);
    const data = {};
    for (let i = 0; i < strings.length; i += 2) {
      data[strings[i]] = strings[i + 1];
    }
    this.data = data;
  }

  static fromMultiSigScriptHashInput(
    multiSigScriptHashInput                         
  )       {
    const redeemScript =
      multiSigScriptHashInput.redeemScript ||
      DataScript.redeemScriptFromP2shScript(
        DataScript.fromBuffer(multiSigScriptHashInput._scriptBuffer)
      );
    return this.fromRedeemScript(redeemScript)
  }

  static fromRedeemScript(redeemScript            ) {
    const publicKeys = redeemScript.getPublicKeys();
    const scriptOutputData = new this(
      {},
      publicKeys.map(publicKey => new PublicKey(publicKey)),
      config.MIN_SATOSHI_AMOUNT
    );
    const { chunks } = redeemScript;
    const opcodes = chunks.slice(4, chunks.length);
    const opcodesWithoutDrops = opcodes.filter((_, i) => i % 2 === 0);
    const buffers = opcodesWithoutDrops.map(buffer => buffer.buf);
    scriptOutputData.setSerializedData(buffers);
    return scriptOutputData
  }

  toJSON() {
    return {
      kind: 'script',
      data: this.data,
      publicKeys: this.publicKeys.map(publicKey => publicKey.toString()),
      amount: this.amount
    }
  }

  static isJSON(json        )          {
    return json.data && json.publicKeys && json.amount
  }

  static fromJSON(json        )                   {
    const publicKeys = json.publicKeys.map(
      publicKey => new PublicKey(publicKey)
    );
    return new this(json.data, publicKeys, json.amount)
  }
}

//      

const { PublicKey: PublicKey$1, Address: Address$1, Transaction: Transaction$2 } = BitcoinSource;

/**
 * @author Clemens Ley
 * @param {Array<PublicKey>} publicKeys - an array of publicKeys
 * @param {Array<string>} data - an array of string
 */
class PkhOutputData extends OutputData {
                
                  

  constructor(address         , amount        ) {
    super('pkh');
    this.address = address;
    this.amount = amount;
  }

  static fromPublicKeyHashInput(publicKeyHashInput                    )       {
    const { output } = publicKeyHashInput;
    const outputData = new this(output.script.toAddress(), output.satoshis);
    return outputData
  }

  toJSON() {
    return {
      kind: 'pkh',
      address: this.address.toString(),
      amount: this.amount
    }
  }

  static isJSON(json        )          {
    return json.address && json.amount
  }

  static fromJSON(json        )       {
    const address = new Address$1(json.address);
    return new this(address, json.amount)
  }
}

//      

/**
 * @author Clemens Ley
 * @param {Array<PublicKey>} publicKeys - an array of publicKeys
 * @param {Array<string>} data - an array of string
 */
class ReturnOutputData extends OutputData {
              

  constructor(data        ) {
    super('return');
    this.data = data || '';
  }

  getData() {
    return this.data
  }

  toJSON() {
    return {
      kind: 'return',
      data: this.data
    }
  }

  static isJSON(json        )          {
    return !!json.data
  }

  static fromJSON(json        )                   {
    return new this(json.data)
  }
}

//      

const { Address: Address$2, PublicKey: PublicKey$3, Signature, Script, Opcode } = BitcoinSource;

/**
 * DataScript provides functionality for building custom scripts that can encode meta data in a transaction.
 *
 * @author Clemens Ley
 */
class DataScript extends Script {
  /**
   * Builds an output script that encodes data
   */
  static outputScriptFromScriptOutputData(
    scriptOutputData                  
  )             {
    const { publicKeys } = scriptOutputData;
    const buffers = scriptOutputData.getSerializeData();

    const redeemScript = new DataScript();
    redeemScript.add(`OP_1`);
    publicKeys.forEach(publicKey => redeemScript.add(publicKey.toBuffer()));
    redeemScript.add(`OP_${publicKeys.length}`);
    redeemScript.add('OP_CHECKMULTISIG');
    buffers.forEach(buffer => redeemScript.add(buffer).add('OP_DROP'));
    return redeemScript
  }

  getPublicKeys()                   {
    let index = 1;
    const publicKeys = [];
    while (this.chunks[index].buf) {
      publicKeys.push(new PublicKey$3(this.chunks[index].buf));
      index += 1;
    }
    return publicKeys
  }

  /**
   * Input script to spend from a data output
   */
  static inputScriptFromScriptOutputData(
    pubkeys                  ,
    threshold        ,
    signatures                  ,
    redeemScript        
  )             {
    const script = new DataScript();
    signatures.forEach(signature => {
      script.add(signature);
    });
    script.add(redeemScript);
    return script
  }

  isDbDataScript()          {
    return !!(
      this.chunks.length >= 5 &&
      this.chunks[0].opcodenum === Opcode.OP_1 &&
      this.chunks[1].buf &&
      // todo: check this condition
      (this.chunks[1].buf.length === 20 || this.chunks[1].buf.length === 33) &&
      this.chunks[2].opcodenum === Opcode.OP_1 &&
      this.chunks[3].opcodenum === Opcode.OP_CHECKMULTISIG &&
      this.chunks[4].buf &&
      this.chunks[5].opcodenum === Opcode.OP_DROP
    )
  }

  // todo: make this test tighter by copying relevant parts of script.isScriptHashIn
  static isP2shScript(script        )          {
    return !!(
      script.chunks.length === 3 &&
      script.chunks[0].opcodenum === Opcode.OP_0 &&
      script.chunks[1].buf &&
      // this.chunks[1].buf.length === 72 &&
      script.chunks[2].buf
    )
  }

  static redeemScriptFromP2shScript(script        )             {
    if (!this.isP2shScript(script)) throw new Error('not a p2sh script')

    const redeemScript = new Script(script.chunks[2].buf);
    const dataScript = new DataScript();
    dataScript.chunks = redeemScript.chunks;
    return dataScript
  }

  toOutputData(amount          = config.MIN_SATOSHI_AMOUNT)             {
    if (this.isDbDataScript()) {
      const scriptOutputData = new ScriptOutputData(
        {},
        [new PublicKey$3(this.chunks[1].buf)],
        config.MIN_SATOSHI_AMOUNT
      );
      const opcodes = this.chunks.slice(4, this.chunks.length);
      const opcodesWithoutDrops = opcodes.filter((_, i) => i % 2 === 0);
      const buffers = opcodesWithoutDrops.map(buffer => buffer.buf);
      scriptOutputData.setSerializedData(buffers);
      return scriptOutputData
    } else if (this.isPublicKeyHashOut()) {
      const address = new Address$2(this.getData());
      return new PkhOutputData(address, amount)
    } else if (this.isDataOut()) {
      return new ReturnOutputData(this.getData().toString())
    }

    throw new Error('unknown script type')
  }
}

//      

const { PublicKey: PublicKey$4, Address: Address$3 } = BitcoinSource;

/**
 * @author Clemens Ley
 * @param {Array<PublicKey>} publicKeys - an array of publicKeys
 * @param {Array<string>} data - an array of string
 */
class ChangeOutputData extends OutputData {
                  

  constructor(address         ) {
    super('change');
    this.address = address;
  }

  toJSON() {
    return {
      kind: 'change',
      address: this.address.toString()
    }
  }

  static isJSON(json        )          {
    return json.address
  }

  static fromJSON(json        )                   {
    const address = new Address$3(json.address);
    return new this(address)
  }
}

//      

class OutputDataFactory {
  static fromJSON(
    json        
  )                                                                         {
    if (ScriptOutputData.isJSON(json)) return ScriptOutputData.fromJSON(json)
    else if (PkhOutputData.isJSON(json)) return PkhOutputData.fromJSON(json)
    else if (ChangeOutputData.isJSON(json))
      return ChangeOutputData.fromJSON(json)
    else if (ReturnOutputData.isJSON(json))
      return ReturnOutputData.fromJSON(json)

    throw new Error(`unrecognized json ${JSON.stringify(json)}`)
  }
}

//      
                                  

const { Transaction: Transaction$3, PublicKey: PublicKey$5, Address: Address$4, BN, Script: Script$1, encoding } = BitcoinSource;
const { Output, Input: Input$2 } = Transaction$3;
const { MultiSigScriptHash } = Input$2;
const { BufferReader } = encoding;

/**
 * DataTransaction makes it easy to build Bitcoin transactions that encode meta data.
 *
 * @author Clemens Ley
 */
class DataTransaction extends Transaction$3 {
                                

  constructor(serialized                    ) {
    super(serialized);
    this._outputData = [];
    Object.defineProperty(this, 'to', getPropertyDescriptor(this._to));
    Object.defineProperty(this, 'from', getPropertyDescriptor(this._from));
    // Object.defineProperty(this, 'change', getPropertyDescriptor(this._change))
  }

  /* ---- Inputs ---- */

  get dataInputs()                    {
    return this.inputs.map(input => {
      if (input.constructor.name === 'MultiSigScriptHashInput')
        return ScriptOutputData.fromMultiSigScriptHashInput(input)
      else if (input.constructor.name === 'PublicKeyHashInput')
        return PkhOutputData.fromPublicKeyHashInput(input)
      else if (input.constructor.name === 'Input') {
        const scriptFromBuffer = new Script$1(input._scriptBuffer);
        const dataScript = new DataScript();
        dataScript.chunks = scriptFromBuffer.chunks;

        if (dataScript.isPublicKeyHashIn())
          return new PkhOutputData(dataScript.toAddress(), 0)
        else if (DataScript.isP2shScript(dataScript)) {
          const redeemScript = DataScript.redeemScriptFromP2shScript(dataScript);
          return ScriptOutputData.fromRedeemScript(redeemScript)
        }
      }

      throw new Error(`unknown script class ${input.constructor.name}`)
    })
  }

  set dataInputs(dataInputs                   )       {
    throw Error(
      'dataTransaction.dataInputs cannot be set directly, use dataTransaction.from or dataTransaction.fromScriptOutput'
    )
  }

  get inputsWithData()               {
    return this.inputs.filter(
      (_, i) => this.dataInputs[i].constructor.name === 'ScriptOutputData'
    )
  }

  fromMultiSig(
    utxos            ,
    pubkeys                   ,
    threshold         
  ) {
    const renamed = utxos.map(utxo => renameProp('txId', 'txid', utxo));
    return super.from(renamed, pubkeys, threshold)
  }

  _from(utxo     ) {
    const renamed = renameProp('txId', 'txid', utxo);
    return super.from(renamed)
  }

  fromScriptOutput(utxo     , scriptOutputData                  ) {
    const redeemScript = DataScript.outputScriptFromScriptOutputData(
      scriptOutputData
    );
    const input = new MultiSigScriptHash(
      {
        output: new Output({
          script: new DataScript(utxo.scriptPubKey),
          satoshis: Math.round(utxo.satoshis)
        }),
        prevTxId: utxo.txId,
        outputIndex: utxo.vout,
        script: new DataScript()
      },
      scriptOutputData.publicKeys,
      1,
      null,
      redeemScript
    );
    this.addInput(input);
    return this
  }

  /* ---- Outputs ---- */

  get outputData()                    {
    if (!this._outputData.length)
      throw new Error(
        'dataTransaction.outputData is not initialized. Call dataTransaction.fetchDataOuptuts() first.'
      )
    return this._outputData
  }

  set outputData(outputData                   )       {
    throw Error(
      'dataTransaction.dataInputs cannot be set directly, use dataTransaction.toOutputData'
    )
  }

  get outputsWithData()               {
    return this.outputs.filter(
      (_, i) => this.outputData[i].constructor.name === 'ScriptOutputData'
    )
  }

  change(address         ) {
    const outputsBefore = this.outputs.length;
    super.change(address);
    if (this.outputs.length > outputsBefore)
      this._outputData.push(new ChangeOutputData(address));
    return this
  }

  toChangeOutput(changeOutputData                  )       {
    const outputsBefore = this.outputs.length;
    super.change(changeOutputData.address);
    if (this.outputs.length > outputsBefore)
      this._outputData.push(changeOutputData);
    return this
  }

  toPkhOutput(pkhOutputData               ) {
    super.to(pkhOutputData.address, pkhOutputData.amount);
    this._outputData.push(pkhOutputData);
    return this
  }

  toScriptOutput(scriptOutputData                  )       {
    const redeemScript = DataScript.outputScriptFromScriptOutputData(
      scriptOutputData
    );
    const p2shOutScript = DataScript.buildScriptHashOut(redeemScript);
    const output = new Output({
      script: p2shOutScript,
      satoshis: scriptOutputData.amount
    });
    this.addOutput(output);
    this._outputData.push(scriptOutputData);
    return this
  }

  toReturnOutput(returnOutputData                  )       {
    this.addData(returnOutputData.data);
    this._outputData.push(returnOutputData);
    return this
  }

  _to(
    outputData 
                        
                        
                        
                     
  )       {
    switch (outputData.constructor.name) {
      case 'ChangeOutputData':
        // $FlowFixMe
        return this.toChangeOutput(outputData)
      case 'ReturnOutputData':
        // $FlowFixMe
        return this.toReturnOutput(outputData)
      case 'ScriptOutputData':
        // $FlowFixMe
        return this.toScriptOutput(outputData)
      case 'PkhOutputData':
        // $FlowFixMe
        return this.toPkhOutput(outputData)
      default:
        throw new Error('Unsupported output kind')
    }
  }

  async fetchOutputData()                             {
    if (this._outputData.length) return this._outputData

    const txId = this.getTxId();
    const outputDataJson = await getOutputData(txId);
    this._outputData = outputDataJson.map(OutputDataFactory.fromJSON);
    return this._outputData
  }

  /* ---- Other ---- */

  getTxId()         {
    return new BufferReader(this._getHash()).readReverse().toString('hex')
  }

  static async fromTxId(txId        )                           {
    const rawTransaction = await getRawTransaction(txId);
    const transaction = new DataTransaction();
    await transaction.fromString(rawTransaction);
    return transaction
  }
}

//      
                                                 

const { Mnemonic, HDPrivateKey, PrivateKey, PublicKey: PublicKey$6, Address: Address$5 } = BitcoinSource;

/**
 * Simple deterministic wallet.
 *
 * @author Clemens Ley
 */
class Wallet {
                            
                  
                    
              

  constructor(mnemonic           ) {
    this.mnemonic = mnemonic || new Mnemonic();
    this.path = '';
    this.hdPrivateKey = this.mnemonic.toHDPrivateKey(
      this.path,
      config.BITCOIN_NETWORK
    );
  }

  static getRandomMnemonic() {
    return new Mnemonic().toString()
  }

  static fromMnemonic(mnemonic          ) {
    return new Wallet(mnemonic)
  }

  getMnemonic() {
    return this.mnemonic
  }

  getPath() {
    return this.path
  }

  derive(index                   = 0, hardened           = false)         {
    const wallet = new Wallet(this.mnemonic);
    wallet.path = `${this.path}${this.path.length ? '/' : ''}${index}${
      hardened ? `'` : ''
    }`;
    wallet.hdPrivateKey = this.hdPrivateKey.derive(index, hardened);
    return wallet
  }

  static getHdPrivateKey() {
    return new HDPrivateKey()
  }

  /**
   * Returns the private key derived from the wallet's seed at the given index.
   */
  getPrivateKey()             {
    return this.hdPrivateKey.privateKey
  }

  /**
   * Returns the public key derived from the wallet's seed at the given index.
   */
  getPublicKey()            {
    return this.hdPrivateKey.publicKey
  }

  /**
   * Returns the address for a given wallet index.
   */
  getAddress()          {
    this.address = this.address || this.getPublicKey().toAddress();
    return this.address
  }

  /**
   * Returns the wallet's current balance in satoshis.
   *
   * @throws {TokenError}
   */
  async getBalance()                  {
    const address = this.getAddress();
    return getBalance(address.toString())
  }

  /**
   * Returns all utxos for given address
   *
   * Todo: remove this function and move code into getUtxos
   *
   * @throws {Error}
   */
  async getUtxosFromAddress(
    address         ,
    amount        
  )                      {
    const utxos = await getUtxos(address.toString());

    // shuffle utxos for random coin selection
    for (let i = utxos.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = utxos[i];
      utxos[i] = utxos[j];
      utxos[j] = temp;
    }

    let sumSatoshis = 0;
    const utxosWithSatoshis = [];
    let k = 0;
    while (sumSatoshis < amount && k < utxos.length) {
      utxosWithSatoshis.push(utxos[k]);
      sumSatoshis += utxos[k].satoshis;
      k += 1;
    }
    if (sumSatoshis < amount) {
      throw new Error(`Insufficient balance in address ${address.toString()}`)
    } else {
      return utxosWithSatoshis
    }
  }

  /**
   * Returns all utxos
   *
   * @throws {Error}
   */
  async getUtxos(amount        )                      {
    const address = this.getAddress();
    return this.getUtxosFromAddress(address, amount)
  }

  async getTokenUtxos()                      {
    const publicKey = this.getPublicKey();
    const utxos = await getTokenUtxos(publicKey.toString());

    return Promise.all(
      utxos.map(async utxo => {
        const transaction = await DataTransaction.fromTxId(utxo.txId);
        const outputDatas = await transaction.fetchOutputData();
        const outputData = outputDatas[utxo.vOut];

        if (outputData) {
          const redeemScript = DataScript.outputScriptFromScriptOutputData(
            outputData
          );
          const p2shOutScript = DataScript.buildScriptHashOut(redeemScript);
          const amountSat = transaction.outputs[utxo.vOut].satoshis;

          return {
            txId: utxo.txId,
            vout: utxo.vOut,
            scriptPubKey: p2shOutScript,
            amount: Math.round(amountSat / 1e8),
            satoshis: amountSat,
            amountSat,
            outputData
          }
        }
        return null
      })
    )
  }

  /**
   * Broadcast a transaction.
   * @param {Transaction} transaction - The transaction to be sent.
   * @throws {Error}
   */
  async sendTransaction(
    transaction                 ,
    store          = false
  )                         {
    const { txId } = await sendTransaction(transaction);
    if (store) {
      const outputData = JSON.stringify(
        transaction.outputData.map(output => output.toJSON())
      );
      await postOutputData({ txId, outputData });
    }
    return { txId }
  }

  /**
   * Builds, signs, and broadcasts a bitcoin transaction.
   */
  async send(
    outputs                                         ,
    changeAddress          
  )                         {
    const transaction = new DataTransaction();
    const changeAddressInitialized = changeAddress || this.getAddress();
    const fee = config.DEFAULT_FEE;
    const privateKey = this.getPrivateKey();
    const totalAmount = outputs.reduce(
      (prev, curr) => prev + parseInt(curr.amount || 0, 10),
      0
    );
    const utxos = await this.getUtxos(totalAmount + fee);

    utxos.forEach(transaction.from.bind(transaction));
    outputs.forEach(transaction.to.bind(transaction));
    transaction.change(changeAddressInitialized);
    transaction.sign(privateKey);
    return this.sendTransaction(transaction)
  }

  async sendAll(toAddress         )                         {
    const balance = await this.getBalance();
    const fee = config.DEFAULT_FEE;
    if (balance > fee) {
      const pkhOutputData = new PkhOutputData(toAddress, balance - fee);
      return this.send([pkhOutputData])
    }
    throw new Error('Insufficient funds to send payment.')
  }
}

//      

class Db {
                

  constructor(wallet         ) {
    this.wallet = wallet || new Wallet();
  }

  static fromMnemonic(mnemonic          ) {
    const wallet = new Wallet(mnemonic);
    return new this(wallet)
  }

  async put(
    outputDatas        
                                                                            
     
  )                           {
    return this.update([], outputDatas)
  }

  // todo: make this more efficient by not looking up the same tx multiple times
  async get(outputIds                 )                             {
    // $FlowFixMe
    return Promise.all(
      outputIds.map(async ({ txId, outputNumber }) => {
        const transaction = await DataTransaction.fromTxId(txId);
        await transaction.fetchOutputData();
        return transaction.outputData[outputNumber]
      })
    )
  }

  async update(
    outputIds                 ,
    outputDatas        
                                                                            
     
  )                           {
    const transaction = new DataTransaction();

    // add utxos as inputs
    await Promise.all(
      outputIds.map(async outputId => {
        const utxo = await getTxo(outputId);
        const res = await getOutputData(utxo.txId);
        const scriptOutputData = ScriptOutputData.fromJSON(res[utxo.vout]);
        transaction.fromScriptOutput(utxo, scriptOutputData);
        await setTxoSpent(utxo.txId, utxo.vout);
      })
    );

    // add extra utxos to cover transaction fee
    const bitcoinUtxos = await this.wallet.getUtxos(
      config.DEFAULT_FEE + outputDatas.length * config.MIN_NON_DUST_AMOUNT
    );
    bitcoinUtxos.forEach(transaction.from.bind(transaction));

    // add data bearing outputs
    outputDatas.forEach(transaction.to.bind(transaction));

    // add change address, sign, and send
    transaction.change(this.wallet.getAddress());
    transaction.sign(this.wallet.getPrivateKey());
    const { txId } = await this.wallet.sendTransaction(transaction, true);

    // prepare return value
    const outputNumbers = [...Array(outputDatas.length).keys()];
    return outputNumbers.map(outputNumber => ({
      txId,
      outputNumber
    }))
  }
}

//      

/**
 * The token class. An instance encapsulates basic information of a token such
 * as the name, the ticker symbol, and the number of units of the token. It also
 * contains a reference to the current user.
 *
 * @author Clemens Ley
 *
 * @param {any} tokenId - the id of the token
 * @param {boolean} _initialized -  indicates whether the token is initialized
 */
class Token {
                            
        
              

  constructor(db     ) {
    this.db = db || new Db();
  }

  static fromMnemonic(mnemonic          ) {
    const db = Db.fromMnemonic(mnemonic);
    return new this(db)
  }

  async init(json        ) {
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    Object.entries(json).forEach(([key        , value        ]) => {
(this     )[key] = new AsyncFunction(
        // $FlowFixMe
        `"use strict"; return ${value}`
      ).bind(this)();
    });

    // Object.entries(json).forEach(([key: string, value: string]) => {
    //   // $FlowFixMe
    //   ;(this: any)[key] = new Function(`"use strict"; return ${value}`).bind(
    //     this
    //   )()
    // })
  }

  async create(data                      )                    {
    const scriptOutputData = new ScriptOutputData(data, [
      this.db.wallet.getPublicKey()
    ]);
    // eslint-disable-next-line prefer-destructuring
    this.id = (await this.db.put([scriptOutputData]))[0];
    return this.id
  }

  join(outputId          )       {
    this.id = outputId;
  }

  async getTokenUtxos()                         {
    const publicKey = this.db.wallet.getPublicKey();
    const utxos = await getTokenUtxos(publicKey.toString());

    const utxosWithTransactions = await Promise.all(
      utxos.map(async utxo => {
        const transaction = await DataTransaction.fromTxId(utxo.txId);
        await transaction.fetchOutputData();
        return Object.assign({ transaction }, utxo)
      })
    );

    const utxosWithData = utxosWithTransactions.filter(
      utxo => utxo.transaction.outputData[utxo.vOut]
    );

    const filterAsync = (array, filter) =>
      Promise.all(array.map(entry => filter(entry))).then(bits =>
        array.filter(entry => bits.shift())
      );
    const isValid = async utxo => this.isValid(utxo.transaction.hash);
    const validUtxos = await filterAsync(utxosWithData, isValid.bind(this));

    return Promise.all(
      validUtxos.map(async utxo => {
        const outputData = utxo.transaction.outputData[utxo.vOut];
        const redeemScript = DataScript.outputScriptFromScriptOutputData(
          outputData
        );
        const p2shOutScript = DataScript.buildScriptHashOut(redeemScript);
        const amountSat = utxo.transaction.outputs[utxo.vOut].satoshis;

        return {
          txId: utxo.txId,
          vout: utxo.vOut,
          scriptPubKey: p2shOutScript,
          amount: Math.round(amountSat / 1e8),
          satoshis: amountSat,
          amountSat,
          outputData
        }
      })
    )
  }

  async send(amount        , publicKey           )                           {
    const tokenUtxos = await this.getTokenUtxos();
    let amountSpent = 0;

    const inputData                  = tokenUtxos
      .filter(async tokenUtxo => {
        const bool = amountSpent < amount;
        const { txId, vout, outputData } = tokenUtxo;
        const { balance } = outputData.data;
        amountSpent += balance ? parseInt(balance, 10) : 0;
        await setTxoSpent(txId, vout);
        return bool
      })
      .map(utxo => ({
        txId: utxo.txId,
        outputNumber: utxo.vout
      }));

    if (amountSpent < amount) {
      throw new Error('Insufficient token funds')
    }

    const sendScriptOutputData = new ScriptOutputData(
      { balance: amount.toString(10) },
      [publicKey]
    );

    const tokenChange = amountSpent - amount;
    const myPublicKey = this.db.wallet.getPublicKey();
    const changeScriptOutputData = new ScriptOutputData(
      { balance: tokenChange.toString(10) },
      [myPublicKey]
    );

    return this.db.update(inputData, [
      sendScriptOutputData,
      changeScriptOutputData
    ])
  }

  async getBalance()                  {
    const utxos = await this.getTokenUtxos();
    const balances = await Promise.all(
      utxos.map(async utxo => {
        const outputData = await getOutputData(utxo.txId);
        const { publicKeys, data } = outputData[utxo.vout];
        const scriptOutputData = new ScriptOutputData(data, publicKeys);
        const balance = scriptOutputData.getData('balance');
        return balance ? parseInt(balance, 10) : 0
      })
    );
    return balances.reduce((prev, curr) => prev + curr, 0)
  }

  async isValid(txId        )                   {
    const transaction = await DataTransaction.fromTxId(txId);
    await transaction.fetchOutputData();
    if (this.isIssuance(transaction)) {
      return this.id.txId === transaction.getTxId()
    } else if (this.isTransfer(transaction)) {
      return Promise.all(
        transaction.inputsWithData.map(async input =>
          this.isValid(input.prevTxId.toString('hex'))
        )
      ).then(bools => bools.every(bool => bool))
    }
    return false
  }

  isIssuance(transaction                 )          {
    return (
      transaction.inputsWithData.length === 0 &&
      transaction.outputsWithData.length === 1
    )
  }

  isTransfer(transaction                 )          {
    return transaction.inputsWithData.length >= 1
  }
}

//      
                                                   
                                        

const { Mnemonic: Mnemonic$3 } = BitcoinSource;

class WalletWrapper {
                

  constructor(words         ) {
    const mnemonic = words ? new Mnemonic$3(words) : new Mnemonic$3();
    this.wallet = new Wallet(mnemonic);
  }

  static getRandomMnemonic()         {
    return Wallet.getRandomMnemonic().toString()
  }

  static fromMnemonic(words        )       {
    return new this(words)
  }

  getMnemonic()         {
    return this.wallet.getMnemonic().toString()
  }

  getPath()         {
    return this.wallet.path
  }

  // // todo: remove this function
  // static getHdPrivateKey(): string {
  //   return Wallet.getHdPrivateKey().toString()
  // }

  getPrivateKey()         {
    return this.wallet.getPrivateKey().toString()
  }

  getPublicKey()         {
    return this.wallet.getPublicKey().toString()
  }

  getAddress(format                                   )         {
    const addressFormat = format || 'legacy';
    if (!['legacy', 'bitpay', 'cashaddr'].includes(addressFormat)) {
      throw new Error(
        `second parameter in wallet.getAddress must be 'legacy', 'bitpay', or 'cashaddr'`
      )
    }
    const address = this.wallet.getAddress();
    return address.toString(addressFormat)
  }

  async getBalance()                  {
    return this.wallet.getBalance()
  }

  derive(
    index                   = 0,
    hardened           = false
  )                {
    const walletWrapper = new WalletWrapper();
    const childWallet = this.wallet.derive(index, hardened);
    walletWrapper.wallet = childWallet;
    return walletWrapper
  }

  async send(
    amount        ,
    address        ,
    changeAddress         
  )                    {
    const outputData = OutputDataFactory.fromJSON({ amount, address });
    // $FlowFixMe
    return this.wallet.send([outputData], changeAddress)
  }

  async transaction(
    outputs                             ,
    changeAddress         
  )                    {
    const outputObjects = outputs.map(OutputDataFactory.fromJSON);
    // $FlowFixMe
    return this.wallet.send(outputObjects, changeAddress)
  }

  static fromHdPrivateKey()       {
    throw new Error(`
wallet.fromHdPrivateKey is not supported anymore. Use wallet.fromMnemonic instead.

For example:
const mnemonic = Wallet.getRandomMnemonic()
const wallet = wallet.fromMnemonic(mnemonic)
    `)
  }
}

//      
                                                                         

const { Mnemonic: Mnemonic$4 } = BitcoinSource;

class DbWrapper {
        

  constructor(walletWrapper                ) {
    this.db = new Db(walletWrapper ? walletWrapper.wallet : null);
  }

  static fromMnemonic(words        ) {
    const mnemonic = new Mnemonic$4(words);
    const dbWrapper = new this();
    dbWrapper.db = Db.fromMnemonic(mnemonic);
    return dbWrapper
  }

  getWallet()                {
    const mnemonic = this.db.wallet.getMnemonic();
    return WalletWrapper.fromMnemonic(mnemonic.toString())
  }

  toScriptOutputData(json        )                   {
    return ScriptOutputData.fromJSON({
      kind: 'script',
      publicKeys: json.owners || [
        this.getWallet()
          .getPublicKey()
          .toString()
      ],
      data: json.data || {},
      amount: json.amount || config.MIN_NON_DUST_AMOUNT
    })
  }

  async return(data        )                    {
    const returnOutputData = new ReturnOutputData(data);
    const { txId } = await this.db.wallet.send([returnOutputData]);
    return { txId, outputNumber: 0 }
  }

  async put(
    data        ,
    owners                ,
    amount         
  )                    {
    const json = { data, owners, amount };
    const scriptOutputData = this.toScriptOutputData(json);
    const outputIds = await this.db.put([scriptOutputData]);
    return outputIds[0]
  }

  async get(outputId          )                                   {
    const outputData = await this.db.get([outputId]);
    const json = outputData[0].toJSON();
    const renamed = renameProp('publicKeys', 'owners', json);
    delete renamed.kind;
    return renamed
  }

  async update(
    outputId          ,
    data                      ,
    owners               ,
    amount          = config.MIN_NON_DUST_AMOUNT
  )                    {
    const json = { data, owners, amount };
    const scriptOutputData = this.toScriptOutputData(json);
    const array = await this.db.update([outputId], [scriptOutputData]);
    return array[0]
  }

  async transaction(jsons                          )                           {
    const ouptputIds = jsons.map(json => json.outputId);
    const scriptOutputDataArr = jsons.map(this.toScriptOutputData.bind(this));
    return this.db.update(ouptputIds, scriptOutputDataArr)
  }

  getMnemonic() {
    throw new Error(
      'db.getMnemonic does not exist. Use db.getWallet().getMnemonic() instead.'
    )
  }

  getPrivateKey() {
    throw new Error(
      'db.getPrivateKey does not exist. Use db.getWallet().getPrivateKey() instead.'
    )
  }

  getPublicKey() {
    throw new Error(
      'db.getPublicKey does not exist. Use db.getWallet().getPublicKey() instead.'
    )
  }

  getAddress() {
    throw new Error(
      'db.getAddress does not exist. Use db.getWallet().getAddress() instead.'
    )
  }

  static fromHdPrivateKey()       {
    throw new Error(`
db.fromHdPrivateKey is not supported anymore. Use db.fromMnemonic instead.

For example:
const mnemonic = Wallet.getRandomMnemonic()
const db = Db.fromMnemonic(mnemonic)
    `)
  }
}

//      
                                        

const { PublicKey: PublicKey$9, Mnemonic: Mnemonic$5 } = BitcoinSource;

class TokenWrapper {
              

  constructor(dbWrapper            ) {
    this.token = new Token(dbWrapper ? dbWrapper.db : null);
  }

  static fromMnemonic(words        ) {
    const mnemonic = new Mnemonic$5(words);
    const tokenWrapper = new this();
    tokenWrapper.token = Token.fromMnemonic(mnemonic);
    return tokenWrapper
  }

  getWallet()                {
    const mnemonic = this.token.db.wallet.getMnemonic();
    return WalletWrapper.fromMnemonic(mnemonic.toString())
  }

  getDb()            {
    const mnemonic = this.token.db.wallet.getMnemonic();
    return DbWrapper.fromMnemonic(mnemonic.toString())
  }

  async create(data                      )                    {
    return this.token.create(data)
  }

  join(id          )       {
    return this.token.join(id)
  }

  async send(
    amount        ,
    publicKeyString        
  )                           {
    const publicKey = PublicKey$9.fromString(publicKeyString);
    return this.token.send(amount, publicKey)
  }

  async getBalance()                  {
    return this.token.getBalance()
  }

  getMnemonic() {
    throw new Error(
      'token.getMnemonic does not exist. Use token.getWallet().getMnemonic() instead.'
    )
  }

  getPrivateKey() {
    throw new Error(
      'token.getPrivateKey does not exist. Use token.getWallet().getPrivateKey() instead.'
    )
  }

  getPublicKey() {
    throw new Error(
      'token.getPublicKey does not exist. Use token.getWallet().getPublicKey() instead.'
    )
  }

  getAddress() {
    throw new Error(
      'token.getAddress does not exist. Use token.getWallet().getAddress() instead.'
    )
  }

  static fromHdPrivateKey()       {
    throw new Error(`
token.fromHdPrivateKey is not supported anymore. Use token.fromMnemonic instead.

For example:
const mnemonic = Wallet.getRandomMnemonic()
const token = Token.fromMnemonic(mnemonic)
    `)
  }
}

//

export { TokenWrapper as Token, DbWrapper as Db, WalletWrapper as Wallet, BitcoinSource as Source };

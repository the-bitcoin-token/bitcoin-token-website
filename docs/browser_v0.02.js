(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
  (function (Buffer){
  this["bitcoin-token-iife"]=this["bitcoin-token-iife"]||{},this["bitcoin-token-iife"].js=function(t,e,n){"use strict";e=e&&e.hasOwnProperty("default")?e.default:e,n=n&&n.hasOwnProperty("default")?n.default:n;var s={BITCOIN_NETWORK:"testnet",BLOCK_EXPLORER_URL:"https://tbch.blockdozer.com/api",MIN_SATOSHI_AMOUNT:546,MIN_NON_DUST_AMOUNT:2750,UN_P2SH_URL:"http://localhost:3000",DEFAULT_FEE:2e3};e.versionGuard=(()=>!0),e.Networks.defaultNetwork=e.Networks[s.BITCOIN_NETWORK];class r{constructor(t){this.kind=t}toJSON(){return{}}}class a extends Error{constructor(t,e,...n){super(...n),this.name="Error",this.message=t+(e?`: ${e}`:""),Error.captureStackTrace&&Error.captureStackTrace(this,a)}}function i(t){return{writable:!0,value:t}}function o(t){return Buffer.from(t)}function u(t){return t.toString()}function c(t,e,{[t]:n,...s}){return{[e]:n,...s}}const d=async t=>{try{return(await t).data}catch(t){if(t.response){const{status:e,statusText:n,data:s}=t.response,{method:r,url:i}=t.response.config||{method:"unknown",url:"unknown"},o=t.response.config.data,u=s.error||(-1!==s.indexOf("Code:")?s:n);throw new a(`\nCommunication Error\n\nstatus\t${e} ${n}\nmessage\t${u}\nrequest\t${r} ${i}${o?`\ndata\t${o}`:""}`)}throw new a("Communication error","Service unavailable.")}},h=async(t,e=s.BLOCK_EXPLORER_URL)=>d(n.get(`${e}${t}`)),p=async(t,e,r=s.BLOCK_EXPLORER_URL)=>d(n.post(`${r}${t}`,e)),l=async t=>{const{balanceSat:e,unconfirmedBalanceSat:n}=await(async t=>h(`/addr/${t.toString()}`))(t);return e+n},m=async t=>{return c("txid","txId",await p("/tx/send",{rawtx:t.toString()}))},w=async t=>{return(await h(`/rawtx/${t}`)).rawtx},g=async t=>{const e=t.toString();return(t=>t.filter((t,e,n)=>n.findIndex(e=>e.txId===t.txId&&e.vout===t.vout)===e))((await h(`/addr/${e}/utxo`)).map(t=>c("txid","txId",t))).map(t=>(t.spent=!1,t))},f=async t=>{const e=await(async t=>h(`/tx/${t}`))(t.txId),n=e.vout[t.outputNumber],s=n.scriptPubKey.addresses[0],{txId:r}=t,a=t.outputNumber,i=parseFloat(n.value),o=1e8*i,u=e.blockheight,{confirmations:c}=e,d=!!n.spentTxId;return{address:s,txId:r,vout:a,scriptPubKey:n.scriptPubKey.hex,amount:i,satoshis:o,height:u,confirmations:c,spent:d}},y=async t=>p("/",t,s.UN_P2SH_URL),S=async t=>h(`/un-p2sh/${t}`,s.UN_P2SH_URL),O=async t=>h(`/txos/${t}`,s.UN_P2SH_URL),b=async(t,e)=>p("/txos/set-spent/",{txId:t,vOut:e},s.UN_P2SH_URL),{PublicKey:P,Transaction:I}=e;class x extends r{constructor(t,e,n){super("script"),this.publicKeys=e||[],this.data=t||[],this.amount=n||s.MIN_NON_DUST_AMOUNT}getData(t){return this.data[t]}getSerializeData(){return Object.entries(this.data).reduce((t,e)=>t.concat(e),[]).map(o)}setSerializedData(t){const e=t.map(u),n={};for(let t=0;t<e.length;t+=2)n[e[t]]=e[t+1];this.data=n}static fromMultiSigScriptHashInput(t){const e=t.redeemScript||A.redeemScriptFromP2shScript(A.fromBuffer(t._scriptBuffer));return this.fromRedeemScript(e)}static fromRedeemScript(t){const e=new this({},t.getPublicKeys().map(t=>new P(t)),s.MIN_SATOSHI_AMOUNT),{chunks:n}=t,r=n.slice(4,n.length).filter((t,e)=>e%2==0).map(t=>t.buf);return e.setSerializedData(r),e}toJSON(){return{kind:"script",data:this.data,publicKeys:this.publicKeys.map(t=>t.toString()),amount:this.amount}}static isJSON(t){return t.data&&t.publicKeys&&t.amount}static fromJSON(t){const e=t.publicKeys.map(t=>new P(t));return new this(t.data,e,t.amount)}}const{PublicKey:D,Address:K,Transaction:N}=e;class k extends r{constructor(t,e){super("pkh"),this.address=t,this.amount=e}static fromPublicKeyHashInput(t){const{output:e}=t;return new this(e.script.toAddress(),e.satoshis)}toJSON(){return{kind:"pkh",address:this.address.toString(),amount:this.amount}}static isJSON(t){return t.address&&t.amount}static fromJSON(t){return new this(new K(t.address),t.amount)}}class _ extends r{constructor(t){super("return"),this.data=t||""}getData(){return this.data}toJSON(){return{kind:"return",data:this.data}}static isJSON(t){return!!t.data}static fromJSON(t){return new this(t.data)}}const{Address:M,PublicKey:T,Signature:v,Script:E,Opcode:U}=e;class A extends E{static outputScriptFromScriptOutputData(t){const{publicKeys:e}=t,n=t.getSerializeData(),s=new A;return s.add("OP_1"),e.forEach(t=>s.add(t.toBuffer())),s.add(`OP_${e.length}`),s.add("OP_CHECKMULTISIG"),n.forEach(t=>s.add(t).add("OP_DROP")),s}getPublicKeys(){let t=1;const e=[];for(;this.chunks[t].buf;)e.push(new T(this.chunks[t].buf)),t+=1;return e}static inputScriptFromScriptOutputData(t,e,n,s){const r=new A;return n.forEach(t=>{r.add(t)}),r.add(s),r}isDbDataScript(){return!(!(this.chunks.length>=5&&this.chunks[0].opcodenum===U.OP_1&&this.chunks[1].buf)||20!==this.chunks[1].buf.length&&33!==this.chunks[1].buf.length||this.chunks[2].opcodenum!==U.OP_1||this.chunks[3].opcodenum!==U.OP_CHECKMULTISIG||!this.chunks[4].buf||this.chunks[5].opcodenum!==U.OP_DROP)}static isP2shScript(t){return!(3!==t.chunks.length||t.chunks[0].opcodenum!==U.OP_0||!t.chunks[1].buf||!t.chunks[2].buf)}static redeemScriptFromP2shScript(t){if(!this.isP2shScript(t))throw new Error("not a p2sh script");const e=new E(t.chunks[2].buf),n=new A;return n.chunks=e.chunks,n}toOutputData(t=s.MIN_SATOSHI_AMOUNT){if(this.isDbDataScript()){const t=new x({},[new T(this.chunks[1].buf)],s.MIN_SATOSHI_AMOUNT),e=this.chunks.slice(4,this.chunks.length).filter((t,e)=>e%2==0).map(t=>t.buf);return t.setSerializedData(e),t}if(this.isPublicKeyHashOut()){const e=new M(this.getData());return new k(e,t)}if(this.isDataOut())return new _(this.getData().toString());throw new Error("unknown script type")}}const{PublicKey:H,Address:R}=e;class J extends r{constructor(t){super("change"),this.address=t}toJSON(){return{kind:"change",address:this.address.toString()}}static isJSON(t){return t.address}static fromJSON(t){return new this(new R(t.address))}}class ${static fromJSON(t){if(x.isJSON(t))return x.fromJSON(t);if(k.isJSON(t))return k.fromJSON(t);if(J.isJSON(t))return J.fromJSON(t);if(_.isJSON(t))return _.fromJSON(t);throw new Error(`unrecognized json ${JSON.stringify(t)}`)}}const{Transaction:W,PublicKey:F,Address:B,BN:L,Script:C,encoding:j}=e,{Output:z,Input:G}=W,{MultiSigScriptHash:V}=G,{BufferReader:X}=j;class q extends W{constructor(t){super(t),this._outputData=[],Object.defineProperty(this,"to",i(this._to)),Object.defineProperty(this,"from",i(this._from))}get dataInputs(){return this.inputs.map(t=>{if("MultiSigScriptHashInput"===t.constructor.name)return x.fromMultiSigScriptHashInput(t);if("PublicKeyHashInput"===t.constructor.name)return k.fromPublicKeyHashInput(t);if("Input"===t.constructor.name){const e=new C(t._scriptBuffer),n=new A;if(n.chunks=e.chunks,n.isPublicKeyHashIn())return new k(n.toAddress(),0);if(A.isP2shScript(n)){const t=A.redeemScriptFromP2shScript(n);return x.fromRedeemScript(t)}}throw new Error(`unknown script class ${t.constructor.name}`)})}set dataInputs(t){throw Error("dataTransaction.dataInputs cannot be set directly, use dataTransaction.from or dataTransaction.fromScriptOutput")}get inputsWithData(){return this.inputs.filter((t,e)=>"ScriptOutputData"===this.dataInputs[e].constructor.name)}fromMultiSig(t,e,n){const s=t.map(t=>c("txId","txid",t));return super.from(s,e,n)}_from(t){const e=c("txId","txid",t);return super.from(e)}fromScriptOutput(t,e){const n=A.outputScriptFromScriptOutputData(e),s=new V({output:new z({script:new A(t.scriptPubKey),satoshis:Math.round(t.satoshis)}),prevTxId:t.txId,outputIndex:t.vout,script:new A},e.publicKeys,1,null,n);return this.addInput(s),this}get outputData(){if(!this._outputData.length)throw new Error("dataTransaction.outputData is not initialized. Call dataTransaction.fetchDataOuptuts() first.");return this._outputData}set outputData(t){throw Error("dataTransaction.dataInputs cannot be set directly, use dataTransaction.toOutputData")}get outputsWithData(){return this.outputs.filter((t,e)=>"ScriptOutputData"===this.outputData[e].constructor.name)}change(t){const e=this.outputs.length;return super.change(t),this.outputs.length>e&&this._outputData.push(new J(t)),this}toChangeOutput(t){const e=this.outputs.length;return super.change(t.address),this.outputs.length>e&&this._outputData.push(t),this}toPkhOutput(t){return super.to(t.address,t.amount),this._outputData.push(t),this}toScriptOutput(t){const e=A.outputScriptFromScriptOutputData(t),n=A.buildScriptHashOut(e),s=new z({script:n,satoshis:t.amount});return this.addOutput(s),this._outputData.push(t),this}toReturnOutput(t){return this.addData(t.data),this._outputData.push(t),this}_to(t){switch(t.constructor.name){case"ChangeOutputData":return this.toChangeOutput(t);case"ReturnOutputData":return this.toReturnOutput(t);case"ScriptOutputData":return this.toScriptOutput(t);case"PkhOutputData":return this.toPkhOutput(t);default:throw new Error("Unsupported output kind")}}async fetchOutputData(){if(this._outputData.length)return this._outputData;const t=this.getTxId(),e=await S(t);return this._outputData=e.map($.fromJSON),this._outputData}getTxId(){return new X(this._getHash()).readReverse().toString("hex")}static async fromTxId(t){const e=await w(t),n=new q;return await n.fromString(e),n}}const{Mnemonic:Q,HDPrivateKey:Y,PrivateKey:Z,PublicKey:tt,Address:et}=e;class nt{constructor(t){this.mnemonic=t||new Q,this.path="",this.hdPrivateKey=this.mnemonic.toHDPrivateKey(this.path,s.BITCOIN_NETWORK)}static getRandomMnemonic(){return(new Q).toString()}static fromMnemonic(t){return new nt(t)}getMnemonic(){return this.mnemonic}getPath(){return this.path}derive(t=0,e=!1){const n=new nt(this.mnemonic);return n.path=`${this.path}${this.path.length?"/":""}${t}${e?"'":""}`,n.hdPrivateKey=this.hdPrivateKey.derive(t,e),n}static getHdPrivateKey(){return new Y}getPrivateKey(){return this.hdPrivateKey.privateKey}getPublicKey(){return this.hdPrivateKey.publicKey}getAddress(){return this.address=this.address||this.getPublicKey().toAddress(),this.address}async getBalance(){const t=this.getAddress();return l(t.toString())}async getUtxosFromAddress(t,e){const n=await g(t.toString());for(let t=n.length-1;t>0;t-=1){const e=Math.floor(Math.random()*(t+1)),s=n[t];n[t]=n[e],n[e]=s}let s=0;const r=[];let a=0;for(;s<e&&a<n.length;)r.push(n[a]),s+=n[a].satoshis,a+=1;if(s<e)throw new Error(`Insufficient balance in address ${t.toString()}`);return r}async getUtxos(t){const e=this.getAddress();return this.getUtxosFromAddress(e,t)}async getTokenUtxos(){const t=this.getPublicKey(),e=await O(t.toString());return Promise.all(e.map(async t=>{const e=await q.fromTxId(t.txId),n=(await e.fetchOutputData())[t.vOut];if(n){const s=A.outputScriptFromScriptOutputData(n),r=A.buildScriptHashOut(s),a=e.outputs[t.vOut].satoshis;return{txId:t.txId,vout:t.vOut,scriptPubKey:r,amount:Math.round(a/1e8),satoshis:a,amountSat:a,outputData:n}}return null}))}async sendTransaction(t,e=!1){const{txId:n}=await m(t);if(e){const e=JSON.stringify(t.outputData.map(t=>t.toJSON()));await y({txId:n,outputData:e})}return{txId:n}}async send(t,e){const n=new q,r=e||this.getAddress(),a=s.DEFAULT_FEE,i=this.getPrivateKey(),o=t.reduce((t,e)=>t+parseInt(e.amount||0,10),0);return(await this.getUtxos(o+a)).forEach(n.from.bind(n)),t.forEach(n.to.bind(n)),n.change(r),n.sign(i),this.sendTransaction(n)}async sendAll(t){const e=await this.getBalance(),n=s.DEFAULT_FEE;if(e>n){const s=new k(t,e-n);return this.send([s])}throw new Error("Insufficient funds to send payment.")}}class st{constructor(t){this.wallet=t||new nt}static fromMnemonic(t){return new this(new nt(t))}async put(t){return this.update([],t)}async get(t){return Promise.all(t.map(async({txId:t,outputNumber:e})=>{const n=await q.fromTxId(t);return await n.fetchOutputData(),n.outputData[e]}))}async update(t,e){const n=new q;await Promise.all(t.map(async t=>{const e=await f(t),s=await S(e.txId),r=x.fromJSON(s[e.vout]);n.fromScriptOutput(e,r),await b(e.txId,e.vout)})),(await this.wallet.getUtxos(s.DEFAULT_FEE+e.length*s.MIN_NON_DUST_AMOUNT)).forEach(n.from.bind(n)),e.forEach(n.to.bind(n)),n.change(this.wallet.getAddress()),n.sign(this.wallet.getPrivateKey());const{txId:r}=await this.wallet.sendTransaction(n,!0);return[...Array(e.length).keys()].map(t=>({txId:r,outputNumber:t}))}}class rt{constructor(t){this.db=t||new st}static fromMnemonic(t){return new this(st.fromMnemonic(t))}async init(t){const e=Object.getPrototypeOf(async()=>{}).constructor;Object.entries(t).forEach(([t,n])=>{this[t]=new e(`"use strict"; return ${n}`).bind(this)()})}async create(t){const e=new x(t,[this.db.wallet.getPublicKey()]);return this.id=(await this.db.put([e]))[0],this.id}join(t){this.id=t}async getTokenUtxos(){const t=this.db.wallet.getPublicKey(),e=await O(t.toString()),n=(await Promise.all(e.map(async t=>{const e=await q.fromTxId(t.txId);return await e.fetchOutputData(),Object.assign({transaction:e},t)}))).filter(t=>t.transaction.outputData[t.vOut]),s=await((t,e)=>Promise.all(t.map(t=>e(t))).then(e=>t.filter(t=>e.shift())))(n,(async t=>this.isValid(t.transaction.hash)).bind(this));return Promise.all(s.map(async t=>{const e=t.transaction.outputData[t.vOut],n=A.outputScriptFromScriptOutputData(e),s=A.buildScriptHashOut(n),r=t.transaction.outputs[t.vOut].satoshis;return{txId:t.txId,vout:t.vOut,scriptPubKey:s,amount:Math.round(r/1e8),satoshis:r,amountSat:r,outputData:e}}))}async send(t,e){const n=await this.getTokenUtxos();let s=0;const r=n.filter(async e=>{const n=s<t,{txId:r,vout:a,outputData:i}=e,{balance:o}=i.data;return s+=o?parseInt(o,10):0,await b(r,a),n}).map(t=>({txId:t.txId,outputNumber:t.vout}));if(s<t)throw new Error("Insufficient token funds");const a=new x({balance:t.toString(10)},[e]),i=s-t,o=this.db.wallet.getPublicKey(),u=new x({balance:i.toString(10)},[o]);return this.db.update(r,[a,u])}async getBalance(){const t=await this.getTokenUtxos();return(await Promise.all(t.map(async t=>{const e=await S(t.txId),{publicKeys:n,data:s}=e[t.vout],r=new x(s,n).getData("balance");return r?parseInt(r,10):0}))).reduce((t,e)=>t+e,0)}async isValid(t){const e=await q.fromTxId(t);return await e.fetchOutputData(),this.isIssuance(e)?this.id.txId===e.getTxId():!!this.isTransfer(e)&&Promise.all(e.inputsWithData.map(async t=>this.isValid(t.prevTxId.toString("hex")))).then(t=>t.every(t=>t))}isIssuance(t){return 0===t.inputsWithData.length&&1===t.outputsWithData.length}isTransfer(t){return t.inputsWithData.length>=1}}const{Mnemonic:at}=e;class it{constructor(t){const e=t?new at(t):new at;this.wallet=new nt(e)}static getRandomMnemonic(){return nt.getRandomMnemonic().toString()}static fromMnemonic(t){return new this(t)}getMnemonic(){return this.wallet.getMnemonic().toString()}getPath(){return this.wallet.path}getPrivateKey(){return this.wallet.getPrivateKey().toString()}getPublicKey(){return this.wallet.getPublicKey().toString()}getAddress(t){const e=t||"legacy";if(!["legacy","bitpay","cashaddr"].includes(e))throw new Error("second parameter in wallet.getAddress must be 'legacy', 'bitpay', or 'cashaddr'");return this.wallet.getAddress().toString(e)}async getBalance(){return this.wallet.getBalance()}derive(t=0,e=!1){const n=new it,s=this.wallet.derive(t,e);return n.wallet=s,n}async send(t,e,n){const s=$.fromJSON({amount:t,address:e});return this.wallet.send([s],n)}async transaction(t,e){const n=t.map($.fromJSON);return this.wallet.send(n,e)}static fromHdPrivateKey(){throw new Error("\nwallet.fromHdPrivateKey is not supported anymore. Use wallet.fromMnemonic instead.\n\nFor example:\nconst mnemonic = Wallet.getRandomMnemonic()\nconst wallet = wallet.fromMnemonic(mnemonic)\n    ")}}const{Mnemonic:ot}=e;class ut{constructor(t){this.db=new st(t?t.wallet:null)}static fromMnemonic(t){const e=new ot(t),n=new this;return n.db=st.fromMnemonic(e),n}getWallet(){const t=this.db.wallet.getMnemonic();return it.fromMnemonic(t.toString())}toScriptOutputData(t){return x.fromJSON({kind:"script",publicKeys:t.owners||[this.getWallet().getPublicKey().toString()],data:t.data||{},amount:t.amount||s.MIN_NON_DUST_AMOUNT})}async return(t){const e=new _(t),{txId:n}=await this.db.wallet.send([e]);return{txId:n,outputNumber:0}}async put(t,e,n){const s={data:t,owners:e,amount:n},r=this.toScriptOutputData(s);return(await this.db.put([r]))[0]}async get(t){const e=c("publicKeys","owners",(await this.db.get([t]))[0].toJSON());return delete e.kind,e}async update(t,e,n,r=s.MIN_NON_DUST_AMOUNT){const a={data:e,owners:n,amount:r},i=this.toScriptOutputData(a);return(await this.db.update([t],[i]))[0]}async transaction(t){const e=t.map(t=>t.outputId),n=t.map(this.toScriptOutputData.bind(this));return this.db.update(e,n)}getMnemonic(){throw new Error("db.getMnemonic does not exist. Use db.getWallet().getMnemonic() instead.")}getPrivateKey(){throw new Error("db.getPrivateKey does not exist. Use db.getWallet().getPrivateKey() instead.")}getPublicKey(){throw new Error("db.getPublicKey does not exist. Use db.getWallet().getPublicKey() instead.")}getAddress(){throw new Error("db.getAddress does not exist. Use db.getWallet().getAddress() instead.")}static fromHdPrivateKey(){throw new Error("\ndb.fromHdPrivateKey is not supported anymore. Use db.fromMnemonic instead.\n\nFor example:\nconst mnemonic = Wallet.getRandomMnemonic()\nconst db = Db.fromMnemonic(mnemonic)\n    ")}}const{PublicKey:ct,Mnemonic:dt}=e;return t.Token=class{constructor(t){this.token=new rt(t?t.db:null)}static fromMnemonic(t){const e=new dt(t),n=new this;return n.token=rt.fromMnemonic(e),n}getWallet(){const t=this.token.db.wallet.getMnemonic();return it.fromMnemonic(t.toString())}getDb(){const t=this.token.db.wallet.getMnemonic();return ut.fromMnemonic(t.toString())}async create(t){return this.token.create(t)}join(t){return this.token.join(t)}async send(t,e){const n=ct.fromString(e);return this.token.send(t,n)}async getBalance(){return this.token.getBalance()}getMnemonic(){throw new Error("token.getMnemonic does not exist. Use token.getWallet().getMnemonic() instead.")}getPrivateKey(){throw new Error("token.getPrivateKey does not exist. Use token.getWallet().getPrivateKey() instead.")}getPublicKey(){throw new Error("token.getPublicKey does not exist. Use token.getWallet().getPublicKey() instead.")}getAddress(){throw new Error("token.getAddress does not exist. Use token.getWallet().getAddress() instead.")}static fromHdPrivateKey(){throw new Error("\ntoken.fromHdPrivateKey is not supported anymore. Use token.fromMnemonic instead.\n\nFor example:\nconst mnemonic = Wallet.getRandomMnemonic()\nconst token = Token.fromMnemonic(mnemonic)\n    ")}},t.Db=ut,t.Wallet=it,t}({},BitcoinSource,axios);
  
  }).call(this,require("buffer").Buffer)
  },{"buffer":3}],2:[function(require,module,exports){
  'use strict'
  
  exports.byteLength = byteLength
  exports.toByteArray = toByteArray
  exports.fromByteArray = fromByteArray
  
  var lookup = []
  var revLookup = []
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
  
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i]
    revLookup[code.charCodeAt(i)] = i
  }
  
  // Support decoding URL-safe base64 strings, as Node.js does.
  // See: https://en.wikipedia.org/wiki/Base64#URL_applications
  revLookup['-'.charCodeAt(0)] = 62
  revLookup['_'.charCodeAt(0)] = 63
  
  function getLens (b64) {
    var len = b64.length
  
    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4')
    }
  
    // Trim off extra bytes after placeholder bytes are found
    // See: https://github.com/beatgammit/base64-js/issues/42
    var validLen = b64.indexOf('=')
    if (validLen === -1) validLen = len
  
    var placeHoldersLen = validLen === len
      ? 0
      : 4 - (validLen % 4)
  
    return [validLen, placeHoldersLen]
  }
  
  // base64 is 4/3 + up to two characters of the original data
  function byteLength (b64) {
    var lens = getLens(b64)
    var validLen = lens[0]
    var placeHoldersLen = lens[1]
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
  }
  
  function _byteLength (b64, validLen, placeHoldersLen) {
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
  }
  
  function toByteArray (b64) {
    var tmp
    var lens = getLens(b64)
    var validLen = lens[0]
    var placeHoldersLen = lens[1]
  
    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))
  
    var curByte = 0
  
    // if there are placeholders, only get up to the last complete 4 chars
    var len = placeHoldersLen > 0
      ? validLen - 4
      : validLen
  
    for (var i = 0; i < len; i += 4) {
      tmp =
        (revLookup[b64.charCodeAt(i)] << 18) |
        (revLookup[b64.charCodeAt(i + 1)] << 12) |
        (revLookup[b64.charCodeAt(i + 2)] << 6) |
        revLookup[b64.charCodeAt(i + 3)]
      arr[curByte++] = (tmp >> 16) & 0xFF
      arr[curByte++] = (tmp >> 8) & 0xFF
      arr[curByte++] = tmp & 0xFF
    }
  
    if (placeHoldersLen === 2) {
      tmp =
        (revLookup[b64.charCodeAt(i)] << 2) |
        (revLookup[b64.charCodeAt(i + 1)] >> 4)
      arr[curByte++] = tmp & 0xFF
    }
  
    if (placeHoldersLen === 1) {
      tmp =
        (revLookup[b64.charCodeAt(i)] << 10) |
        (revLookup[b64.charCodeAt(i + 1)] << 4) |
        (revLookup[b64.charCodeAt(i + 2)] >> 2)
      arr[curByte++] = (tmp >> 8) & 0xFF
      arr[curByte++] = tmp & 0xFF
    }
  
    return arr
  }
  
  function tripletToBase64 (num) {
    return lookup[num >> 18 & 0x3F] +
      lookup[num >> 12 & 0x3F] +
      lookup[num >> 6 & 0x3F] +
      lookup[num & 0x3F]
  }
  
  function encodeChunk (uint8, start, end) {
    var tmp
    var output = []
    for (var i = start; i < end; i += 3) {
      tmp =
        ((uint8[i] << 16) & 0xFF0000) +
        ((uint8[i + 1] << 8) & 0xFF00) +
        (uint8[i + 2] & 0xFF)
      output.push(tripletToBase64(tmp))
    }
    return output.join('')
  }
  
  function fromByteArray (uint8) {
    var tmp
    var len = uint8.length
    var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
    var parts = []
    var maxChunkLength = 16383 // must be multiple of 3
  
    // go through the array every three bytes, we'll deal with trailing stuff later
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(
        uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
      ))
    }
  
    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
      tmp = uint8[len - 1]
      parts.push(
        lookup[tmp >> 2] +
        lookup[(tmp << 4) & 0x3F] +
        '=='
      )
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1]
      parts.push(
        lookup[tmp >> 10] +
        lookup[(tmp >> 4) & 0x3F] +
        lookup[(tmp << 2) & 0x3F] +
        '='
      )
    }
  
    return parts.join('')
  }
  
  },{}],3:[function(require,module,exports){
  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */
  /* eslint-disable no-proto */
  
  'use strict'
  
  var base64 = require('base64-js')
  var ieee754 = require('ieee754')
  
  exports.Buffer = Buffer
  exports.SlowBuffer = SlowBuffer
  exports.INSPECT_MAX_BYTES = 50
  
  var K_MAX_LENGTH = 0x7fffffff
  exports.kMaxLength = K_MAX_LENGTH
  
  /**
   * If `Buffer.TYPED_ARRAY_SUPPORT`:
   *   === true    Use Uint8Array implementation (fastest)
   *   === false   Print warning and recommend using `buffer` v4.x which has an Object
   *               implementation (most compatible, even IE6)
   *
   * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
   * Opera 11.6+, iOS 4.2+.
   *
   * We report that the browser does not support typed arrays if the are not subclassable
   * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
   * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
   * for __proto__ and has a buggy typed array implementation.
   */
  Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()
  
  if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
      typeof console.error === 'function') {
    console.error(
      'This browser lacks typed array (Uint8Array) support which is required by ' +
      '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
    )
  }
  
  function typedArraySupport () {
    // Can typed array instances can be augmented?
    try {
      var arr = new Uint8Array(1)
      arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
      return arr.foo() === 42
    } catch (e) {
      return false
    }
  }
  
  Object.defineProperty(Buffer.prototype, 'parent', {
    enumerable: true,
    get: function () {
      if (!Buffer.isBuffer(this)) return undefined
      return this.buffer
    }
  })
  
  Object.defineProperty(Buffer.prototype, 'offset', {
    enumerable: true,
    get: function () {
      if (!Buffer.isBuffer(this)) return undefined
      return this.byteOffset
    }
  })
  
  function createBuffer (length) {
    if (length > K_MAX_LENGTH) {
      throw new RangeError('The value "' + length + '" is invalid for option "size"')
    }
    // Return an augmented `Uint8Array` instance
    var buf = new Uint8Array(length)
    buf.__proto__ = Buffer.prototype
    return buf
  }
  
  /**
   * The Buffer constructor returns instances of `Uint8Array` that have their
   * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
   * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
   * and the `Uint8Array` methods. Square bracket notation works as expected -- it
   * returns a single octet.
   *
   * The `Uint8Array` prototype remains unmodified.
   */
  
  function Buffer (arg, encodingOrOffset, length) {
    // Common case.
    if (typeof arg === 'number') {
      if (typeof encodingOrOffset === 'string') {
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        )
      }
      return allocUnsafe(arg)
    }
    return from(arg, encodingOrOffset, length)
  }
  
  // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
  if (typeof Symbol !== 'undefined' && Symbol.species != null &&
      Buffer[Symbol.species] === Buffer) {
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true,
      enumerable: false,
      writable: false
    })
  }
  
  Buffer.poolSize = 8192 // not used by this implementation
  
  function from (value, encodingOrOffset, length) {
    if (typeof value === 'string') {
      return fromString(value, encodingOrOffset)
    }
  
    if (ArrayBuffer.isView(value)) {
      return fromArrayLike(value)
    }
  
    if (value == null) {
      throw TypeError(
        'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
        'or Array-like Object. Received type ' + (typeof value)
      )
    }
  
    if (isInstance(value, ArrayBuffer) ||
        (value && isInstance(value.buffer, ArrayBuffer))) {
      return fromArrayBuffer(value, encodingOrOffset, length)
    }
  
    if (typeof value === 'number') {
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      )
    }
  
    var valueOf = value.valueOf && value.valueOf()
    if (valueOf != null && valueOf !== value) {
      return Buffer.from(valueOf, encodingOrOffset, length)
    }
  
    var b = fromObject(value)
    if (b) return b
  
    if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
        typeof value[Symbol.toPrimitive] === 'function') {
      return Buffer.from(
        value[Symbol.toPrimitive]('string'), encodingOrOffset, length
      )
    }
  
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }
  
  /**
   * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
   * if value is a number.
   * Buffer.from(str[, encoding])
   * Buffer.from(array)
   * Buffer.from(buffer)
   * Buffer.from(arrayBuffer[, byteOffset[, length]])
   **/
  Buffer.from = function (value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length)
  }
  
  // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
  // https://github.com/feross/buffer/pull/148
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  
  function assertSize (size) {
    if (typeof size !== 'number') {
      throw new TypeError('"size" argument must be of type number')
    } else if (size < 0) {
      throw new RangeError('The value "' + size + '" is invalid for option "size"')
    }
  }
  
  function alloc (size, fill, encoding) {
    assertSize(size)
    if (size <= 0) {
      return createBuffer(size)
    }
    if (fill !== undefined) {
      // Only pay attention to encoding if it's a string. This
      // prevents accidentally sending in a number that would
      // be interpretted as a start offset.
      return typeof encoding === 'string'
        ? createBuffer(size).fill(fill, encoding)
        : createBuffer(size).fill(fill)
    }
    return createBuffer(size)
  }
  
  /**
   * Creates a new filled Buffer instance.
   * alloc(size[, fill[, encoding]])
   **/
  Buffer.alloc = function (size, fill, encoding) {
    return alloc(size, fill, encoding)
  }
  
  function allocUnsafe (size) {
    assertSize(size)
    return createBuffer(size < 0 ? 0 : checked(size) | 0)
  }
  
  /**
   * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
   * */
  Buffer.allocUnsafe = function (size) {
    return allocUnsafe(size)
  }
  /**
   * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
   */
  Buffer.allocUnsafeSlow = function (size) {
    return allocUnsafe(size)
  }
  
  function fromString (string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') {
      encoding = 'utf8'
    }
  
    if (!Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  
    var length = byteLength(string, encoding) | 0
    var buf = createBuffer(length)
  
    var actual = buf.write(string, encoding)
  
    if (actual !== length) {
      // Writing a hex string, for example, that contains invalid characters will
      // cause everything after the first invalid character to be ignored. (e.g.
      // 'abxxcd' will be treated as 'ab')
      buf = buf.slice(0, actual)
    }
  
    return buf
  }
  
  function fromArrayLike (array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0
    var buf = createBuffer(length)
    for (var i = 0; i < length; i += 1) {
      buf[i] = array[i] & 255
    }
    return buf
  }
  
  function fromArrayBuffer (array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('"offset" is outside of buffer bounds')
    }
  
    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('"length" is outside of buffer bounds')
    }
  
    var buf
    if (byteOffset === undefined && length === undefined) {
      buf = new Uint8Array(array)
    } else if (length === undefined) {
      buf = new Uint8Array(array, byteOffset)
    } else {
      buf = new Uint8Array(array, byteOffset, length)
    }
  
    // Return an augmented `Uint8Array` instance
    buf.__proto__ = Buffer.prototype
    return buf
  }
  
  function fromObject (obj) {
    if (Buffer.isBuffer(obj)) {
      var len = checked(obj.length) | 0
      var buf = createBuffer(len)
  
      if (buf.length === 0) {
        return buf
      }
  
      obj.copy(buf, 0, 0, len)
      return buf
    }
  
    if (obj.length !== undefined) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }
  
    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }
  
  function checked (length) {
    // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
    // length is NaN (which is otherwise coerced to zero.)
    if (length >= K_MAX_LENGTH) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                           'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
    }
    return length | 0
  }
  
  function SlowBuffer (length) {
    if (+length != length) { // eslint-disable-line eqeqeq
      length = 0
    }
    return Buffer.alloc(+length)
  }
  
  Buffer.isBuffer = function isBuffer (b) {
    return b != null && b._isBuffer === true &&
      b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
  }
  
  Buffer.compare = function compare (a, b) {
    if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
    if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      )
    }
  
    if (a === b) return 0
  
    var x = a.length
    var y = b.length
  
    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i]
        y = b[i]
        break
      }
    }
  
    if (x < y) return -1
    if (y < x) return 1
    return 0
  }
  
  Buffer.isEncoding = function isEncoding (encoding) {
    switch (String(encoding).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'latin1':
      case 'binary':
      case 'base64':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return true
      default:
        return false
    }
  }
  
  Buffer.concat = function concat (list, length) {
    if (!Array.isArray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
  
    if (list.length === 0) {
      return Buffer.alloc(0)
    }
  
    var i
    if (length === undefined) {
      length = 0
      for (i = 0; i < list.length; ++i) {
        length += list[i].length
      }
    }
  
    var buffer = Buffer.allocUnsafe(length)
    var pos = 0
    for (i = 0; i < list.length; ++i) {
      var buf = list[i]
      if (isInstance(buf, Uint8Array)) {
        buf = Buffer.from(buf)
      }
      if (!Buffer.isBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
      buf.copy(buffer, pos)
      pos += buf.length
    }
    return buffer
  }
  
  function byteLength (string, encoding) {
    if (Buffer.isBuffer(string)) {
      return string.length
    }
    if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
      return string.byteLength
    }
    if (typeof string !== 'string') {
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
        'Received type ' + typeof string
      )
    }
  
    var len = string.length
    var mustMatch = (arguments.length > 2 && arguments[2] === true)
    if (!mustMatch && len === 0) return 0
  
    // Use a for loop to avoid recursion
    var loweredCase = false
    for (;;) {
      switch (encoding) {
        case 'ascii':
        case 'latin1':
        case 'binary':
          return len
        case 'utf8':
        case 'utf-8':
          return utf8ToBytes(string).length
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return len * 2
        case 'hex':
          return len >>> 1
        case 'base64':
          return base64ToBytes(string).length
        default:
          if (loweredCase) {
            return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
          }
          encoding = ('' + encoding).toLowerCase()
          loweredCase = true
      }
    }
  }
  Buffer.byteLength = byteLength
  
  function slowToString (encoding, start, end) {
    var loweredCase = false
  
    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
    // property of a typed array.
  
    // This behaves neither like String nor Uint8Array in that we set start/end
    // to their upper/lower bounds if the value passed is out of range.
    // undefined is handled specially as per ECMA-262 6th Edition,
    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
    if (start === undefined || start < 0) {
      start = 0
    }
    // Return early if start > this.length. Done here to prevent potential uint32
    // coercion fail below.
    if (start > this.length) {
      return ''
    }
  
    if (end === undefined || end > this.length) {
      end = this.length
    }
  
    if (end <= 0) {
      return ''
    }
  
    // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0
    start >>>= 0
  
    if (end <= start) {
      return ''
    }
  
    if (!encoding) encoding = 'utf8'
  
    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end)
  
        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end)
  
        case 'ascii':
          return asciiSlice(this, start, end)
  
        case 'latin1':
        case 'binary':
          return latin1Slice(this, start, end)
  
        case 'base64':
          return base64Slice(this, start, end)
  
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end)
  
        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = (encoding + '').toLowerCase()
          loweredCase = true
      }
    }
  }
  
  // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
  // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
  // reliably in a browserify context because there could be multiple different
  // copies of the 'buffer' package in use. This method works even for Buffer
  // instances that were created from another copy of the `buffer` package.
  // See: https://github.com/feross/buffer/issues/154
  Buffer.prototype._isBuffer = true
  
  function swap (b, n, m) {
    var i = b[n]
    b[n] = b[m]
    b[m] = i
  }
  
  Buffer.prototype.swap16 = function swap16 () {
    var len = this.length
    if (len % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 16-bits')
    }
    for (var i = 0; i < len; i += 2) {
      swap(this, i, i + 1)
    }
    return this
  }
  
  Buffer.prototype.swap32 = function swap32 () {
    var len = this.length
    if (len % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits')
    }
    for (var i = 0; i < len; i += 4) {
      swap(this, i, i + 3)
      swap(this, i + 1, i + 2)
    }
    return this
  }
  
  Buffer.prototype.swap64 = function swap64 () {
    var len = this.length
    if (len % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits')
    }
    for (var i = 0; i < len; i += 8) {
      swap(this, i, i + 7)
      swap(this, i + 1, i + 6)
      swap(this, i + 2, i + 5)
      swap(this, i + 3, i + 4)
    }
    return this
  }
  
  Buffer.prototype.toString = function toString () {
    var length = this.length
    if (length === 0) return ''
    if (arguments.length === 0) return utf8Slice(this, 0, length)
    return slowToString.apply(this, arguments)
  }
  
  Buffer.prototype.toLocaleString = Buffer.prototype.toString
  
  Buffer.prototype.equals = function equals (b) {
    if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
    if (this === b) return true
    return Buffer.compare(this, b) === 0
  }
  
  Buffer.prototype.inspect = function inspect () {
    var str = ''
    var max = exports.INSPECT_MAX_BYTES
    str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
    if (this.length > max) str += ' ... '
    return '<Buffer ' + str + '>'
  }
  
  Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
    if (isInstance(target, Uint8Array)) {
      target = Buffer.from(target, target.offset, target.byteLength)
    }
    if (!Buffer.isBuffer(target)) {
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. ' +
        'Received type ' + (typeof target)
      )
    }
  
    if (start === undefined) {
      start = 0
    }
    if (end === undefined) {
      end = target ? target.length : 0
    }
    if (thisStart === undefined) {
      thisStart = 0
    }
    if (thisEnd === undefined) {
      thisEnd = this.length
    }
  
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError('out of range index')
    }
  
    if (thisStart >= thisEnd && start >= end) {
      return 0
    }
    if (thisStart >= thisEnd) {
      return -1
    }
    if (start >= end) {
      return 1
    }
  
    start >>>= 0
    end >>>= 0
    thisStart >>>= 0
    thisEnd >>>= 0
  
    if (this === target) return 0
  
    var x = thisEnd - thisStart
    var y = end - start
    var len = Math.min(x, y)
  
    var thisCopy = this.slice(thisStart, thisEnd)
    var targetCopy = target.slice(start, end)
  
    for (var i = 0; i < len; ++i) {
      if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i]
        y = targetCopy[i]
        break
      }
    }
  
    if (x < y) return -1
    if (y < x) return 1
    return 0
  }
  
  // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
  // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
  //
  // Arguments:
  // - buffer - a Buffer to search
  // - val - a string, Buffer, or number
  // - byteOffset - an index into `buffer`; will be clamped to an int32
  // - encoding - an optional encoding, relevant is val is a string
  // - dir - true for indexOf, false for lastIndexOf
  function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
    // Empty buffer means no match
    if (buffer.length === 0) return -1
  
    // Normalize byteOffset
    if (typeof byteOffset === 'string') {
      encoding = byteOffset
      byteOffset = 0
    } else if (byteOffset > 0x7fffffff) {
      byteOffset = 0x7fffffff
    } else if (byteOffset < -0x80000000) {
      byteOffset = -0x80000000
    }
    byteOffset = +byteOffset // Coerce to Number.
    if (numberIsNaN(byteOffset)) {
      // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
      byteOffset = dir ? 0 : (buffer.length - 1)
    }
  
    // Normalize byteOffset: negative offsets start from the end of the buffer
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset
    if (byteOffset >= buffer.length) {
      if (dir) return -1
      else byteOffset = buffer.length - 1
    } else if (byteOffset < 0) {
      if (dir) byteOffset = 0
      else return -1
    }
  
    // Normalize val
    if (typeof val === 'string') {
      val = Buffer.from(val, encoding)
    }
  
    // Finally, search either indexOf (if dir is true) or lastIndexOf
    if (Buffer.isBuffer(val)) {
      // Special case: looking for empty string/buffer always fails
      if (val.length === 0) {
        return -1
      }
      return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
    } else if (typeof val === 'number') {
      val = val & 0xFF // Search for a byte value [0-255]
      if (typeof Uint8Array.prototype.indexOf === 'function') {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
        }
      }
      return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
    }
  
    throw new TypeError('val must be string, number or Buffer')
  }
  
  function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
    var indexSize = 1
    var arrLength = arr.length
    var valLength = val.length
  
    if (encoding !== undefined) {
      encoding = String(encoding).toLowerCase()
      if (encoding === 'ucs2' || encoding === 'ucs-2' ||
          encoding === 'utf16le' || encoding === 'utf-16le') {
        if (arr.length < 2 || val.length < 2) {
          return -1
        }
        indexSize = 2
        arrLength /= 2
        valLength /= 2
        byteOffset /= 2
      }
    }
  
    function read (buf, i) {
      if (indexSize === 1) {
        return buf[i]
      } else {
        return buf.readUInt16BE(i * indexSize)
      }
    }
  
    var i
    if (dir) {
      var foundIndex = -1
      for (i = byteOffset; i < arrLength; i++) {
        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1) foundIndex = i
          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
        } else {
          if (foundIndex !== -1) i -= i - foundIndex
          foundIndex = -1
        }
      }
    } else {
      if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
      for (i = byteOffset; i >= 0; i--) {
        var found = true
        for (var j = 0; j < valLength; j++) {
          if (read(arr, i + j) !== read(val, j)) {
            found = false
            break
          }
        }
        if (found) return i
      }
    }
  
    return -1
  }
  
  Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1
  }
  
  Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
  }
  
  Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
  }
  
  function hexWrite (buf, string, offset, length) {
    offset = Number(offset) || 0
    var remaining = buf.length - offset
    if (!length) {
      length = remaining
    } else {
      length = Number(length)
      if (length > remaining) {
        length = remaining
      }
    }
  
    var strLen = string.length
  
    if (length > strLen / 2) {
      length = strLen / 2
    }
    for (var i = 0; i < length; ++i) {
      var parsed = parseInt(string.substr(i * 2, 2), 16)
      if (numberIsNaN(parsed)) return i
      buf[offset + i] = parsed
    }
    return i
  }
  
  function utf8Write (buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  }
  
  function asciiWrite (buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length)
  }
  
  function latin1Write (buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length)
  }
  
  function base64Write (buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length)
  }
  
  function ucs2Write (buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
  }
  
  Buffer.prototype.write = function write (string, offset, length, encoding) {
    // Buffer#write(string)
    if (offset === undefined) {
      encoding = 'utf8'
      length = this.length
      offset = 0
    // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset
      length = this.length
      offset = 0
    // Buffer#write(string, offset[, length][, encoding])
    } else if (isFinite(offset)) {
      offset = offset >>> 0
      if (isFinite(length)) {
        length = length >>> 0
        if (encoding === undefined) encoding = 'utf8'
      } else {
        encoding = length
        length = undefined
      }
    } else {
      throw new Error(
        'Buffer.write(string, encoding, offset[, length]) is no longer supported'
      )
    }
  
    var remaining = this.length - offset
    if (length === undefined || length > remaining) length = remaining
  
    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
      throw new RangeError('Attempt to write outside buffer bounds')
    }
  
    if (!encoding) encoding = 'utf8'
  
    var loweredCase = false
    for (;;) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length)
  
        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length)
  
        case 'ascii':
          return asciiWrite(this, string, offset, length)
  
        case 'latin1':
        case 'binary':
          return latin1Write(this, string, offset, length)
  
        case 'base64':
          // Warning: maxLength not taken into account in base64Write
          return base64Write(this, string, offset, length)
  
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length)
  
        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = ('' + encoding).toLowerCase()
          loweredCase = true
      }
    }
  }
  
  Buffer.prototype.toJSON = function toJSON () {
    return {
      type: 'Buffer',
      data: Array.prototype.slice.call(this._arr || this, 0)
    }
  }
  
  function base64Slice (buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64.fromByteArray(buf)
    } else {
      return base64.fromByteArray(buf.slice(start, end))
    }
  }
  
  function utf8Slice (buf, start, end) {
    end = Math.min(buf.length, end)
    var res = []
  
    var i = start
    while (i < end) {
      var firstByte = buf[i]
      var codePoint = null
      var bytesPerSequence = (firstByte > 0xEF) ? 4
        : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
            : 1
  
      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint
  
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte
            }
            break
          case 2:
            secondByte = buf[i + 1]
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint
              }
            }
            break
          case 3:
            secondByte = buf[i + 1]
            thirdByte = buf[i + 2]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint
              }
            }
            break
          case 4:
            secondByte = buf[i + 1]
            thirdByte = buf[i + 2]
            fourthByte = buf[i + 3]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint
              }
            }
        }
      }
  
      if (codePoint === null) {
        // we did not generate a valid codePoint so insert a
        // replacement char (U+FFFD) and advance only 1 byte
        codePoint = 0xFFFD
        bytesPerSequence = 1
      } else if (codePoint > 0xFFFF) {
        // encode to utf16 (surrogate pair dance)
        codePoint -= 0x10000
        res.push(codePoint >>> 10 & 0x3FF | 0xD800)
        codePoint = 0xDC00 | codePoint & 0x3FF
      }
  
      res.push(codePoint)
      i += bytesPerSequence
    }
  
    return decodeCodePointsArray(res)
  }
  
  // Based on http://stackoverflow.com/a/22747272/680742, the browser with
  // the lowest limit is Chrome, with 0x10000 args.
  // We go 1 magnitude less, for safety
  var MAX_ARGUMENTS_LENGTH = 0x1000
  
  function decodeCodePointsArray (codePoints) {
    var len = codePoints.length
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    }
  
    // Decode in chunks to avoid "call stack size exceeded".
    var res = ''
    var i = 0
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      )
    }
    return res
  }
  
  function asciiSlice (buf, start, end) {
    var ret = ''
    end = Math.min(buf.length, end)
  
    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 0x7F)
    }
    return ret
  }
  
  function latin1Slice (buf, start, end) {
    var ret = ''
    end = Math.min(buf.length, end)
  
    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i])
    }
    return ret
  }
  
  function hexSlice (buf, start, end) {
    var len = buf.length
  
    if (!start || start < 0) start = 0
    if (!end || end < 0 || end > len) end = len
  
    var out = ''
    for (var i = start; i < end; ++i) {
      out += toHex(buf[i])
    }
    return out
  }
  
  function utf16leSlice (buf, start, end) {
    var bytes = buf.slice(start, end)
    var res = ''
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
    }
    return res
  }
  
  Buffer.prototype.slice = function slice (start, end) {
    var len = this.length
    start = ~~start
    end = end === undefined ? len : ~~end
  
    if (start < 0) {
      start += len
      if (start < 0) start = 0
    } else if (start > len) {
      start = len
    }
  
    if (end < 0) {
      end += len
      if (end < 0) end = 0
    } else if (end > len) {
      end = len
    }
  
    if (end < start) end = start
  
    var newBuf = this.subarray(start, end)
    // Return an augmented `Uint8Array` instance
    newBuf.__proto__ = Buffer.prototype
    return newBuf
  }
  
  /*
   * Need to make sure that buffer isn't trying to write out of bounds.
   */
  function checkOffset (offset, ext, length) {
    if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
  }
  
  Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (!noAssert) checkOffset(offset, byteLength, this.length)
  
    var val = this[offset]
    var mul = 1
    var i = 0
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul
    }
  
    return val
  }
  
  Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (!noAssert) {
      checkOffset(offset, byteLength, this.length)
    }
  
    var val = this[offset + --byteLength]
    var mul = 1
    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul
    }
  
    return val
  }
  
  Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 1, this.length)
    return this[offset]
  }
  
  Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 2, this.length)
    return this[offset] | (this[offset + 1] << 8)
  }
  
  Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 2, this.length)
    return (this[offset] << 8) | this[offset + 1]
  }
  
  Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 4, this.length)
  
    return ((this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16)) +
        (this[offset + 3] * 0x1000000)
  }
  
  Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 4, this.length)
  
    return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
  }
  
  Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (!noAssert) checkOffset(offset, byteLength, this.length)
  
    var val = this[offset]
    var mul = 1
    var i = 0
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul
    }
    mul *= 0x80
  
    if (val >= mul) val -= Math.pow(2, 8 * byteLength)
  
    return val
  }
  
  Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (!noAssert) checkOffset(offset, byteLength, this.length)
  
    var i = byteLength
    var mul = 1
    var val = this[offset + --i]
    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul
    }
    mul *= 0x80
  
    if (val >= mul) val -= Math.pow(2, 8 * byteLength)
  
    return val
  }
  
  Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 1, this.length)
    if (!(this[offset] & 0x80)) return (this[offset])
    return ((0xff - this[offset] + 1) * -1)
  }
  
  Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 2, this.length)
    var val = this[offset] | (this[offset + 1] << 8)
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  }
  
  Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 2, this.length)
    var val = this[offset + 1] | (this[offset] << 8)
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  }
  
  Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 4, this.length)
  
    return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
  }
  
  Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 4, this.length)
  
    return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
  }
  
  Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 4, this.length)
    return ieee754.read(this, offset, true, 23, 4)
  }
  
  Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 4, this.length)
    return ieee754.read(this, offset, false, 23, 4)
  }
  
  Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 8, this.length)
    return ieee754.read(this, offset, true, 52, 8)
  }
  
  Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
    offset = offset >>> 0
    if (!noAssert) checkOffset(offset, 8, this.length)
    return ieee754.read(this, offset, false, 52, 8)
  }
  
  function checkInt (buf, value, offset, ext, max, min) {
    if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
  }
  
  Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
    value = +value
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1
      checkInt(this, value, offset, byteLength, maxBytes, 0)
    }
  
    var mul = 1
    var i = 0
    this[offset] = value & 0xFF
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF
    }
  
    return offset + byteLength
  }
  
  Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
    value = +value
    offset = offset >>> 0
    byteLength = byteLength >>> 0
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1
      checkInt(this, value, offset, byteLength, maxBytes, 0)
    }
  
    var i = byteLength - 1
    var mul = 1
    this[offset + i] = value & 0xFF
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF
    }
  
    return offset + byteLength
  }
  
  Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
    this[offset] = (value & 0xff)
    return offset + 1
  }
  
  Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    return offset + 2
  }
  
  Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
    return offset + 2
  }
  
  Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
    return offset + 4
  }
  
  Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
    return offset + 4
  }
  
  Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) {
      var limit = Math.pow(2, (8 * byteLength) - 1)
  
      checkInt(this, value, offset, byteLength, limit - 1, -limit)
    }
  
    var i = 0
    var mul = 1
    var sub = 0
    this[offset] = value & 0xFF
    while (++i < byteLength && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
        sub = 1
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
    }
  
    return offset + byteLength
  }
  
  Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) {
      var limit = Math.pow(2, (8 * byteLength) - 1)
  
      checkInt(this, value, offset, byteLength, limit - 1, -limit)
    }
  
    var i = byteLength - 1
    var mul = 1
    var sub = 0
    this[offset + i] = value & 0xFF
    while (--i >= 0 && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
        sub = 1
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
    }
  
    return offset + byteLength
  }
  
  Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
    if (value < 0) value = 0xff + value + 1
    this[offset] = (value & 0xff)
    return offset + 1
  }
  
  Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    return offset + 2
  }
  
  Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
    return offset + 2
  }
  
  Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
    return offset + 4
  }
  
  Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
    if (value < 0) value = 0xffffffff + value + 1
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
    return offset + 4
  }
  
  function checkIEEE754 (buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
    if (offset < 0) throw new RangeError('Index out of range')
  }
  
  function writeFloat (buf, value, offset, littleEndian, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
    }
    ieee754.write(buf, value, offset, littleEndian, 23, 4)
    return offset + 4
  }
  
  Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert)
  }
  
  Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert)
  }
  
  function writeDouble (buf, value, offset, littleEndian, noAssert) {
    value = +value
    offset = offset >>> 0
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
    }
    ieee754.write(buf, value, offset, littleEndian, 52, 8)
    return offset + 8
  }
  
  Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert)
  }
  
  Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert)
  }
  
  // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
  Buffer.prototype.copy = function copy (target, targetStart, start, end) {
    if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
    if (!start) start = 0
    if (!end && end !== 0) end = this.length
    if (targetStart >= target.length) targetStart = target.length
    if (!targetStart) targetStart = 0
    if (end > 0 && end < start) end = start
  
    // Copy 0 bytes; we're done
    if (end === start) return 0
    if (target.length === 0 || this.length === 0) return 0
  
    // Fatal error conditions
    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds')
    }
    if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
    if (end < 0) throw new RangeError('sourceEnd out of bounds')
  
    // Are we oob?
    if (end > this.length) end = this.length
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start
    }
  
    var len = end - start
  
    if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
      // Use built-in when available, missing from IE11
      this.copyWithin(targetStart, start, end)
    } else if (this === target && start < targetStart && targetStart < end) {
      // descending copy from end
      for (var i = len - 1; i >= 0; --i) {
        target[i + targetStart] = this[i + start]
      }
    } else {
      Uint8Array.prototype.set.call(
        target,
        this.subarray(start, end),
        targetStart
      )
    }
  
    return len
  }
  
  // Usage:
  //    buffer.fill(number[, offset[, end]])
  //    buffer.fill(buffer[, offset[, end]])
  //    buffer.fill(string[, offset[, end]][, encoding])
  Buffer.prototype.fill = function fill (val, start, end, encoding) {
    // Handle string cases:
    if (typeof val === 'string') {
      if (typeof start === 'string') {
        encoding = start
        start = 0
        end = this.length
      } else if (typeof end === 'string') {
        encoding = end
        end = this.length
      }
      if (encoding !== undefined && typeof encoding !== 'string') {
        throw new TypeError('encoding must be a string')
      }
      if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding)
      }
      if (val.length === 1) {
        var code = val.charCodeAt(0)
        if ((encoding === 'utf8' && code < 128) ||
            encoding === 'latin1') {
          // Fast path: If `val` fits into a single byte, use that numeric value.
          val = code
        }
      }
    } else if (typeof val === 'number') {
      val = val & 255
    }
  
    // Invalid ranges are not set to a default, so can range check early.
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError('Out of range index')
    }
  
    if (end <= start) {
      return this
    }
  
    start = start >>> 0
    end = end === undefined ? this.length : end >>> 0
  
    if (!val) val = 0
  
    var i
    if (typeof val === 'number') {
      for (i = start; i < end; ++i) {
        this[i] = val
      }
    } else {
      var bytes = Buffer.isBuffer(val)
        ? val
        : Buffer.from(val, encoding)
      var len = bytes.length
      if (len === 0) {
        throw new TypeError('The value "' + val +
          '" is invalid for argument "value"')
      }
      for (i = 0; i < end - start; ++i) {
        this[i + start] = bytes[i % len]
      }
    }
  
    return this
  }
  
  // HELPER FUNCTIONS
  // ================
  
  var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g
  
  function base64clean (str) {
    // Node takes equal signs as end of the Base64 encoding
    str = str.split('=')[0]
    // Node strips out invalid characters like \n and \t from the string, base64-js does not
    str = str.trim().replace(INVALID_BASE64_RE, '')
    // Node converts strings with length < 2 to ''
    if (str.length < 2) return ''
    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
    while (str.length % 4 !== 0) {
      str = str + '='
    }
    return str
  }
  
  function toHex (n) {
    if (n < 16) return '0' + n.toString(16)
    return n.toString(16)
  }
  
  function utf8ToBytes (string, units) {
    units = units || Infinity
    var codePoint
    var length = string.length
    var leadSurrogate = null
    var bytes = []
  
    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i)
  
      // is surrogate component
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        // last char was a lead
        if (!leadSurrogate) {
          // no lead yet
          if (codePoint > 0xDBFF) {
            // unexpected trail
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
            continue
          } else if (i + 1 === length) {
            // unpaired lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
            continue
          }
  
          // valid lead
          leadSurrogate = codePoint
  
          continue
        }
  
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        }
  
        // valid surrogate pair
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
      } else if (leadSurrogate) {
        // valid bmp char, but last char was a lead
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      }
  
      leadSurrogate = null
  
      // encode utf8
      if (codePoint < 0x80) {
        if ((units -= 1) < 0) break
        bytes.push(codePoint)
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0) break
        bytes.push(
          codePoint >> 0x6 | 0xC0,
          codePoint & 0x3F | 0x80
        )
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0) break
        bytes.push(
          codePoint >> 0xC | 0xE0,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        )
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0) break
        bytes.push(
          codePoint >> 0x12 | 0xF0,
          codePoint >> 0xC & 0x3F | 0x80,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        )
      } else {
        throw new Error('Invalid code point')
      }
    }
  
    return bytes
  }
  
  function asciiToBytes (str) {
    var byteArray = []
    for (var i = 0; i < str.length; ++i) {
      // Node's code seems to be doing this and not & 0x7F..
      byteArray.push(str.charCodeAt(i) & 0xFF)
    }
    return byteArray
  }
  
  function utf16leToBytes (str, units) {
    var c, hi, lo
    var byteArray = []
    for (var i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0) break
  
      c = str.charCodeAt(i)
      hi = c >> 8
      lo = c % 256
      byteArray.push(lo)
      byteArray.push(hi)
    }
  
    return byteArray
  }
  
  function base64ToBytes (str) {
    return base64.toByteArray(base64clean(str))
  }
  
  function blitBuffer (src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if ((i + offset >= dst.length) || (i >= src.length)) break
      dst[i + offset] = src[i]
    }
    return i
  }
  
  // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
  // the `instanceof` check but they should be treated as of that type.
  // See: https://github.com/feross/buffer/issues/166
  function isInstance (obj, type) {
    return obj instanceof type ||
      (obj != null && obj.constructor != null && obj.constructor.name != null &&
        obj.constructor.name === type.name)
  }
  function numberIsNaN (obj) {
    // For IE11 support
    return obj !== obj // eslint-disable-line no-self-compare
  }
  
  },{"base64-js":2,"ieee754":4}],4:[function(require,module,exports){
  exports.read = function (buffer, offset, isLE, mLen, nBytes) {
    var e, m
    var eLen = (nBytes * 8) - mLen - 1
    var eMax = (1 << eLen) - 1
    var eBias = eMax >> 1
    var nBits = -7
    var i = isLE ? (nBytes - 1) : 0
    var d = isLE ? -1 : 1
    var s = buffer[offset + i]
  
    i += d
  
    e = s & ((1 << (-nBits)) - 1)
    s >>= (-nBits)
    nBits += eLen
    for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}
  
    m = e & ((1 << (-nBits)) - 1)
    e >>= (-nBits)
    nBits += mLen
    for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}
  
    if (e === 0) {
      e = 1 - eBias
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity)
    } else {
      m = m + Math.pow(2, mLen)
      e = e - eBias
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
  }
  
  exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c
    var eLen = (nBytes * 8) - mLen - 1
    var eMax = (1 << eLen) - 1
    var eBias = eMax >> 1
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
    var i = isLE ? 0 : (nBytes - 1)
    var d = isLE ? 1 : -1
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
  
    value = Math.abs(value)
  
    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0
      e = eMax
    } else {
      e = Math.floor(Math.log(value) / Math.LN2)
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--
        c *= 2
      }
      if (e + eBias >= 1) {
        value += rt / c
      } else {
        value += rt * Math.pow(2, 1 - eBias)
      }
      if (value * c >= 2) {
        e++
        c /= 2
      }
  
      if (e + eBias >= eMax) {
        m = 0
        e = eMax
      } else if (e + eBias >= 1) {
        m = ((value * c) - 1) * Math.pow(2, mLen)
        e = e + eBias
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
        e = 0
      }
    }
  
    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
  
    e = (e << mLen) | m
    eLen += mLen
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
  
    buffer[offset + i - d] |= s * 128
  }
  
  },{}]},{},[1]);
  
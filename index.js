// Copyright 2018 Jeffrey M. Laughlin

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


class Device {
  _nullState() {
    return {speed: null, volume: null, brightness: null};
  }

  constructor(href, timeout=10000, interval=2000) {
    this.href = href;
    this.timeout = timeout;
    this.interval = interval;
    this.command = null;
    // TODO on connect, get state, and set command to state
    // this.state = null;
    this._waiters = [];
    this._connected = false;
    this._pinger();
  }

  getState() {
    return new Promise((resolve, reject)=>
      this._waiters.push([resolve, reject]));
  }

  _resolveWaiters(state) {
    let waiters = this._waiters;
    this._waiters = [];
    waiters.forEach(waiter=>waiter[0](state));
  }

  _rejectWaiters(reason) {
    let waiters = this._waiters;
    this._waiters = [];
    waiters.forEach(waiter=>waiter[1](reason));
  }

  async _pinger() {
    try {
      console.debug('ping ' + this.command);
      // this.state = this._refreshState(this.command);
      // let state = await this.state;
      let state = await this._refreshState(this.command);
      if (!this._connected) {
        console.log('connected');
        this._connected = true;
        this.command = state;
      }
      this._resolveWaiters(state);
    }
    catch (err) {
      console.warn('disconnected', err);
      this._connected = false;
      this._rejectWaiters(err);
    }
    finally {
      await new Promise(res=>setTimeout(res, this.interval));
      this._pinger();
    }
  };

  async _refreshState(command) {
    let resp = await Promise.race([
      fetch(this.href+'state', {
        method: command && 'POST' || 'GET',
        body: command && this._serializeState(command) || undefined
      }),
      new Promise((res, rej)=>
        setTimeout(()=>rej(new Error('timeout')), this.timeout)
      )
    ]);
    if (resp.status != 200)
      throw new Error("failed to refresh state: " + resp.status);
    let body = await r.blob();
    return this._deserializeState(body);
  }

  async _deserializeState(view) {
  }

  async _serializeState(state) {
    // TODO
    return null;
  }

  async _fetchPostValue(key, val) {
    return fetch(this.href+key, {method: "POST", body: val});
  }
}

(function (root) {

  //**********************************************************

  var nextTick;
  if (typeof setImediate === 'function') {
    nextTick = setImediate;
  } else if (typeof process === 'object' && process.nextTick) {
    nextTick = process.nextTick;
  } else {
    nextTick = function (cb) {
      setTimeout(cb, 0);
    };
  }

  var isPromise = function (obj) {
    return obj && typeof obj.then === 'function';
  };
  var noop = function () {};
  var defaultReject = function (reason) {
    return reason;
  };

  //**********************************************************
  function promise(fn, useStrict) {

    useStrict = !!useStrict;

    var _state, _resolve, _reject, _then;

    _state = {
      isResolved: false,
      isRejected: false,
      isSettled: false,
      reason: null,
      value: null,
      waiting: null
    };

    _resolve = function (val) {
      resolve(_state, val, useStrict);
    };

    _reject = function (reason, value) {
      reject(_state, reason, value);
    };

    _then = function (onResolving, onRejecting) {
      return then(_state, onResolving, onRejecting, useStrict);
    };

    if (useStrict) {
      try {
        fn(_resolve, _reject);
      } catch (reason) {
        _reject(reason);
      }
    } else {
      fn(_resolve, _reject);
    }

    return {
      then: _then
    };
  }

  promise.defaultReject = defaultReject;

  function then (promiseState, onResolving, onRejecting, useStrict) {
    return promise(function (thenResolve, thenReject) {
      promiseState.waiting = waitForSettle(
        promiseState,
        onResolving, onRejecting || (onRejecting = defaultReject),
        thenResolve, thenReject,
        useStrict
      );
    }, useStrict);
  }

  function resolve(promiseState, value, useStrict) {
    if (promiseState.isResolved) {
      return;
    }
    promiseState.isResolved = true;

    if (isPromise(value)) {
      handleInnerPromise(promiseState, value, useStrict);
    } else {
      settle(promiseState, null, value);
    }
  }

  function reject(promiseState, reason, value) {
    if (promiseState.isRejected) {
      return;
    }
    promiseState.isRejected = true;

    settle(promiseState, reason, value);
  }

  function settle(promiseState, reason, value) {
    if (promiseState.isSettled) {
      return;
    }
    promiseState.isSettled = true;

    promiseState.reason = reason;
    promiseState.value = value;
    nextTick(function () {
      (promiseState.waiting || noop)();
    });
  }

  function waitForSettle(promiseState, onResolving, onRejecting, thenResolve, thenReject, useStrict) {

    return function () {

      var value, hasError;

      hasError = !promiseState.isResolved;

      if (useStrict) {
        try {
          value = hasError ?
            onRejecting(promiseState.reason, promiseState.value) :
            onResolving(promiseState.value);
        } catch (reason) {
          if (!hasError) {
            thenReject(reason, promiseState.value);
          } else {
            thenReject(
              Array.isArray(promiseState.reason) ?
              promiseState.reason.concat(reason) :
              [promiseState.reason, reason],
              promiseState.value
            );
          }
          return;
        }
      } else {
        value = hasError ?
          onRejecting(promiseState.reason, promiseState.value) :
          onResolving(promiseState.value);
      }

      if (!hasError) {
        thenResolve(value);
      } else {
        thenReject(value, promiseState.value);
      }

      promiseState = null;
    };
  }

  function handleInnerPromise(promiseState, innerPromise, useStrict) {

    var success = function (value) {
      if (isPromise(value)) {
        handleInnerPromise(promiseState, value, useStrict);
      } else {
        settle(promiseState, null, value);
      }
    };

    var fail = function (reason, value) {
      promiseState.isResolved = false;
      promiseState.isRejected = true;
      settle(promiseState, reason, value);
    };

    if (useStrict) {
      try {
        innerPromise.then(success, fail);
      } catch (reason) {
        fail(reason, promiseState.value);
      }
    } else {
      innerPromise.then(success, fail);
    }
  }

  if (root.window) {
    if (typeof define === 'function' && define.amd) {
      define(function () {
        return promise;
      });
    } else {
      root.promise = promise;
    }
  } else {
    if (module && module.exports) {
      module.exports = promise;
    }
  }

  return promise;

})(this);
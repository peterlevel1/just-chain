

(function (root, factory) {

  if (root.window && typeof define === 'function' && define.amd) {

      define(function(require){

				var promise = require('./lib/promise.js');

				return factory(promise);
      });

  } else if (module && module.exports) {

  	var promise = require('./lib/promise.js');

    module.exports = factory(promise);
  }

})(this, function(promise){

	var justChain = promise;

	var setImmediate = setImmediate || function (fn) {
		setTimeout(function(){
			fn();
		},0);
	};

	justChain.chain = function chain (_promise, promiseArray, callback) {

		var complete = 0
		, progressPromise = _promise
		, all = promiseArray.length;

		function chaining (){

			while(promiseArray.length) {
				(function (progressFire){
					progressPromise = progressPromise
						.then(function (value){
								complete++;
								return justChain(function (s, f){
									progressFire(value, s, f);
							});
					});
				})(promiseArray.shift());
			};
		}

		chaining();

		return progressPromise.then(function (value){

			chaining = null;

			return callback(null, value, complete, all);

		}, function (e){

			chaining = null;

			return callback(e, null, complete, all) || e;
		});
	}


	justChain.makePromiseArray = function makePromiseArray(arr, asyncFn, ctx){

		var i = -1
		, length = arr.length
		, promiseArray = []
		, results = [];

		while ((++i) < length) {

			(function (srcValue, i){

				var _srcValue = Array.isArray(srcValue) ? srcValue : [srcValue];
				srcValue = null;

				promiseArray.push(

					function (value, s, f){
						asyncFn.apply(ctx || null,
							_srcValue.concat(function (e, _value){
							if (e || e === false)
								f(e);
							else {
								results.push(_value || true);
								s(i === length - 1 ? results : true);
							}
						}));
					}
				);

			})(arr[i], i);
		}

		return promiseArray;
	}

	justChain.makeChaining = function makeChaining(memoryPromise, done){
		return function chaining(value, s, f) {
			return memoryPromise(value,function (_value) {
				return s(done(_value));
			}, f);
		}
	}

	justChain.memory = function memory(asyncFn){

		return function (value, done, fail){

			return justChain(function (s, f){

				var memoryDone = function memoryDone (e, _value) {
					if (e || e === false)
						f(e);
					else
						s(_value);

					setImmediate(function (){
						memoryDone = null;
						value = null;
					});
				};

				if (Array.isArray(value))
					asyncFn.apply(null, value.concat(memoryDone));

				else
					asyncFn(value, memoryDone);
			})
			.then(done, fail);
		}
	}

	justChain.foreverRun = function foreverRun(time, fn, done) {

		(function run(){

			if (fn() === false)
				done();

			else
				setTimeout(run, time);

		})();
	}

	justChain.forever = function forever(ctx, fn, done, /**/isInit) {

		if (!isInit) {
			fn = fn.bind(ctx || null);
		}

		justChain(fn)
		.then(function (){

			forever(ctx, fn, done, true);

		}, done);
	}

	return justChain;
});
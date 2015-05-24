



/**
 * @result  : pass -> @test name :
 * @param   :
 * @detail  :



 * @codes   :
 =================================================

	var p = promise(function (s, f){
		setTimeout(function (){
			console.log(1);
			s();
		}, 100);
	});

	promise.chain(p, [
		function (value, s, f){
			setTimeout(function (){
				console.log(2);
				f(2);
			}, 1000);
		},
		function (value, s, f){
			setTimeout(function (){
				console.log('stop here !');
				f();
			}, 1000);
		},
		function (value, s, f){
			setTimeout(function (){
				console.log(4);
				s(4);
			}, 1000);
		}
	], function (e, value, complete) {
		console.log('-------------------');
		console.log(complete);
	});
 =================================================
 */


/**
 * @result  : pass -> @test name :
 * @param   :
 * @detail  :



 * @codes   :
 =================================================

	var p = promise(function (s, f){
		setTimeout(function (){
			console.log(1);
			s();
		}, 100);
	});
	var fs = require('fs');
	var arrPromise = promise.makePromiseArray(
		[[file1, 'utf8'],file2],
		fs.readFile
	);

	promise.chain(p, arrPromise, function (error, value, complete){
		console.log('-------------------');
		console.log(value);
	})

 =================================================
 */


/**
 * @result  :  -> @test name :
 * @param   :
 * @detail  :



 * @codes   :
 =================================================
	 	var fs = require('fs');
		var m = promise.memory(fs.readFile);

	var c1 =	promise.chain(m([file1, file2], function (value){
				console.log(value);
				return 1;
			})
			.then(function (value){
				console.log(value);
				return 2;
			}),

			[function (value, s, f){
				console.log(value + 'aaaaaaaaaaa');
				s(3);
			}, function (value, s, f){
				console.log(value + 'vvvvvvvvvvv');
				s(4);
			}, function (value, s, f){
				console.log(value + 'ttttttttttttttttttt');
				s(5);
			}],

			function (e, value, complete, all){
				console.log('error : ', e);
				console.log('-------------------');
				console.log(complete, all);
				return 'hello';
		});

	promise.chain(c1,

			[function (value, s, f){
				console.log(value + 'qqqqqqqqqqqqqqq');
				s(6);
			}, function (value, s, f){
				console.log(value + 'wwwwwwwwwwwwwww');
				s(7);
			}, function (value, s, f){
				console.log(value + 'rrrrrrrrrrrrr');
				s(8);
			}],

			function (e, value, complete, all){
				console.log('error : ', e);
				console.log('-+++++++++++++++++++++++----');
				console.log(complete, all);
		});

 =================================================
 */



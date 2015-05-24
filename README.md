

##@result  : pass -> @test name : justChain.forever

##@codes   :
=================================================

	var i = 0;

	justChain.forever(1000, function (){

		i++;

		if (i === 5)
			return false;
		else
			console.log(i);

	}, function (){
		console.log('done');
	});

##@result  : pass -> @test name : justChain.foreverChain

##@codes   :
 =================================================

	justChain.foreverChain({ x : 1 }, function (s, f){

		console.log(this.x);

		this.x++;

		if(this.x === 6)
			f()

		else
			setTimeout(function(){
				s();
			}, 1000);
	}, function(){
		console.log('done');
	});


##@result  : pass -> @test name : justChain.chain

##@codes   :
=================================================

	var p = justChain(function (s, f){
		setTimeout(function (){
			console.log(1);
			s();
		}, 100);
	});

	justChain.chain(p, [
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



##@result  : pass ->
 				@test name :
 						justChain.chain + justChain.makejustChainArray

##@codes   :
=================================================

	var p = justChain(function (s, f){
		setTimeout(function (){
			console.log(1);
			s();
		}, 100);
	});
	var fs = require('fs');
	var arrjustChain = justChain.makejustChainArray(
		[[file1, 'utf8'],file2],
		fs.readFile
	);

	justChain.chain(p, arrjustChain, function (error, value, complete){
		console.log('-------------------');
		console.log(value);
	})



##@result  : pass -> @test name : justChain.chain + justChain.memory

##@codes   :
=================================================
	 	var fs = require('fs');
		var m = justChain.memory(fs.readFile);

	var c1 =	justChain.chain(m([file1, file2], function (value){
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

	justChain.chain(c1,

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

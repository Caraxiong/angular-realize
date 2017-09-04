window.onload = function() {
	'use strict'
	let scope = {
		increaseApple: function(){
			// 箭头函数可以让setTimeout里面的this，绑定定义时所在的作用域，而不是指向运行时所在的作用域。
			setTimeout(() => {
				console.log(this)
			},0)
			setTimeout(function(){
				console.log(this)
			},0)
			this.apple++
		},
		decreaseApple: function(){
			if(this.apple > 1){
				this.apple--
			}else{
				this.apple = 0
			}
		},
		increaseBanana: function(){
			this.banana++
		},
		decreaseBanana: function(){
			if(this.banana > 1){
				this.banana--
			}else{
				this.apple = 0
			}
		},
		apple: 0,
		banana: 0,
		price: 2
	}

	function Scope(){
		this.$$watchList = []
	}

	// 注意当用箭头函数时 console.log(this) 指向的将是window，而非Scope
	Scope.prototype.$watch = function (name, getNewValue, listener){
		let watch = {
			name : name,
			getNewValue : getNewValue,
			listener : listener || function(){}
		}
		this.$$watchList.push(watch)
	}

	Scope.prototype.$degist = function(){
		let dirty = true
		let checkTimes = 0  //用来控制脏检查次数，防止无限调用的情况发生
		while(dirty) {
			dirty = false
			let list = this.$$watchList
			for(let i = 0;i < list.length; i++){
				let watch = list[i]
				let newValue = watch.getNewValue()
				let oldValue = watch.last
				if(newValue !== oldValue){
					watch.listener(newValue,oldValue)
					//因为listener操作，已经检查过的数据可能变脏
					dirty = true
				}else{
					scope[watch.name] = newValue  //赋值回去给变量，用来显示在页面
				}
				watch.last = newValue
			}
			checkTimes++
			if(checkTimes > 10 && dirty){
				throw new Error('检测超过10次')
			}
		}
	}

	let $scope = new Scope()

	$scope.$watch('apple', function(){
		// $scope.apple = scope.apple
		return scope[this.name]
	}, (newValue,oldValue)=>{
		console.log('apple:     newValue:' + newValue + '      ' + 'oldValue:' + oldValue)
	})

	$scope.$watch('banana', function(){
		// $scope.banana = scope.banana
		return scope[this.name]
	}, (newValue,oldValue)=>{
		console.log('banana:     newValue:' + newValue + '      ' + 'oldValue:' + oldValue)
	})

	$scope.$watch('sum', function(){
		$scope.sum = scope.apple*scope.price + scope.banana*scope.price
		return $scope[this.name]
	}, (newValue,oldValue)=>{
		console.log('sum:     newValue:' + newValue + '      ' + 'oldValue:' + oldValue)
	})

	function bind() {
		let list = document.querySelectorAll('[ng-click]')
		for(let i = 0,l = list.length;i < l;i++){
			list[i].onclick = function(){
				let func = this.getAttribute('ng-click')
				scope[func]()
				apply()
			}
		}
	}

	function apply() {
		$scope.$degist()
		let list = document.querySelectorAll('[ng-bind]')
		for(let i = 0,l = list.length;i < l;i++){
			let bindData = list[i].getAttribute('ng-bind')
			list[i].innerHTML = scope[bindData]
		}
	}
	bind()
	apply()
}
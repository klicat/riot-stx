riotStx = {
	useStxLocalToInitGlobalStx:false,
	create(...initStateObjs){
		riotStx.installState(initStateObjs)
		riot.install(function (component) {
			riotStx.installRiotPlugin(component)
		})
	},
	
	installState(initStateObjs){
		//create a handler on set operation on global state
		state = new Proxy({}, {
			set: function (target, key, value) {
				if(key[0] != '_' && JSON.stringify(target[key] || null) !== JSON.stringify(value)) {
					target[key] = value
					window.dispatchEvent(new CustomEvent('state_' + key, {detail: {key:key,value:value}}))
				}
				return true
			}
		})
		//Init global state with initStateObjs
		initStateObjs.forEach(stateToSet => {
			riotStx.deepExtend(state, state, stateToSet)
			//state = Object.assign(state, arg)
		})
	},

	installRiotPlugin(component){
		//store the original call if exists
		const { onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } = component

		//updateState triggered when global state change
		component.updateState = function (ev){
			component.stx[ev.detail.key]=ev.detail.value
			component.update()
		}

		component.stx = new Proxy(component.stx || {}, {
			set: function(target, key, value) {
				if(key[0] != '_' && JSON.stringify(target[key]) !== JSON.stringify(value)) {
					target[key] = value
					state[key]=value
				} else target[key] = value
				return true
			}
		})

		//set initial component state with global state if defined
		component.onBeforeMount = function (...args) {
			for (let [key, value] of Object.entries(component.stx)) if(key[0] != '_') {
				//set initial  component state with global state if defined
				if(typeof state[key] !== 'undefined') {
					component.stx[key]=state[key]
				} else if(riotStx.useStxLocalToInitGlobalStx) state[key]=component.stx[key]
				window.addEventListener('state_' + key, component.updateState)
			}
			if (onBeforeMount) {
				onBeforeMount.apply(this, args)
			}
		}
		component.onUnmounted = function (...args) {
			for (let [key, value] of Object.entries(component.stx)) {
				if(key[0] != '_') {
					window.removeEventListener('state_' + key, component.updateState)
				}
			}
			if (onUnmounted) {
				onUnmounted.apply(this, args)
			}
		}
		component.setState = function (stateToSet){
			riotStx.setState(stateToSet)
		}
		component.setOneState = function (stateToSet){
			riotStx.setState(stateToSet)
		}
	},
	
	setOneState(key,value){
		state[key]=value
	},	
	
	setState(stateToSet){
		riotStx.deepExtend(state, state, stateToSet)
		//state = Object.assign(state, stateToSet)
	},

	subscribe(key,callback){
		window.addEventListener('state_' + key, (ev=>{callback(ev.detail)}))
	},

	deepExtend(out) {
		out = out || {}
		for (var i = 1; i < arguments.length; i++) {
			var obj = arguments[i]
			if (!obj) continue
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					if (typeof obj[key] === 'object'){
						if(obj[key] instanceof Array == true) out[key] = obj[key].slice(0)
						else out[key] = riotStx.deepExtend(out[key], obj[key])
					} else	out[key] = obj[key]
				}
			}
		}
		return out
	}
}

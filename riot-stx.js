riotStx = {
	cs:{},
	create(initStateObj, rootComponentName){
		riotStx.installState(initStateObj)
		riot.install(function (component) {
			riotStx.installRiotPlugin(component)
		})
	},
	
	installState(...initStateObj){
		stx = new Proxy({}, {
			set: function setState(target, key, value) {
				if(key[0] != '_' && JSON.stringify(target[key]) !== JSON.stringify(value)) {
						target[key] = value
						if(riotStx.cs[key])riotStx.cs[key].forEach((cpt)=>
						{
							cpt.stx[key]=value
							cpt.update()
						})
						window.dispatchEvent(new CustomEvent('stx_' + key, {[key]:value,updatedState:key}))
				}
				return true
			}
		})
		//Init global state with initStateObj
		initStateObj.forEach(arg => {
			riotStx.deepExtend(stx, stx, arg)
		})
	},

	installRiotPlugin(component){
		//store the original call if exists
		const { onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } = component

		component.stx = new Proxy(component.stx || {}, {
			set: function setState(target, key, value) {
				if(key[0] != '_' && typeof component.stx[key] !=='undefined' && JSON.stringify(target[key]) !== JSON.stringify(value)) {
					target[key] = value
					stx[key]=value
					window.dispatchEvent(new CustomEvent('stx_' + key, {[key]:value,updatedState:key}))
				} else target[key] = value
				return true
			}
		})

		component.onBeforeMount = function (...args) {
			for (let [key, value] of Object.entries(component.stx)) if(key[0] != '_') {
				if(!riotStx.cs[key]) riotStx.cs[key]=[]
				riotStx.cs[key].push(component)
	
				//set initial  component state with global state if defined
				if(typeof stx[key] !== 'undefined') {
					component.stx[key]=stx[key]
				}
			}
			if (onBeforeMount) {
				onBeforeMount.apply(this, args)
			}
		}
		component.onUnmounted = function (...args) {
			if(riotStx.cs) for (var key in riotStx.cs) {
				riotStx.cs[key].forEach((cpt,i)=>{
						if(cpt === component) riotStx.cs[key].splice(i , 1)
				})
			}
			if (onUnmounted) {
				onUnmounted.apply(this, args)
			}
		}
	},

	setOneState(key, value){
		stx[key]=value
	},

	setState(state){
		riotStx.deepExtend(stx, stx, state)
	},
	
	deepExtend(out) {
		out = out || {}
		for (var i = 1; i < arguments.length; i++) {
			var obj = arguments[i]
			if (!obj)
				continue
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					if (typeof obj[key] === 'object'){
						if(obj[key] instanceof Array == true)
							out[key] = obj[key].slice(0)
						else
							out[key] = riotStx.deepExtend(out[key], obj[key])
					}
					else
						out[key] = obj[key]
				}
			}
		}
		return out
	}
}

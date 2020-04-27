let riotStx = {
	cs:{},
	create(...initStateObj){
		stx = new Proxy({}, {
			set: function setState(target, key, value) {
				if(JSON.stringify(target[key]) !== JSON.stringify(value)) {
						target[key] = value
						this.updateComponentsState(key,value)
				}
				return true
			}.bind(this)
		})
		//Init global state with initStateObj
		initStateObj.forEach(arg => {
			this.deepExtend(stx, stx, arg)
		})
	},

	updateComponentsState(key, value){
		if(this.cs[key]) this.cs[key].forEach((cpt)=>
		{
			cpt.stx[key]=value
			cpt.update()
		})
	},

	riotPlugin(component){
		//store the original call if exists
		const { onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } = component

			component.stx = new Proxy(component.stx, {
				set: function setState(target, key, value) {
					if(typeof component.stx[key] !=='undefined' && JSON.stringify(target[key]) !== JSON.stringify(value)) {
						target[key] = value
						stx[key]=value
					} else target[key] = value
					return true
				}
			})

		component.onBeforeMount = function (...args) {
			for (let [key, value] of Object.entries(component.stx)) if(key[0] != '_') {
				if(!this.cs[key]) riotStx.cs[key]=[]
				this.cs[key].push(component)
	
				//set initial  component state with global state if defined
				if(typeof stx[key] !== 'undefined') {
					component.stx[key]=stx[key]
				}
			}
			if (onBeforeMount) {
				onBeforeMount.apply(this, args)
			}
		}.bind(this)
		component.onUnmounted = function (...args) {
			if(this.cs) for (var key in riotStx.cs) {
				this.cs[key].forEach((cpt,i)=>{
						if(cpt === component) this.cs[key].splice(i , 1)
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
		this.deepExtend(stx, stx, state)
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
							out[key] = deepExtend(out[key], obj[key])
					}
					else
						out[key] = obj[key]
				}
			}
		}
		return out
	}
}

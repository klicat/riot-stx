let riotStx = {
	cs:{},
	create(initStateObj, rootComponentName){
		riotStx.installState(initStateObj)
		riotStx.installRiot(rootComponentName)
	},
	
	installState(initStateObj){
		window.stx = new Proxy({}, {
			set: function setState(target, key, value) {
				if(JSON.stringify(target[key]) !== JSON.stringify(value)) {
						target[key] = value
						//console.log(key,target[key],value)
						riotStx.updateComponentsState(key,value)
				} //else target[key] = value
				return true
			}
		})
		//Init global state with initStateObj
		if(typeof initStateObj =='object') stx = Object.assign(stx, initStateObj)
	},

	updateComponentsState(key, value){
		if(riotStx.cs[key]) riotStx.cs[key].forEach((cpt)=>
		{
			cpt.stx[key]=value
			cpt.update()
			//cpt.update({[key]:value})
		})
	},

	installRiot(rootComponentName){
		riot.install(function (component) {
			riotStx.installRiotPlugin(component)
		})
		if(rootComponentName) riot.mount(rootComponentName)
	},

	installRiotPlugin(component){
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
		for (var key in state) {
			riotStx.setOneState(key, state[key])
		}
	}
}

## riot-stx : Riotjs tiny state management lib
[Demo 1](https://plnkr.co/edit/QGI1Pl4lTKozi9Nj?preview)
[Demo 2](https://plnkr.co/edit/xdaHgaANG5E84F8F?preview)

### Update and propagate state in your app
- Easy to use : NO subscribing complex functions or stores or action... to define !
- Auto-update components without to call this.update()
- update are propagated in two ways binding : main Js <--> components
- Inside riot component you must subscribe to interested state keys in the definition of component. Just use  stx:{key1:'defaultValue',key2...} It's all.
- In riot cycle event : just use this.stxs.key1="new val" to update each component that have subscribed to this key (no need to call this.update() )
- to update key of global state, use stx.mykey='something' or use riotStx.setState(objectStateToDeepMerge) Or riotStx.setOneState(key, value) 
- Set riotStx.useStxLocalToInitGlobalStx to true if you prefer that the first meet of an stx.key in component declaration auto-set the global stx.
- 1.47KB

### Usage
npm i riot-stx@https://github.com/klicat/riot-stx.git



- include riot-stx.js as javascript
- or use :
```shell
import riot-stx
window.riotStx=riotStx
```

### Example

```shell
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <script type="text/javascript" src="./riot-stx.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/riot@4/riot+compiler.min.js"></script>
    <script type="riot" src="./my-root-tag.html"></script>
    <script type="riot" src="./tag1.html"></script>
    <script type="riot" src="./tag2.html"></script>

    <my-root-tag></my-root-tag>

    <script type="text/javascript">
     //Initalize some global state properties if you want (not mandatory)
     let initStateObj = { message: 'Hello world'}
     riot.compile().then(() => {
     
        //The magic is here
        riotStx.create(initStateObj)
        // end of magic (-;
        
        riot.mount('my-root-tag')

      // You can update message var from your main code.
      // update will be send to all components that have subscribed to 'message'
      setTimeout(()=>{
            stx.message='Another message after 30 seconds from main js'
           },30000)
     }
    </script>
  </body>
</html>
```

```shell
<my-root-tag>
 <h1>{stx.message}</h1>
 <tag1></tag1>
 <tag2></tag2>
 <script>
  export default {
    stx: {
      // by declaring stx.message, this component auto-subscribes to any change on it
      message:null
    }
  }
 </script>
</my-root-tag>
```

```shell
<tag1>
  <h1>{stx.message}</h1>
  <script>
    export default {
      stx: {
        // by declaring stx.message, this component auto-subscribes to any change on it
        message:'default on mount message'
      },
      onMounted(){
       this.stx.message='new message from tag #1'
      },
      onUpdated(){
       //you can even change the var in onUpdated handler !
       setTimeout(()=>{
        this.stx.message='Another message after 20s'
       },20000)
      }
    }
  </script>
</tag1>
```

```shell
<tag2>
  <h1>{stx.message}</h1>
  <p onclick={changMsg}>Click here to change message</p>
  <script>
    export default {
      stx: {
        // by declaring stx.message, this component auto-subscribes to any change on it
        message:'another default on mount message, could be null'
      },
      changMsg(){
        this.stx.message='new message from tag #2'
      }
    }
  </script>
</tag2>
```


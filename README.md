## riot-stx : Riotjs tiny state management lib

[Demo](https://plnkr.co/edit/nrU5XDKApGZZd7fb?preview)

### Update and propagate state in your app
- update are propagated in two ways binding : main Js <--> components
- updating some keys of global state : You can set stx object propeties or use riotStx.setState Or riotStx.setOneState functions
- Inside riot component you must subscribe to interested state keys : stx:{key1:'defaultValue',key2...}
- In riot cycle event : just use this.stxs.key1="new val" to update each component that have subscribed to this key (no need to call this.update() )
- 1.13KB

### Usage
include riot-stx.js 
```shell
<script type="text/javascript" src="./riot-stx.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/riot@4/riot+compiler.min.js"></script>
<script type="riot" src="./my-root-tag.html"></script>
<script type="riot" src="./tag1.html"></script>
<script type="riot" src="./tag2.html"></script>

    
<script type="text/javascript">
 //Initalize somme global state properties if you want
 let initStateObj = { message: 'Hello world'}
 riot.compile().then(() => {
  // initalize stx, and mount your root riot tag 
  riotStx.create(initStateObj, 'my-root-tag')
  
  // You can update message var from your main code.
  // update will be send to all components that have subscribed to 'message'
  setTimeout(()=>{
        stx.message='Another message after 40 seconds from main js'
       },40000)
 }
</script>
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
        this.stx.message='Another message after 10s'
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


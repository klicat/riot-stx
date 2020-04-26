## riot-stx : Riotjs tiny state management lib

[Demo](https://plnkr.co/edit/nrU5XDKApGZZd7fb?preview)

### Usage
include riot-stx.js 
```shell
<script src="./riot-stx.js"></script>
<script type="text/javascript">
 //Initalize somme global state properties if you want
 let initStateObj = { message: 'Hello world'}
 riot.compile().then(() => {
  // initalize stx, and mount your root riot tag 
  riotStx.create(initStateObj, 'my-root-tag')
 }
</script>
```

### Update and propagate state in your app
- updating some keys of global state : You can set stx object propeties or use riotStx.setState setOneState functions
- Inside riot component you must subscribe to interested state keys : stx:{key1:'defaultValue',key2...}
- In riot cycle event : just use this.stxs.key1="new val" to update each component that have subsscribed to this key

```shell
<my-root-tag>
 <h1>{stx.message}</h1>
 <tag1></tag1>
 <tag2></tag2>
 <script>
  export default {
    stx: {// by declaring stx.message it auto-subscribes to any change on it anywhere in app
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
      stx: {// by declaring stx.message it auto-subscribes to any change on it anywhere in app
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
      stx: { // by declaring stx.message it auto-subscribes to any change on it anywhere in app
        message:'another default on mount message, could be null'
      },
      changMsg(){
       this.stx.message='new message from tag #2'
      }
    }
  </script>
</tag2>
```


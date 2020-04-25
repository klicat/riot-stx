# riot_stx
Riotjs tiny state management lib
DEMO :updating some keys of global state.
You can set stx object propeties
or use riot_stx set function
Inside riot component you must subscribe to
interested state keys :
stx:{key1:'defaultValue',key2...}
in riot cycle event : just use
this.stxs.key1="new val" to update each
component that have subsscribed to this key

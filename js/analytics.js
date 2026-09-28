// KUMG Forge — Analytics helper
// Usage: kumgTrack('create_project', { name: 'My Site' });

(function(){
  var buffer = [];
  var flushTimer = null;
  var lastUserId = null;

  function flush(){
    flushTimer = null;
    if (!buffer.length) return;
    var batch = buffer.slice();
    buffer = [];
    if (!lastUserId) return;

    try {
      db.from('events').insert(
        batch.map(function(e){
          return {
            user_id: lastUserId,
            name: e.name,
            meta: e.meta || {}
          };
        })
      ).then(function(){}, function(){});
    } catch (e){}
  }

  window.kumgTrack = function(name, meta){
    if (!name) return;
    buffer.push({ name: String(name).slice(0, 60), meta: meta || {} });
    if (buffer.length >= 5){
      flush();
      return;
    }
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, 3000);
  };

  // Init — grab session and flush every 20 seconds as a safety net
  (async function(){
    try {
      var sess = await db.auth.getSession();
      lastUserId = (sess && sess.data && sess.data.session) ? sess.data.session.user.id : null;
    } catch(e){}

    setInterval(function(){ if (buffer.length) flush(); }, 20000);

    window.addEventListener('beforeunload', function(){
      if (buffer.length) flush();
    });
  })();
})();

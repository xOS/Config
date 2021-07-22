const readTimer = $persistentStore.read("WiFi_Timer");
const record = $persistentStore.read("Block_Num");
let block = {
  matched: false
};

if (readTimer) {
  const currentTime = Date.now();
  const markTime = parseInt(readTimer);
  if (currentTime - markTime <= 15000) {
    block.matched = true;
    const addNum = JSON.stringify(parseInt(record || "0") + 1);
    const saveNum = $persistentStore.write(addNum, "Block_Num");
    console.log(`已拦截: ${$request.hostname}`);
  } else {
    const delRecord = $persistentStore.write("", "Block_Num");
    const delTime = $persistentStore.write("", "WiFi_Timer");
    if (record) {
      console.log(`✅ 结束, 共 ${record} 条网络请求`);
    }
  }
}

$done(block);
async function launch() {
    await linkedip();
}
launch()
function linkedip(){ 
$httpClient.post('https://link-ip.nextdns.io/4af4c8/88e9a964ed89a8bd', function(error, response, data){
  if (error) {
console.log('‼️');
  } else {
console.log('🟢 '+ data);
  }
  $done();
});
}

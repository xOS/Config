async function launch() {
  await linkedip();
}
launch()
function linkedip() {
  $httpClient.post('https://link-ip.nextdns.io/76a41e/28ec7d0fa638242a', function (error, response, data) {
    if (error) {
      console.log('‼️');
    } else {
      console.log('🟢 ' + data);
    }
    $done();
  });
}

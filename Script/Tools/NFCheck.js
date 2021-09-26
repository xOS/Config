const BASE_URL = 'https://www.netflix.com/title/'
const AREA_TEST_FILM_ID = 80018499
const ORIGINAL_FILM_ID = 80197526
const NOT_ORIGINAL_FILM_ID = 70143836

;(async () => {
  await test(NOT_ORIGINAL_FILM_ID)
    .then((code) => {
      if (code != 'Not Available') {
        $done({
          title: 'Netflix 已解锁',
          style: 'good',
          content: '您的出口 IP 完整解锁 Netflix',
        })
        return new Promise(() => {})
      }
      return test(ORIGINAL_FILM_ID)
    })
    .then((code) => {
      if (code != 'Not Available') {
        $done({
          title: 'Netflix 半解锁',
          style: 'info',
          content: '您的出口 IP 仅支持解锁自制剧',
        })
        return new Promise(() => {})
      }
      return test(AREA_TEST_FILM_ID)
    })
    .then((code) => {
      if (code != 'Not Available') {
        $done({
          title: 'Netflix 未解锁',
          style: 'alert',
          content: '您的出口 IP 不支持解锁强版权的自制剧',
        })
      } else {
        $done({
          title: 'Netflix 无法解锁',
          style: 'error',
          content: 'Netflix 不为您的出口 IP 提供服务',
        })
      }
    })
    .catch((error) => {
      $done({
        title: 'Netflix 检测异常',
        style: 'error',
        content: '检测失败，请重试',
      })
    })
})()

function test(filmId) {
  return new Promise((resolve, reject) => {
    let option = {
      url: BASE_URL + filmId,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
      },
    }
    $httpClient.get(option, function (error, response, data) {
      if (error != null) {
        reject('Error')
        return
      }

      if (response.status !== 200) {
        resolve('Not Available')
        return
      }

      let url = response.headers['x-originating-url']
      let local = url.split('/')[3]
      if (local == 'title') {
        local = 'us'
      } else {
        local = local.split('-')[0]
      }
      resolve(local)
    })
  })
}
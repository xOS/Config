const index = "/index";
const person = "/person";
const url = $request.url;
const obj = JSON.parse($response.body); 
if (url.indexOf(person) != -1){
    obj.data.recommend_cards = {};
    obj.data.other_cards = [];
    obj.data.popad = {};
    obj.data.sign = {};
    obj.data.finance.recommendcard = [];
    obj.data.finance.extraicon= [];
    obj.data.ad = [];
    obj.data.sign_new = {};
    if(obj.data.static){
    obj.data.static.other_cards = [];
    obj.data.static.recommend_cards = {};
    obj.data.static.other_cards = [];
    obj.data.static.popad = {};
    obj.data.static.sign = {};
    obj.data.static.finance.recommendcard = [];
    obj.data.static.finance.extraicon= [];
    obj.data.static.ad = [];
    obj.data.static.sign_new = {};
    }
    $done({body: JSON.stringify(obj)});
} if(url.indexOf(index) != -1){
    obj.data.recommend_cards = {};
    obj.data.other_cards = [];
    obj.data.popad = {};
    obj.data.sign = {};
    // obj.data.finance.recommendcard = [];
    // obj.data.finance.extraicon= [];
    obj.data.ad = [];
    obj.data.sign_new = {};
    if(obj.data.static){
    obj.data.static.other_cards = [];
    obj.data.static.recommend_cards = {};
    obj.data.static.other_cards = [];
    obj.data.static.popad = {};
    obj.data.static.sign = {};
    // obj.data.static.finance.recommendcard = [];
    // obj.data.static.finance.extraicon= [];
    obj.data.static.ad = [];
    obj.data.static.sign_new = {};
    }
    $done({body: JSON.stringify(obj)});
} else {
  $done({})
}

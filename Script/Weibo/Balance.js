var obj = JSON.parse($response.body); 
obj.data.popad = {};
obj.data.sign = {};
if (obj.hasOwnProperty('finance')) {
    obj.data.finance.recommendcard = [];
    obj.data.finance.extraicon= [];
}
obj.data.ad = [];
obj.data.sign_new = {};
$done({body: JSON.stringify(obj)});
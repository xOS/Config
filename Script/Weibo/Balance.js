var obj = JSON.parse($response.body); 
obj.data.popad = {};
obj.data.finance.recommendcard = [];
obj.data.finance.extraicon= [];
obj.data.ad = [];
obj.data.sign_new.walletbonus = [];
$done({body: JSON.stringify(obj)});
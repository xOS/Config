var obj = JSON.parse($response.body); 
if (obj.hasOwnProperty('recommend_cards')) obj.data.recommend_cards.list = [];
obj.data.other_cards = [];
$done({body: JSON.stringify(obj)});
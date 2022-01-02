var obj = JSON.parse($response.body); 
obj.data.recommend_cards.list = [];
obj.data.other_cards = [];
$done({body: JSON.stringify(obj)});
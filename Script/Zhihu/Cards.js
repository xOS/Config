var obj = JSON.parse($response.body);
obj.selected_cards.splice(1);
$done({ body: JSON.stringify(obj) });
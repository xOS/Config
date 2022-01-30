var obj = JSON.parse($response.body);
obj['premium'] = true;
obj['settings']['custom_notifications'] = true;
obj['settings']['sync_chats'] = true;
$done({ body: JSON.stringify(obj) });
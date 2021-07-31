var obj = JSON.parse($response.body);
obj['body']['indexMember']['expireTime'] = '2099-12-21 01:09:06';
obj['body']['indexMember']['expireDay'] = '0';
$done({body: JSON.stringify(obj)});
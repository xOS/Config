let body = $response.body.replace(/\"verified_type\":-1/g, '"verified_type": 0').replace(/\"verified\":false/g, '"verified": true, "verified_type_ext": 1').replace(/\"verified_type_ext\":(\d)/g, '"verified_type_ext": 1');
$done({ body });

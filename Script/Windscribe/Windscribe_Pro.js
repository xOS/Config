var obj = JSON.parse($response.body);
obj = {
    "data": {
        "ignore_udp_tests": 1,
        "username": "Peinan",
        "user_id": "yp1sfnk0",
        "traffic_used": 0,
        "traffic_max": -1,
        "status": 1,
        "email": "im@nan.ge",
        "email_status": 1,
        "billing_plan_id": 91,
        "is_premium": 1,
        "rebill": 0,
        "premium_expiry_date": "2121-12-03",
        "reg_date": 1575366907,
        "last_reset": "2021-11-28",
        "loc_rev": 2726,
        "loc_hash": "bb299a52c538c20dc7484310500609a9a69925a4"
    }
};

$done({ body: JSON.stringify(obj) });
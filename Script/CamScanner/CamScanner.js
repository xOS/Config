let obj = JSON.parse($response.body);
obj = {
  "ret": "0",
  "data": {
    "watchad_vip_chance_total": "3000",
    "points_exchange_cfgrs": {
      "CamScanner_ID_Card_Credit": 5000,
      "CamScanner_Pdf2ppt": 5000,
      "CamScanner_Sign": 5000,
      "CamScanner_ID_Card_Authenticity": 5000,
      "CamScanner_Excel": 5000,
      "CamScanner_CertMode": 2000,
      "CamScanner_Profile_Card_Format": 5000,
      "CamScanner_Watermarks": 5000,
      "CamScanner_Pdf2excel": 5000,
      "CamScanner_Translation": 5000,
      "CamScanner_Pdfword": 5000,
      "CamScanner_CloudOCR": 5000,
      "CamScanner_CloudCap_1G": 10000,
      "CamScanner_AlbumImport": 30000
    },
    "pdfword_balance": "9000",
    "vip_imagerestore_balance": 5000,
    "psnl_vip_property": {
      "expiry": "4072543930"
    },
    "pay": {
      "edu_expiry": 4072543930
    },
    "dir": {
      "edu_total_num": 5000,
      "user_total_num": 5000,
      "normal_vip_total_num": 5000,
      "total_num": 5000,
      "vip_total_num": 5000,
      "normal_vip_layer_num": 6000,
      "edu_layer_num": 6000,
      "user_layer_num": 6000,
      "vip_layer_num": 6000,
      "new_layer_num": 4000,
      "single_layer_num": 3000
    },
    "removead": "1",
    "balance_recolor": 5000,
    "no_login_ocr_balance": "2000",
    "bookmode_balance": 2000,
    "used_points": "9000",
    "patting_balance": "3000",
    "watchad_vip_chance": "3000",
    "CamScanner_RoadMap": "9000",
    "vip_balance_recolor": 5000,
    "watermarks_balance": 200000,
    "immt_expy_points": "0",
    "server_time": "1642630806",
    "points": "9000",
    "fax_balance": "6000",
    "CamScanner_Erase": 9000,
    "greetcard_list": {
      "CamScanner_NONVIP_PayGreetCard_1": "0",
      "greeting_card_6": "1",
      "CamScanner_NONVIP_PayGreetCard_2": "0",
      "greeting_card_2": "1",
      "CamScanner_PayGreetCard_3": "1",
      "CamScanner_NONVIP_PayGreetCard_3": "0",
      "greeting_card_9": "1",
      "greeting_card_5": "1",
      "CamScanner_PayGreetCard_6": "1",
      "CamScanner_PayGreetCard_1": "1",
      "greeting_card_1": "1",
      "greeting_card_10": "1",
      "CamScanner_PayGreetCard_4": "1",
      "greeting_card_4": "1",
      "CamScanner_PayGreetCard_2": "1",
      "greeting_card_3": "1",
      "greeting_card_11": "1",
      "CamScanner_PayGreetCard_5": "1"
    },
    "trans_balance": "2000",
    "login_ocr_balance": "1000",
    "excel_balance": "1000",
    "imagerestore_balance": 1000,
    "upload_pdf_balance": "5000",
    "ocr_balance": 1000
  }
};
$done({ body: JSON.stringify(obj) });
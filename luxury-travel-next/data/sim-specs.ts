export interface SpecOption {
  name: string;
  key: string;
  options: string[];
}

// Specs by product ID (scraped from Klook API)
export const PRODUCT_SPECS: Record<string, SpecOption[]> = {
  "16469": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Seoul",
        "Busan"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Incheon Airport T1",
        "Incheon Airport T2",
        "Gimpo International Airport",
        "Busan Gimhae International Airport"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "4 days",
        "5 days",
        "6 days",
        "7 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days",
        "60 days",
        "90 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only",
        "Data + Domestic Call and Texts (extra topup)"
      ]
    }
  ],
  "16587": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Bangkok",
        "Phuket",
        "Chiang Mai"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Don Mueang Airport (DMK) - dtac Shop",
        "Suvarnabhumi Airport (BKK) - dtac Shop",
        "Phuket International Airport (HKT) - dtac Shop",
        "Chiang Mai Airport (CNX) - dtac Shop"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "10 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "50 GB",
        "Unlimited "
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data and calls included",
        "Data only"
      ]
    }
  ],
  "16599": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Ho Chi Minh"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Tan Son Nhat International Airport"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "7 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Data Unlimited",
        "4GB per day",
        "10GB ",
        "1.5GB per day",
        "3GB per day",
        "5GB per day"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only",
        "Calls included",
        "Calls Included & Text Message"
      ]
    }
  ],
  "16614": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Taiwan"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Taoyuan International Airport",
        "Kaohsiung International Airport",
        "Taichung International Airport",
        "Chunghwa / Senao Telecom"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "7 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Includes TWD50 credit for local and international calls",
        "Includes TWD100 credit for local and international calls",
        "Includes TWD150 credit for local and international calls",
        "Includes TWD430 credit for local and international calls"
      ]
    }
  ],
  "16622": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Da Nang"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Da Nang International Airport"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days",
        "15 days",
        "7 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "7GB/day",
        "6GB /day"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data & Calls Included",
        "Data only"
      ]
    }
  ],
  "16625": [
    {
      "name": "Delivery type",
      "key": "wifi_mailing_type",
      "options": [
        "One-way delivery"
      ]
    },
    {
      "name": "Deliver to",
      "key": "wifi_mailing_city",
      "options": [
        "Ho Chi Minh"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "10 days",
        "30 days",
        "15 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "10Gb",
        "2GB per day"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only",
        "Calls included"
      ]
    }
  ],
  "16673": [
    {
      "name": "Delivery type",
      "key": "wifi_mailing_type",
      "options": [
        "One-way delivery"
      ]
    },
    {
      "name": "Deliver to",
      "key": "wifi_mailing_city",
      "options": [
        "Bali"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "21GB by Telkomsel",
        "Esim 34GB by Telkomsel"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "16675": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Singapore"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Changi Airport",
        "M1 Shops"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "15 days",
        "28 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "100GB",
        "150GB",
        "250GB",
        "300GB",
        "750GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Calls included (E-SIM)",
        "Calls included",
        "Calls included (Bundle)",
        "Calls included with $3 EZ-Link card stored value",
        "Data only",
        "Data only (E-SIM)"
      ]
    }
  ],
  "16676": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data in total"
      ]
    },
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Singapore"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Singapore Changi Airport Pickup"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "500 GB ",
        "700 GB "
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "⁠Calls included (SIM bundle)",
        "Calls included with $3 EZ-Link card stored value",
        "Calls included",
        "Calls included (eSIM)"
      ]
    }
  ],
  "16711": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        " 14GB by Telkomsel",
        " 23GB by Telkomsel",
        "40GB by Telkomsel",
        " 65GB by Telkomsel",
        " 100GB by Telkomsel",
        "eSIM 14 GB by Telkomsel",
        "eSIM 40 GB by Telkomsel",
        "eSIM 65 GB by Telkomsel",
        "eSIM 100 GB by Telkomsel",
        "23GB by Smartfren",
        "43GB by Smartfren",
        "63GB by Smartfren",
        "eSIM 25GB by Smartfren",
        "eSIM 23 GB by Telkomsel",
        "eSIM 45GB by Smartfren",
        "eSIM 65GB by Smartfren"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "17166": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Clark",
        "Cebu"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Clark International Airport",
        "Mactan Cebu International Airport"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "30GB Data + Unli Calls/Texts",
        "80GB Data + Unli Calls/Texts",
        "104GB Data + Unli Calls/Texts",
        "139GB Data + Unli Calls/Texts",
        "20GB Data + Unli Calls/Texts"
      ]
    }
  ],
  "19563": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Auckland",
        "Christchurch"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Auckland International Airport (AKL)",
        "Christchurch International Airport (CHC)"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days",
        "60 days",
        "90 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "2GB",
        "10 GB",
        "40 GB",
        "100 GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Calls and Texts included"
      ]
    }
  ],
  "23888": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Kuala Lumpur"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Kuala Lumpur International Airport T2 (KLIA T2)"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "7 days",
        "14 days",
        "28 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "65GB",
        "85GB",
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data + Unlimited Calls"
      ]
    }
  ],
  "26328": [
    {
      "name": "Delivery type",
      "key": "wifi_mailing_type",
      "options": [
        "One-way delivery"
      ]
    },
    {
      "name": "Deliver to",
      "key": "wifi_mailing_city",
      "options": [
        "Whole of India"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "10 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "6GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "27040": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Kuala Lumpur"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Ara Damansara"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "15 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "10GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "27152": [
    {
      "name": "Delivery type",
      "key": "wifi_mailing_type",
      "options": [
        "One-way delivery"
      ]
    },
    {
      "name": "Deliver to",
      "key": "wifi_mailing_city",
      "options": [
        "Whole of India"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "14 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1GB",
        "3GB",
        "8GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Calls included"
      ]
    }
  ],
  "28305": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Osaka",
        "Tokyo"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Kansai International Airport (KIX)",
        "Narita International Airport (NRT) Terminal 1",
        "Narita International Airport (NRT) Terminal 2",
        "Haneda Airport (HND) Terminal 3"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "5 days",
        "8 days",
        "12 days",
        "16 days",
        "21 days",
        "31 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "Unlimited Data with Compatibility Insurance"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "34517": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Kuala Lumpur"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Seri Kembangan"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "8 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "6GB of 5G/4G speed"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "34576": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Kuala Lumpur"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Seri Kembangan"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "8 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "5GB at 4G speed"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "39583": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "5 days",
        "7 days",
        "10 days",
        "15 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "500MB/Day"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "39586": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "4 days",
        "5 days",
        "7 days",
        "10 days",
        "15 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1GB/day",
        "2GB/day",
        "500MB/day",
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "39587": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "7 days",
        "10 days",
        "15 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1GB/Day",
        "500MB/Day",
        "10GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "39590": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "7 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "600 MB/Day",
        "1.5 GB/Day",
        "15 GB",
        "25 GB",
        "30 GB",
        "60 GB",
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "39594": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "7 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "1.5 GB/Day"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "39598": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "5 days",
        "7 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "10GB",
        "15GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "62329": [
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Incheon International Airport T1",
        "Incheon International Airport T2",
        "Gimpo International Airport",
        "Gimhae International Airport",
        "QR code on Klook voucher"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "3 days",
        "5 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only",
        "Data + Calls and texts (Extra Top-up, 010 KR number )"
      ]
    }
  ],
  "67017": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "5 days",
        "7 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited (first 6GB high speed)",
        "500MB/Daily",
        "1GB/Daily",
        "2GB/Daily"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "69619": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "14 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited (first 3 GB high speed)",
        "Unlimited (first 4 GB high speed)",
        "Unlimited (first 5 GB high speed)",
        "Unlimited (first 8GB high speed)"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "69873": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "5 days",
        "7 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "500MB/Daily",
        "1GB/Daily",
        "2GB/Daily",
        "Unlimited (first 8GB high speed)",
        "Unlimited (first 10GB high speed)",
        "Unlimited (first 20GB high speed)"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "70107": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "14 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited (first 3 GB high speed)",
        "Unlimited (first 5 GB high speed)"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "70178": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "14 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited (first 3 GB high speed)",
        "Unlimited (first 4 GB high speed)",
        "Unlimited (first 5 GB high speed)",
        "Unlimited (first 8 GB high speed)"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "70196": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited (first 8 GB high speed)"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "72100": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "4 days",
        "5 days",
        "6 days",
        "7 days",
        "8 days",
        "9 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days",
        "40 days",
        "60 days",
        "90 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only",
        "Unlimited Data + Calls and texts (Extra Top-up)"
      ]
    }
  ],
  "74053": [
    {
      "name": "Delivery type",
      "key": "wifi_mailing_type",
      "options": [
        "One-way delivery"
      ]
    },
    {
      "name": "Deliver to",
      "key": "wifi_mailing_city",
      "options": [
        "West Malaysia",
        "East Malaysia",
        "Singapore"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "8 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "8GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data & Calls Included"
      ]
    }
  ],
  "74149": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "West Malaysia",
        "East Malaysia"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Kuala Lumpur International Airport T2 (KUL2) - Tune Traveller Store",
        "Kuala Lumpur International Airport T1 (KUL)",
        "Penang International Airport (PEN)",
        "Kota Kinabalu International Airport (BKI)"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "40GB",
        "150GB",
        "350GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data & Unlimited Calls"
      ]
    }
  ],
  "74292": [
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "QR delivered via email"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "2 days",
        "3 days",
        "4 days",
        "5 days",
        "6 days",
        "7 days",
        "8 days",
        "9 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days",
        "60 days",
        "90 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited (e SIM)"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data, In&Out Calls and Texts (Extra Top-up)"
      ]
    }
  ],
  "74427": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Bangkok",
        "Phuket",
        "Chiang Mai"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Suvarnabhumi Airport (BKK) - True Shop",
        "Suvarnabhumi Airport (BKK) 2 nd Floor - KLOOK Counter",
        "Don Mueang Airport (DMK) - True Shop",
        "Phuket International Airport (HKT) - True Shop",
        "Chiang Mai Airport (CNX) - True Shop"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "10 days",
        "15 days",
        "30 days",
        "7 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "50 GB",
        "Unlimited",
        "30 GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data and calls included",
        "Data only"
      ]
    }
  ],
  "74633": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Kuala Lumpur"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Ara Damansara"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "15 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "6GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "75934": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Viettel"
      ]
    },
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Ho Chi Minh"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Viettel Counter"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "7 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "4 GB per day ",
        "5GB per day"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only",
        "Calls included"
      ]
    }
  ],
  "77287": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Singapore"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Changi Airport (Terminals 1 to 4) and City Pickup"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "500GB",
        "700GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Calls inclusive",
        "2-in-1 $3 EZ-Link stored value with Calls included",
        "Calls included (extendable with top-up)"
      ]
    }
  ],
  "77885": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "4 days",
        "5 days",
        "6 days",
        "7 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days",
        "60 days",
        "90 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data + Incoming calls/texts"
      ]
    }
  ],
  "78012": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Bali"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "3 GB",
        "9 GB ",
        "10 GB",
        "13 GB",
        "17 GB ",
        "21 GB ",
        "29 GB ",
        "59 GB",
        "171 GB ",
        "3 GB E-SIM",
        "9 GB E-SIM",
        "10 GB E-SIM",
        "13 GB E-SIM",
        "17 GB E-SIM",
        "21 GB E-SIM",
        "29 GB E-SIM ",
        "59 GB E-SIM",
        "171 GB E-SIM"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "79026": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Jakarta"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Soekarno Hatta International Airport (CGK) Terminal 3"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "10GB by Telkomsel ",
        "20GB by Telkomsel",
        "25GB by Telkomsel",
        "Esim 20GB by Telkomsel "
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "79682": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "7 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "3 GB",
        "5 GB",
        "10 GB",
        "20 GB",
        "30 GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "81557": [
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Anywhere"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "23 GB",
        "35 GB",
        "60 GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "83282": [
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Hong Kong International Airport, Arrivals Area, Terminal 1, Counter A13"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Hong Kong Tourist 7 day SIM Card"
      ]
    }
  ],
  "83405": [
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Hong Kong International Airport, Arrivals Area, Terminal 1, Counter A13"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        " Hong Kong Local 30 Days with 80GB LTE High Speed and 1,000 local voice minutes "
      ]
    }
  ],
  "84066": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Hanoi & Halong Bay"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Noi Bai International Airport"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days",
        "10 days",
        "15 days",
        "5 days",
        "7 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "3GB per day",
        "6GB per day"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only",
        "Calls included"
      ]
    }
  ],
  "84338": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Jakarta"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Terminal 3 Soekarno-Hatta (CGK) International Airport"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "3 GB",
        "6 GB",
        "9 GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "85787": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Ho Chi Minh"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Tan Son Nhat International Airport (SGN)"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "4 days",
        "7 days",
        "10 days",
        "15 days",
        "20 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1GB/day",
        "2GB/day"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "85995": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "5 days",
        "7 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days",
        "60 days",
        "90 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "500MB/ Daily Unlimited FUP",
        "1GB/Daily Unlimited FUP",
        "2GB Daily Unlimited FUP",
        "5GB only",
        "10GB only",
        "20GB only",
        "30GB only",
        "50GB only",
        "100GB only",
        "150GB only"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "87444": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Tokyo",
        "Osaka",
        "Nagoya",
        "Fukuoka",
        "Hokkaido"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Haneda Airport (HND) International Terminal NINJA WIFI Counter",
        "Kansai International Airport (KIX) Terminal 1 Building",
        "Chubu Centrair International Airport (NGO)",
        "Fukuoka Airport (FUK)",
        "New Chitose Airport International Terminal(CTS)"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "5 days",
        "8 days",
        "12 days",
        "16 days",
        "31 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "90920": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "10 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "50GB "
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "92850": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "7 days",
        "10 days",
        "12 days",
        "15 days",
        "20 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Daily 500 MB + Unlimited",
        "Daily 1 GB + Unlimited",
        "Daily 2 GB + Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "93027": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "7 days",
        "10 days",
        "12 days",
        "15 days",
        "20 days",
        "30 days",
        "5 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Daily 500 MB + Unlimited",
        "Daily 1 GB + Unlimited",
        "Daily 2 GB + Unlimited",
        "Daily 3 GB + Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "93101": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "7 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1 GB",
        "2 GB",
        "3 GB",
        "5 GB",
        "10 GB",
        "20 GB",
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "95592": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Taiwan"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "4G Unlimited",
        "5G Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Voice Credit TWD 100",
        "Voice Credit TWD 50",
        "Voice Credit TWD 150",
        "Voice Credit TWD 430"
      ]
    }
  ],
  "99115": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Taiwan"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Taoyuan International Airport"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "7 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "4G unlimited traffic",
        "5G unlimited traffic"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Telephone Gold TWD 100",
        "Telephone Gold TWD 50",
        "Telephone Gold TWD 150",
        "Telephone Gold TWD 430",
        "Telephone Gold TWD 200"
      ]
    }
  ],
  "99228": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Taiwan"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "7 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "5G unlimited traffic",
        "4G unlimited traffic"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Including TWD50 domestic and international call charges",
        "Including TWD100 domestic and international call charges",
        "Including TWD150 domestic and international call charges",
        "Including TWD430 domestic and international call charges",
        "Including TWD200 domestic and international call charges"
      ]
    }
  ],
  "100060": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "4 days",
        "5 days",
        "6 days",
        "7 days",
        "8 days",
        "9 days",
        "10 days",
        "12 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "600MB per day",
        "1GB per day",
        "Total 5GB",
        "Total 8GB",
        "Total 10GB",
        "Total 15GB",
        "Total 20GB",
        "Total 30GB",
        "Total 50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "101224": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "7 days",
        "10 days",
        "15 days",
        "30 days",
        "90 days",
        "180 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "500 MB",
        "1 GB",
        "2 GB",
        "3 GB",
        "5 GB",
        "10 GB",
        "20 GB",
        "50 GB",
        "100 GB",
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "101314": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "5 days",
        "8 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "5GB",
        "7GB",
        "10GB",
        "15GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "104831": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Unlimited",
        "Data per day"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days",
        "7 days",
        "5 days",
        "15 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "6GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only",
        "Calls included"
      ]
    }
  ],
  "104970": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "7 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "600 MB/Day",
        "1.5 GB/Day",
        "15 GB",
        "25 GB",
        "30 GB",
        "60 GB",
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "105381": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "4 days",
        "5 days",
        "6 days",
        "7 days",
        "8 days",
        "9 days",
        "10 days",
        "12 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "600 MB per day",
        "1GB per day",
        "5GB",
        "Total 8GB",
        "Total 10GB",
        "Total 15GB",
        "Total 30GB",
        "Total 20GB",
        "Total 50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "106414": [
    {
      "name": "Delivery type",
      "key": "wifi_mailing_type",
      "options": [
        "One-way delivery"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "4 days",
        "5 days",
        "6 days",
        "7 days",
        "8 days",
        "9 days",
        "10 days",
        "12 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "600MB per day",
        "1GB per day",
        "Total 5GB",
        "Total 8GB",
        "10GB",
        "Total 15GB",
        "Total 20GB",
        "Total 30GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "108009": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "7 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1 GB",
        "2 GB",
        "3 GB",
        "5 GB",
        "10 GB",
        "20 GB",
        "Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "108033": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "109352": [
    {
      "name": "Package type",
      "key": "default_spec",
      "options": [
        "Join Tour"
      ]
    }
  ],
  "109354": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "109371": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "109389": [
    {
      "name": "Package type",
      "key": "default_spec",
      "options": [
        "International Arrival",
        "International Departure"
      ]
    }
  ],
  "109393": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "109398": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "110438": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "117239": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Hong Kong"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Hong Kong International Airport self-pickup",
        "Local surface mail (shipping fee included)"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "7 days",
        "10 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "500MB of high-speed 4G traffic + unlimited low-speed traffic per day",
        "1GB of high-speed 4G data + unlimited low-speed data per day"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "117294": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day"
      ]
    },
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Phu Quoc"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "7 days",
        "10 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1.5GB",
        "3GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "121154": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "123902": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "124251": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "5 days",
        "6 days",
        "7 days",
        "8 days",
        "9 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "All you can eat",
        "500MB Daily",
        "10GB (Total)",
        "20GB (Total)"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "124642": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "4 days",
        "5 days",
        "6 days",
        "7 days",
        "10 days",
        "15 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "5GB per day"
      ]
    }
  ],
  "124754": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "3 days",
        "5 days",
        "6 days",
        "7 days",
        "8 days",
        "9 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "1GB per day",
        "2GB Daily",
        "3GB per day"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "124937": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "7 days",
        "8 days",
        "9 days",
        "10 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Total 15GB",
        "Total 50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "No calls included"
      ]
    }
  ],
  "124985": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "4 days",
        "5 days",
        "6 days",
        "7 days",
        "8 days",
        "9 days",
        "10 days",
        "15 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1GB per day",
        "2GB per day",
        "3GB per day",
        "Unlimited",
        "Total 5GB",
        "Total 10GB",
        "Total 20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "127209": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "5 days",
        "7 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1GB per day",
        "2GB per day",
        "Total 10GB",
        "Total 20GB",
        "Unlimited data"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "127210": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Taiwan"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Taoyuan International Airport",
        " Kaohsiung International Airport",
        "Taichung International Airport",
        "Chunghwa / Senao Telecom"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "7 days",
        "10 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "5G Unlimited"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        " Includes TWD50 credit for local and international calls",
        " Includes TWD100 credit for local and international calls",
        " Includes TWD200 credit for local and international calls",
        " Includes TWD150 credit for local and international calls"
      ]
    }
  ],
  "127464": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "5 days",
        "6 days",
        "7 days",
        "8 days",
        "9 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1GB per day",
        "2GB per day",
        "Unlimited Data"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "127552": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "7 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1GB per day",
        "2GB per day",
        "Total 10GB",
        "Total 20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "128253": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "4 days",
        "5 days",
        "6 days",
        "7 days",
        "10 days",
        "15 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1GB per day",
        "2GB per day",
        "Regular All You Can Eat",
        "High-speed data access (subject to fair usage policy)"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "128529": [
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "3 days",
        "5 days",
        "7 days",
        "10 days",
        "15 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1GB per day",
        "2GB per day",
        "Total 10GB",
        "Total 20GB",
        "Unlimited Data"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "128576": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "129292": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Hong Kong"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Hong Kong International Airport  self-pickup"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "5 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "5GB of high-speed 4G data",
        "【Flash Deal- 50% off】5GB high-speed 4G data"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data + Voice Minute"
      ]
    }
  ],
  "132216": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "132311": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "136247": [
    {
      "name": "Package type",
      "key": "default_spec",
      "options": [
        "Join-in Catamaran tour"
      ]
    }
  ],
  "147957": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "151203": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "152931": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "4 days",
        "5 days",
        "6 days",
        "7 days",
        "8 days",
        "9 days",
        "10 days",
        "15 days",
        "20 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "500MB",
        "1GB",
        "Unlimited",
        "3GB",
        "15GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "153169": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "158751": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "161040": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "161349": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "161735": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "163606": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "167984": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "14 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "100GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "168595": [
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "1.5GB",
        "4GB",
        "6GB",
        "8GB",
        "10GB",
        "12GB",
        "14GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "176809": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "10 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "500 GB",
        "700 GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "176945": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "177701": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "178003": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "178945": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "179184": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "179332": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "179545": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "180821": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "185177": [
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Hong Kong International Airport"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "10GB high-speed data",
        "25GB high-speed data",
        "15GB high-speed data"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "189287": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "191186": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "192076": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Hong Kong"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Hong Kong International Airport"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "3 days",
        "5 days",
        "7 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited high-speed data",
        "1GB of daily high-speed 4G data + unlimited low-speed data (128Kbps)",
        "Daily 2GB high-speed 4G data + unlimited low-speed data (128Kbps)"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "192090": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Hong Kong"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "7 days",
        "10 days",
        "6 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Daily high-speed 5G data 2GB + unlimited low-speed data(256Kbps)",
        "Daily high-speed 5G data 1GB + unlimited low-speed data(256Kbps)",
        "Unlimited Data High Speed"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "192314": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "192980": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "194011": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "195431": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "200593": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Hong Kong"
      ]
    },
    {
      "name": "Pick-up location",
      "key": "pickup_location",
      "options": [
        "Hong Kong International Airport"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "[Klook Exclusive] 8GB High-speed Data + extra 3GB free data",
        "[Klook Exclusive] 12GB High-speed Data + extra 3GB free data"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Included 60 Minutes of Calls"
      ]
    }
  ],
  "200610": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Hong Kong"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "10GB High-speed 5G Data + Unlimited Low-speed Data (128kbps) ",
        "20GB High-speed 5G Data + Unlimited Low-speed Data (128kbps)",
        "30GB High-speed 5G Data + Unlimited Low-speed Data (128kbps)",
        "20GB High-speed Data",
        "50GB High-speed Data",
        "100GB High-speed Data"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "[Klook Exclusive] Included 30-minute call + 200 SMS messages",
        "Data only"
      ]
    }
  ],
  "200611": [
    {
      "name": "Pick up from",
      "key": "wifi_pickup_city",
      "options": [
        "Hong Kong"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "20GB of high-speed data"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "[Klook Exclusive] Includes 15 minutes of call time + 50 text messages"
      ]
    }
  ],
  "203028": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "203218": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "204745": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "205006": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "207134": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214971": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB",
        "3GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214973": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB",
        "3GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214977": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214979": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB",
        "3GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214987": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB",
        "3GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214988": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB",
        "3GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214990": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214991": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214992": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214993": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214995": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB",
        "3GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214996": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB",
        "3GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "214998": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB",
        "3GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215000": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215001": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215027": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215029": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215032": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215034": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215036": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "5GB",
        "10GB",
        "20GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215043": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215049": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215060": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215094": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215096": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215139": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215143": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215144": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215147": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215152": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215153": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215154": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215157": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215158": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215159": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215164": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215166": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215168": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215177": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215184": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ],
  "215188": [
    {
      "name": "Package type",
      "key": "esim_package_type",
      "options": [
        "Data per day",
        "Data in total"
      ]
    },
    {
      "name": "SIM card validity",
      "key": "card_duration",
      "options": [
        "1 day",
        "2 days",
        "3 days",
        "5 days",
        "7 days",
        "8 days",
        "10 days",
        "15 days",
        "30 days"
      ]
    },
    {
      "name": "Data package",
      "key": "data_package",
      "options": [
        "Unlimited",
        "500MB",
        "1GB",
        "3GB",
        "5GB",
        "10GB",
        "20GB",
        "50GB"
      ]
    },
    {
      "name": "Service type",
      "key": "card_type",
      "options": [
        "Data only"
      ]
    }
  ]
};

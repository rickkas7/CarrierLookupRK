

#include "CarrierLookupRK.h"

#include "Carriers.h"


String lookupCountry(uint16_t requestedMcc) {
	/*
	const uint8_t countryMap[3120] = {
	0, 202, // 202
	71, 114, 101, 101, 99, 101, 0, 0, // Greece
	0, 204, // 204
	78, 101, 116, 104, 101, 114, 108, 97, 110, 100, 115, 0, // Netherlands
	*/
	const uint8_t *p = countryMap;
	const uint8_t *end = &countryMap[sizeof(countryMap)];

	while(p < end) {
		int mcc = (p[0] << 8) | p[1];
		p += 2;

		if (mcc == 0) {
			break;
		}
		if (mcc == requestedMcc) {
			// Log.info("found mcc=%d country=%s", mcc, p);
			return String((const char *)p);
		}

		// Log.info("mcc=%d country=%s", mcc, p);

		p += strlen((const char *)p) + 1;
	}
	return String::format("Country %03d", requestedMcc);
}

String lookupMccMnc(uint16_t requestedMcc, uint16_t requestedMnc) {
	/*
	const uint8_t carrierMap[24004] = {
	129, 33, 0, 88, // 289088
	1, 33, 0, 68, // 289068
	65, 45, 77, 111, 98, 105, 108, 101, 0, // A-Mobile
	1, 33, 0, 67, // 289067
	65, 113, 117, 97, 102, 111, 110, 0, // Aquafon
	*/
	const uint8_t *p = carrierMap;
	const uint8_t *end = &carrierMap[sizeof(carrierMap)];

    bool done = false;

	while(p < end) {
		bool found = false;

		while(true) {
			bool more = (p[0] & 0x80) != 0;

			int mcc = ((p[0] & 0x7f) << 8) | p[1];
			p += 2;

			int mnc = (p[0] << 8) | p[1];
			p += 2;

			//Log.info("mcc=%d mnc=%d more=%d", mcc, mnc, more);

			if (mcc == 0) {
				done = true;
                break;
			}

			if ((requestedMcc == mcc) && (requestedMnc == mnc)) {
				found = true;
			}

			if (!more) {
				break;
			}
		} 

        if (done) {
            break;
        }

		if (found) {
			return String((const char *)p);
		}	
		//Log.info("carrier=%s", (const char *)p);

		p += strlen((const char *)p) + 1;
	}

	return String::format("Carrier %03d %03d", requestedMcc, requestedMnc);
}



#include "CarrierLookupRK.h"

SYSTEM_THREAD(ENABLED);
SYSTEM_MODE(MANUAL);

SerialLogHandler logHandler;


void setup() {

}

void loop() {
	Log.info("310=%s", lookupCountry(310).c_str()); // United States

	Log.info("901=%s", lookupCountry(901).c_str()); // International Networks

	Log.info("310 410=%s", lookupMccMnc(310, 410).c_str()); // AT&T Wireless Inc.

	Log.info("734 002=%s", lookupMccMnc(734, 002).c_str()); // DigiTel C.A.

	delay(10000);
}

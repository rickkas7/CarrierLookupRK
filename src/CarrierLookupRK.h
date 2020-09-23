#ifndef __CARRIERLOOKUP_H
#define __CARRIERLOOKUP_H

#include "Particle.h"

String lookupCountry(uint16_t mcc);
String lookupMccMnc(uint16_t mcc, uint16_t mnc);

#endif /* __CARRIERLOOKUP_H */

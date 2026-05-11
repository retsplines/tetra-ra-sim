# [TETRA Random Access Simulator](https://tetra-ra-sim.projects.foxdog.blog/)

Weekend Vue project to play around with the TETRA Random Access Protocol parameters.

For more information about the procedures/protocol, see [ETSI EN 300 392-2](https://www.etsi.org/deliver/etsi_en/300300_300399/30039202/03.08.01_60/en_30039202v030801p.pdf) §23.5.1.

It's hosted on GitHub Pages [here](https://tetra-ra-sim.projects.foxdog.blog/).

## Caveats

* Ignores the implications of PDU priority. This includes ignoring the PDU priority for MS Access Code binding.
* An MS may only have one usable Access Code at once (there is no consideration made for Subscriber Class).
* Ignores the implication of grant/reservations.
* Ignores various timers & counters that limit the longevity of access attempts (except WT & Nu).
* Various other limitations - this is really just for playing/understanding the basic behaviour of the protocol, not testing detailed specific scenarios.

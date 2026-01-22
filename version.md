# Version History

## [0.2.0] - 2026-01-22
### Changed
- Refactored logging mechanism to consolidate telemetry into the `logs/` directory.
- Updated log formats to `.jsonl` for both disk and battery data.
- Improved battery telemetry collection on Windows using multiple sources (WMI, powercfg, psutil).

## [0.1.0] - 2026-01-06
### Added
- Initial implementation of Battery and Disk Analytics agent.
- Basic disk usage and I/O collection.
- Local dump mechanism for telemetry data.

# Battery and Disk Analytics Agent

A lightweight telemetry collection agent for monitoring battery health and disk performance on Windows systems.

## Features

- **Battery Telemetry**: Comprehensive collection of battery status, capacity, cycle count, and temperature using:
  - Windows WMI (Root\WMI)
  - `powercfg /batteryreport` parsing
  - `psutil` sensor data
  - Native Windows `GetSystemPowerStatus` API
- **Disk Analytics**: Detailed monitoring of disk usage and performance:
  - Disk space usage for specific mounts.
  - Disk I/O throughput (read/write bytes and counts).
  - Individual process write deltas to identify heavy-write applications.
- **Efficient Logging**: Streams data to `.jsonl` files in a consolidated `logs/` directory for easy parsing and analysis.
- **Configurable**: Adjustable polling intervals and log locations.

## Project Structure

```text
Battery-and-Disk-Analytics/
├── battery_and_disk_agent/
│   ├── collector/          # Telemetry collection modules
│   ├── sender/             # Data output handlers (local dump)
│   ├── logs/               # Consolidated telemetry logs
│   ├── main.py             # Agent entry point
│   └── config.py           # Configuration settings
├── README.md
└── version.md
```

## Setup and Usage

### Prerequisites

- Python 3.8+
- Windows OS (for full battery telemetry support)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Battery-and-Disk-Analytics
   ```

2. Install dependencies:
   ```bash
   pip install -r battery_and_disk_agent/requirements.txt
   ```

### Running the Agent

Start the agent by running the `main.py` script:

```bash
python battery_and_disk_agent/main.py
```

The agent will begin collecting telemetry at the interval specified in `config.py` (default: 30 seconds) and save logs to `battery_and_disk_agent/logs/`.

## Configuration

Edit `battery_and_disk_agent/config.py` to change:
- `POLL_INTERVAL`: Frequency of data collection (in seconds).
- `DISK_MOUNT`: The drive to monitor (e.g., `"C:\\"`).
- `DEVICE_ID`: Unique identifier for the reporting device.
- `DISK_LOG_PATH` & `BATTERY_LOG_PATH`: Destination for log files.

## License

MIT
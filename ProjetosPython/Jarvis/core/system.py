import time
import os
try:
    import psutil
except ImportError:
    psutil = None

class SystemStats:
    def __init__(self):
        self.start_time = time.time()

    def get_stats(self):
        if psutil:
            cpu_percent = psutil.cpu_percent(interval=None)
            ram = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            ram_used_gb = round(ram.used / (1024 ** 3), 1)
            ram_total_gb = round(ram.total / (1024 ** 3), 1)
            ram_percent = ram.percent
            
            disk_used_gb = round(disk.used / (1024 ** 3), 1)
            disk_total_gb = round(disk.total / (1024 ** 3), 1)
            disk_percent = disk.percent
        else:
            cpu_percent = 0.0
            ram_used_gb = 0.0
            ram_total_gb = 16.0
            ram_percent = 0.0
            disk_used_gb = 0.0
            disk_total_gb = 500.0
            disk_percent = 0.0

        uptime_seconds = int(time.time() - self.start_time)
        hours = uptime_seconds // 3600
        minutes = (uptime_seconds % 3600) // 60
        seconds = uptime_seconds % 60
        uptime_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"

        return {
            "cpu_percent": cpu_percent,
            "ram_used_gb": ram_used_gb,
            "ram_total_gb": ram_total_gb,
            "ram_percent": ram_percent,
            "disk_used_gb": disk_used_gb,
            "disk_total_gb": disk_total_gb,
            "disk_percent": disk_percent,
            "uptime": uptime_str,
            "uptime_seconds": uptime_seconds
        }

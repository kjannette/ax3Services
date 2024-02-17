import sys
import time
import logging
from splitPdf import SplitPdf
from watchdog.observers import Observer
from pathlib import Path

# from watchdog.events import LoggingEventHandler
from watchdog.events import PatternMatchingEventHandler

watch_dir = f"{Path(__file__).parents[1]}/Documents/Uploads"

if __name__ == "__main__":
    sp = SplitPdf()

    def on_created(event):
        print(f"Event: {event.src_path} was created.")
        path = str(event.src_path).split("/")
        print(">>>>>>>>>>>>>>>path", path[-1].split(".")[0])
        newDir = path[-1].split(".")[0]
        sp.make_dir(newDir)
        sp.split_and_convert(event.src_path, newDir)

    patterns = ["*"]
    ignore_patterns = None
    ignore_directories = False
    case_sensitive = True
    path = watch_dir
    my_event_handler = PatternMatchingEventHandler(
        patterns, ignore_patterns, ignore_directories, case_sensitive
    )
    my_event_handler.on_created = on_created
    observer = Observer()
    observer.schedule(my_event_handler, path, recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    finally:
        observer.stop()
        observer.join()

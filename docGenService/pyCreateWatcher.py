import sys
import time
import logging
from ax3Services.docGenService.GenerateDocument import GenerateBody
from watchdog.observers import Observer

# from watchdog.events import LoggingEventHandler
from watchdog.events import PatternMatchingEventHandler

bodygen = GenerateBody()

if __name__ == "__main__":

    def on_created(event):
        print(f"Event: {event.src_path} was created.")
        path = str(event.src_path).split("/")
        print(">>>>>>>>>>>>>>>>>>>>>>>path", path[-1].split(".")[0])
        docId = str(path[-1].split(".")[0])
        bodygen.generate(docId)

    patterns = ["*"]
    ignore_patterns = None
    ignore_directories = False
    case_sensitive = True
    #path = "/var/www/ax3Services/docGenService/Docxinfo"
    path = "/Users/kjannette/workspace/ax3/ax3Services/docGenService/Docxinfo"
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

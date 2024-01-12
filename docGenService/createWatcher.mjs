import * as fs from "fs";
import * as sleep from "system-sleep";
import createFormattedContent from "./responseHeaderGenerator.mjs";

const directory = "/Users/kjannette/workspace/agentxa2new/Backend/Doctemp";

async function watchOnce() {
  const watcher = fs.watch(directory, (event, file) => {
    const path = `/Users/kjannette/workspace/agentxa2new/Backend/Doctemp/${file}`;
    createFormattedContent(path);
    watcher.close();
    // Relaunch watcher after 1 second
    sleep(1000);
    watchOnce();
  });
}

watchOnce();

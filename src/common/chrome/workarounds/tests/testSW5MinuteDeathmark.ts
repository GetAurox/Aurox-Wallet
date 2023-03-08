import orderBy from "lodash/orderBy";
import last from "lodash/last";
import moment from "moment";

import { addBroadcastListener, broadcast, registerQueryResponder, sendQuery } from "common/messaging";
import { getValidTabIds } from "common/chrome/tabs";

interface SWPayload {
  startTimeMs: number;
  timeAliveMs: number;
}

interface SWSession {
  lastSuccessfulPingMs: number;
  successfulEchoes: number;
  carriedEchoes: number;
  failedEchoes: number;
  startTimeMs: number;
  timeAliveMs: number;
}

export function setupServiceWorkerHook() {
  const start = Date.now();

  setInterval(async () => {
    const tabIds = await getValidTabIds();

    broadcast<SWPayload>("service_worker_ping", { tabIds }, { startTimeMs: start, timeAliveMs: Date.now() - start });
  }, 100);

  registerQueryResponder<null, SWPayload>("service_worker_echo", [["content-script", "all"]], async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return { startTimeMs: start, timeAliveMs: Date.now() - start };
  });
}

export function setupContentScriptHook() {
  const div = document.createElement("div");

  div.style.fontSize = "26px";
  div.style.backgroundColor = "black";
  div.style.color = "white";
  div.style.padding = "16px";
  div.style.whiteSpace = "pre";
  div.style.position = "fixed";
  div.style.top = "0";
  div.style.left = "0";
  div.style.right = "0";
  div.style.zIndex = "10000000";

  setTimeout(() => {
    document.body.appendChild(div);
  });

  const swSessions = new Map<number, SWSession>();

  const getOrCreateSession = (startTimeMs: number) => {
    let currentSession = swSessions.get(startTimeMs);

    if (!currentSession) {
      currentSession = { startTimeMs, successfulEchoes: 0, carriedEchoes: 0, failedEchoes: 0, timeAliveMs: 0, lastSuccessfulPingMs: 0 };

      swSessions.set(startTimeMs, currentSession);
    }

    return currentSession;
  };

  const getLastSession = () => {
    return last(orderBy([...swSessions.values()], ({ startTimeMs }) => startTimeMs)) ?? null;
  };

  const render = () => {
    // order in descending to get the lastSession as head (rest element can't come first)
    const [lastSession, ...oldSessions] = orderBy([...swSessions.values()], ({ startTimeMs }) => startTimeMs, "desc");

    if (!lastSession) return;

    // reverse the old sessions to get the sessions in ascending order
    oldSessions.reverse();

    const oldSessionTexts = [];

    for (const [index, { timeAliveMs, startTimeMs, successfulEchoes, carriedEchoes, failedEchoes }] of oldSessions.entries()) {
      const startText = `started at ${moment(startTimeMs).format("hh:mm:ss")}`;
      const aliveForText = `was alive for ${(timeAliveMs / 1000).toFixed(3)} seconds`;
      const echoesText = `with echoes=(successful=${successfulEchoes}, failed=${failedEchoes}, carried=${carriedEchoes})`;

      oldSessionTexts.push(`Session #${index + 1} ${startText} ${aliveForText} ${echoesText}`);
    }

    let output = oldSessionTexts.join("\n");

    if (oldSessionTexts.length > 0) {
      output += "\n\n";
    }

    output += "Current Service Worker:";
    output += `\n\tAlive for: ${(lastSession.timeAliveMs / 1000).toFixed(3)} seconds`;
    output += `\n\tLast Successful Ping: ${((Date.now() - lastSession.lastSuccessfulPingMs) / 1000).toFixed(3)} seconds ago`;
    output += `\n\tEchoes: Successful=${lastSession.successfulEchoes} Failed=${lastSession.failedEchoes} Carried=${lastSession.carriedEchoes}`;

    div.innerText = output;
  };

  // Render the text periodically to update relative times
  setInterval(render, 300);

  setInterval(async () => {
    const sessionQuerySentFor = getLastSession();

    if (!sessionQuerySentFor) {
      return;
    }

    try {
      const { startTimeMs, timeAliveMs } = await sendQuery<null, SWPayload>("service_worker_echo", "internal", null, { timeout: 3000 });

      const respondingSessionIsSameAsQueryTimeSession = startTimeMs === sessionQuerySentFor.startTimeMs;

      const respondingSession = respondingSessionIsSameAsQueryTimeSession ? sessionQuerySentFor : getOrCreateSession(startTimeMs);

      respondingSession.lastSuccessfulPingMs = Date.now();
      respondingSession.timeAliveMs = timeAliveMs;

      if (respondingSessionIsSameAsQueryTimeSession) {
        respondingSession.successfulEchoes++;
      } else {
        respondingSession.carriedEchoes++;
      }
    } catch (error) {
      console.error(error);

      sessionQuerySentFor.failedEchoes++;
    }

    render();
  }, 500);

  addBroadcastListener<SWPayload>("service_worker_ping", [["redacted"]], ({ data: { startTimeMs, timeAliveMs } }) => {
    const currentSession = getOrCreateSession(startTimeMs);

    currentSession.lastSuccessfulPingMs = Date.now();
    currentSession.timeAliveMs = timeAliveMs;

    render();
  });
}

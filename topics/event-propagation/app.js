const outer = document.querySelector("#outer");
const middle = document.querySelector("#middle");
const inner = document.querySelector("#inner");
const shouldStopAtMiddle = document.querySelector("#stop-at-middle");
const eventLog = document.querySelector("#event-log");

function describe(element) {
    return element.id ? `#${element.id}` : element.tagName.toLowerCase();
}

function addLog(message) {
    const item = document.createElement("li");
    item.textContent = message;
    eventLog.append(item);
}

function logEvent(ev, phase) {
    addLog(
        `${describe(ev.currentTarget)}: ${phase} (target: ${describe(ev.target)}, currentTarget: ${describe(ev.currentTarget)})`
    );
}

outer.addEventListener("click", (ev) => {
    eventLog.replaceChildren();
    logEvent(ev, "capture");
}, true);
middle.addEventListener("click", (ev) => logEvent(ev, "capture"), true);
inner.addEventListener("click", (ev) => logEvent(ev, "target (capture listener)"), true);

inner.addEventListener("click", (ev) => logEvent(ev, "target (bubble listener)"));
middle.addEventListener("click", (ev) => {
    logEvent(ev, "bubble");
    if (shouldStopAtMiddle.checked) {
        ev.stopPropagation();
        addLog("Called stopPropagation() here; the event will not reach #outer: bubble.");
    }
});
outer.addEventListener("click", (ev) => logEvent(ev, "bubble"));

document.querySelector("#clear-log").addEventListener("click", () => {
    eventLog.replaceChildren();
});


const parent = document.querySelector(".parent")
const child = document.querySelector(".child")
const button = document.querySelector(".button")

parent.addEventListener("click", ()=> console.log("parent"), true)
child.addEventListener("click", ()=> console.log("child"),)
button.addEventListener("click", ()=> console.log("button"))
parent.addEventListener("click", ()=> console.log("parent"), )

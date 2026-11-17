const { Component, mount, xml, signal, onMounted, onPatched } = owl;

// Real-life scenario: a hotel booking planner (exactly like the Odoo Gantt view).
// 40 rooms x 31 days = 1240 clickable cells.
const ROOMS = Array.from({ length: 40 }, (_, i) => `Room ${101 + i}`);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

class App extends Component {
    static template = xml`
        <div>
            <h2>Hotel planner: normal vs synthetic click</h2>

            <div class="toolbar">
                <button t-att-class="{ active: this.mode() === 'normal' }"
                        t-on-click="() => this.switchMode('normal')">t-on-click (normal)</button>
                <button t-att-class="{ active: this.mode() === 'synthetic' }"
                        t-on-click="() => this.switchMode('synthetic')">t-on-click.synthetic</button>
            </div>

            <div class="stats">
                <div>Mode: <b t-out="this.mode()"/></div>
                <div>Real click listeners on cells: <b t-out="this.listenerCount()"/> (for <t t-out="this.ROOMS.length * this.DAYS.length"/> cells)</div>
                <div>Render time: <b t-out="this.renderTime()"/> ms</div>
                <div>Selected: <b t-out="this.selectedLabel()"/></div>
                <div>ev.currentTarget in handler: <b t-out="this.currentTargetInfo()"/></div>
            </div>

            <div class="grid" t-attf-style="grid-template-columns: 70px repeat({{ this.DAYS.length }}, 18px)">
                <t t-foreach="this.ROOMS" t-as="room" t-key="room">
                    <div class="label" t-out="room"/>
                    <t t-foreach="this.DAYS" t-as="day" t-key="day">
                        <!-- Same handler, only the modifier differs -->
                        <div t-if="this.mode() === 'normal'"
                             class="cell"
                             t-att-class="{ selected: this.isSelected(room, day) }"
                             t-on-click="(ev) => this.onCellClick(ev, room, day)"/>
                        <div t-else=""
                             class="cell"
                             t-att-class="{ selected: this.isSelected(room, day) }"
                             t-on-click.synthetic="(ev) => this.onCellClick(ev, room, day)"/>
                    </t>
                </t>
            </div>

            <!-- Gotcha: a parent that stops propagation with a NORMAL listener -->
            <div class="trap" t-on-click="(ev) => ev.stopPropagation()">
                <p>This box calls <code>ev.stopPropagation()</code> (normal listener).</p>
                <button t-on-click="() => this.log('normal button: fired ✅')">Normal button</button>
                <button t-on-click.synthetic="() => this.log('synthetic button: fired ✅')">Synthetic button</button>
                <p>Last log: <b t-out="this.lastLog()"/></p>
            </div>
        </div>
    `;

    ROOMS = ROOMS;
    DAYS = DAYS;
    mode = signal("normal");
    selected = signal(null); // { room, day }
    listenerCount = signal(0);
    renderTime = signal(0);
    currentTargetInfo = signal("-");
    lastLog = signal("(nothing yet)");

    setup() {
        let start = performance.now();
        const measure = () => {
            this.listenerCount.set(window.countCellListeners());
            this.renderTime.set((performance.now() - start).toFixed(1));
        };
        onMounted(measure);
        onPatched(() => {
            // only re-measure after a mode switch, not after every click
            if (this._switching) {
                this._switching = false;
                measure();
            }
        });
        this.markStart = () => (start = performance.now());
    }

    switchMode(mode) {
        if (mode === this.mode()) return;
        this._switching = true;
        this.markStart();
        this.mode.set(mode);
    }

    onCellClick(ev, room, day) {
        this.selected.set({ room, day });
        const ct = ev.currentTarget;
        this.currentTargetInfo.set(
            ct === document ? "#document  (listener lives on document!)" : `<div class="${ct.className}">`
        );
    }

    isSelected(room, day) {
        const s = this.selected();
        return !!s && s.room === room && s.day === day;
    }

    selectedLabel() {
        const s = this.selected();
        return s ? `${s.room}, day ${s.day}` : "-";
    }

    log(msg) {
        this.lastLog.set(msg);
    }
}

mount(App, document.body);

const { Component, mount, xml, signal, onMounted, onPatched } = owl;

// Real-life scenario: hotel planner with a "crosshair": when you hover a cell,
// its room label and its day header get highlighted (like Gantt/calendar views).
const ROOMS = Array.from({ length: 40 }, (_, i) => `Room ${101 + i}`);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

class App extends Component {
    static template = xml`
        <div>
            <h2>Hover on 1240 cells: per-cell listeners vs one listener</h2>

            <div class="toolbar">
                <button t-att-class="{ active: this.mode() === 'perCell' }"
                        t-on-click="() => this.mode.set('perCell')">mouseenter/mouseleave on every cell</button>
                <button t-att-class="{ active: this.mode() === 'delegated' }"
                        t-on-click="() => this.mode.set('delegated')">one pointermove on the grid (Gantt way)</button>
            </div>

            <div class="stats">
                <div>Real mouse/pointer listeners inside the grid: <b t-out="this.listenerCount()"/></div>
                <div>Hovered: <b t-out="this.hoveredLabel()"/></div>
            </div>

            <!-- Delegated mode: the listeners are on the grid only -->
            <div t-if="this.mode() === 'delegated'"
                 class="grid" t-att-style="this.gridStyle"
                 t-on-pointermove="this.onGridPointerMove"
                 t-on-pointerleave="() => this.hovered.set(null)">
                <t t-call="hotel_grid"/>
            </div>

            <!-- Per-cell mode: every cell gets its own 2 listeners -->
            <div t-else="" class="grid" t-att-style="this.gridStyle">
                <t t-call="hotel_grid"/>
            </div>
        </div>
    `;

    ROOMS = ROOMS;
    DAYS = DAYS;
    gridStyle = `grid-template-columns: 70px repeat(${DAYS.length}, 18px)`;
    mode = signal("perCell");
    hovered = signal(null); // { room, day } or null
    listenerCount = signal(0);

    setup() {
        const measure = () => {
            const n = window.countGridHoverListeners();
            if (n !== this.listenerCount()) this.listenerCount.set(n);
        };
        onMounted(measure);
        onPatched(measure);
    }

    // ---- Delegated way: ONE handler for the whole grid ----------------------
    onGridPointerMove(ev) {
        // ev.target is whatever is under the mouse; find the cell it belongs to
        const cell = ev.target.closest(".cell");
        const next = cell ? { room: cell.dataset.room, day: Number(cell.dataset.day) } : null;
        // pointermove fires MANY times per second: only update when the cell changes
        const cur = this.hovered();
        if (cur?.room !== next?.room || cur?.day !== next?.day) {
            this.hovered.set(next);
        }
    }

    // ---- Per-cell way: a handler pair on each cell ---------------------------
    onCellEnter(room, day) {
        this.hovered.set({ room, day });
    }
    onCellLeave() {
        this.hovered.set(null);
    }

    hoveredLabel() {
        const h = this.hovered();
        return h ? `${h.room}, day ${h.day}` : "-";
    }
}

// Shared grid markup. data-room / data-day let the delegated handler know
// which cell was hovered, since it only receives the DOM element.
const gridTemplate = `
    <div class="head"/>
    <div t-foreach="this.DAYS" t-as="day" t-key="day"
         class="head" t-att-class="{ hot: this.hovered()?.day === day }" t-out="day"/>
    <t t-foreach="this.ROOMS" t-as="room" t-key="room">
        <div class="label" t-att-class="{ hot: this.hovered()?.room === room }" t-out="room"/>
        <t t-foreach="this.DAYS" t-as="day" t-key="day">
            <div t-if="this.mode() === 'perCell'" class="cell"
                 t-on-mouseenter="() => this.onCellEnter(room, day)"
                 t-on-mouseleave="() => this.onCellLeave()"/>
            <div t-else="" class="cell" t-att-data-room="room" t-att-data-day="day"/>
        </t>
    </t>
`;

mount(App, document.body, { templates: `<templates><t t-name="hotel_grid">${gridTemplate}</t></templates>` });

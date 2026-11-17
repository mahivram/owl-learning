const { Component, mount, xml, signal, Resource,  computed } = owl;

class App extends Component {
    static template = xml`
        <div>
            <h1>this is owl 3.0 🚀</h1>
            <t t-foreach="this.items()" t-as="item" t-key="item_index">
                <p t-ref="this.Pref">here is ur item : <t t-out="item"/> </p>
            </t>
            <button t-on-click="this.changeWarn">Change Warning</button>
            <h3 t-out="this.warning()"></h3>
            <h3 t-out="this.multiplySignal2()"></h3>
            <div
                t-foreach="this.items()"
                t-as="item"
                t-key="item_index"
            >
            <!-- <div> -->
                <t t-out="item"/>
            <!-- </div> -->
            </div>
        </div>
    `;

    items = signal.Array([1,2,3,4])
    Pref = signal.ref();
    s2 = signal(2)
    s3 = signal(4)
    isWarn = signal(false)
    multiplySignal = computed(()=>this.s2() * this.s3())
    multiplySignal2 = computed(()=>{
        console.log("ran the computed");
        return this.items()[3] * this.s3()
    })
    warning = computed(()=>this.isWarn() ? "There is warning" : "No warning" )
    valComputed = computed((val)=> console.log("comkputed log val = ", val))
    // paragraphs = new Resource({ name: "paragraphs" });

    setup() {
        this.changeWarn("mahiv")
        this.changeWarn([22,34.2], 232)

    }

    /**
     *
     * @param {string} name
     * @return string
     */
    changeWarn(name){
        console.log(name);
        this.isWarn() ? this.isWarn.set(false) : this.isWarn.set(true)
        this.items()[2] === 33 ? this.items()[2] = 67 : this.items()[2] = 33
        // document.body.querySelectorAll("p")[2].textContent = "The third paragraph was changed";
    }

    // get warning(){
    //     return this.isWarn() ? "There is warning" : "No warning"
    // }
}

mount(App, document.body);

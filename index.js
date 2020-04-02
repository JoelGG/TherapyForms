class Form {
    constructor(stage, content) {
        this.stage = stage;
        if (content.sections != null) {
            this.content = content;
        } else {
            throw new console.error("incorrect content passed to form object");
        }

        this.entriesStage = document.createElement("div");
        this.entriesStage.setAttribute("div","entriesStage")
        stage.appendChild(this.entriesStage);

        this.inputStage = document.createElement("div");
        this.inputStage.setAttribute("div","inputStage")
        stage.appendChild(this.inputStage);

        this.loadEntries();
        this.createControls();
    }

    createControls() {
        //this is bound for cleardata so that "this" referes to the Form instance and not the button when clearData is called
        let save = this.buttonFactory("save", this.saveEntries);
        let clear = this.buttonFactory("clear", this.clearData.bind(this));
        let n = this.buttonFactory("new", this.newEntry.bind(this));
        let download = this.buttonFactory("download", this.downloadPDF.bind(this));
        this.inputStage.appendChild(save);
        this.inputStage.appendChild(clear);
        this.inputStage.appendChild(n);
        this.inputStage.appendChild(download);
    }

    buttonFactory(value, func) {
        let b = document.createElement("input");
        b.setAttribute("type", "button");
        b.value = value;
        b.onclick = func;

        return b;
    }

    renderEntry(entryIndex,entryData) {
        //creates the entry container for this specific diary entry 
        let entry = document.createElement("div");
        entry.setAttribute("id", "entry_" + entryIndex);
        entry.setAttribute("class", "entry");


        //loops over every question in the entry
        for (let i = 0; i < this.content.sections.length; i++) {
            //creates the section element, question, and answer objects
            const element = this.content.sections[i];
            const question = element.question;
            const answer = element.answer;


            //creates the segment div and sets the id to index_ + %index%
            let segment = document.createElement("div");
            segment.setAttribute("id", "index_" + i);
            segment.setAttribute("class", "segment")

            //the title element asks the question of the user
            let title = document.createElement("p");
            title.setAttribute("class", "question");
            title.innerHTML = question.text;

            //appends the question to the segment
            segment.appendChild(title);

            //instaitiates the input node
            let input;

            switch (answer.type) {
                case "date":
                    input = document.createElement("input");
                    input.setAttribute("type", "date");
                    input.setAttribute("placeholder", "Today's date");
                    break;
                case "time":
                    input = document.createElement("input");
                    input.setAttribute("type", "time");
                    input.setAttribute("placeholder", "Time now");
                    break;
                case "textbox":
                    input = document.createElement("textarea");
                    input.setAttribute("placeholder", answer.default);
                    break;
                case "dropdown":
                    input = this.constructDropdown(answer);
                    break;
                default:
                    input = document.createElement("div");
                    break;
            }

            if (entryData[i] !== undefined) {
                input.value = entryData[i];
            }

            input.setAttribute("class", "entryField");

            segment.appendChild(input);

            //appends the segment to the overall stage
            entry.appendChild(segment);
        }

        this.entriesStage.appendChild(entry);
    }

    loadEntries() {
        let data = JSON.parse(localStorage.getItem("Activity Scores"));
        if (data !== null) {
            for (let i = 0; i < data.length; i++) {
                this.renderEntry(i,data[i]);
            }
        } else {
            this.renderEntry(0,[]);
        }
    }

    newEntry() {
        let numOfEntries = [...(this.entriesStage.children)].filter(x => x.classList.contains("entry")).length;
        this.renderEntry(numOfEntries,[]);
    }

    saveEntries() {
        //array of data to be exported to json
        let data = [];

        //node of all diary entries
        let entries = document.getElementsByClassName("entry");

        //holds all the segments within an entry
        let segments = [];

        //iterate over every child in the stage
        for (let i = 0; i < entries.length; i++) {
            //segments contains every question answer combination
            segments = [...(entries[i].children)].filter(segment => segment.classList.contains("segment"));

            //appends a list of data to data variable
            data[i] = ([...segments].map(seg => [...seg.children].filter(x => x.classList.contains("entryField"))[0]).map(y => y.value));
        }
        localStorage.setItem("Activity Scores", JSON.stringify(data));
    }

    clearData() {
        localStorage.setItem("Activity Scores", null);
        this.entriesStage.innerHTML = '';
        this.renderEntry(0, []);
    }

    constructDropdown(e) {
        let x;

        if (e.type === "element") {
            //base case if the type of e is an element
            x = document.createElement("option");
            x.setAttribute("value", e.text);
            x.innerHTML = e.text;
        } else {
            //otherwise e will contain a delements array
            if (e.type === "egroup") {
                x = document.createElement("optgroup");
                x.setAttribute("label", e.text);
            } else if (e.type === "dropdown") {
                x = document.createElement("select");
            }
            for (let s = 0; s < e.delements.length; s++) {
                x.appendChild(this.constructDropdown(e.delements[s]));
            }
        }
        return x;
        
    }

    downloadPDF() {
        this.saveEntries();

        let data = JSON.parse(localStorage.getItem("Activity Scores"));
        console.log(data.length);

        let offset = 0;

        let doc = new jsPDF();

        for (let i = 0; i < data.length; i++) {
            doc.text(20, offset += 20, "Entry " + (i + 1));
            for (let j = 0; j < data[i].length; j++) {
                doc.text(20, offset += 10, this.content.sections[j].question.text);
                doc.text(20, offset += 10, data[i][j]);
            }
            if (offset > 150) {
                doc.addPage();
                offset = 10;
            }
        }
        doc.save("Download.pdf");
    }

}





let a = document.getElementById("forminsert");

let f = new Form(a, {
    type: "log",
    sections: [{
        question: {
            text: "What date did this happen?"
        },
        answer : {
            type: "date"
        }
    },
    {
        question: {
            text: "What time did this happen?"
        },
        answer: {
            type: "time"
        }
    },
    {
        question: {
            text: "Where are you? Who are you with? What is happening?"
        },
        answer: {
            type: "textbox",
            default: "Your answer..."
        }
    },
    {
        question: {
            text: "What is going through your mind?"
        },
        answer: {
            type: "textbox",
            default: "Your answer..."
        }
    },
    {
        question: {
            text: "What is the strongest emotion you can feel right now?"
        },
        answer: {
            type: "dropdown",
            delements: [
                {
                    type: "egroup",
                    text: "Anger and disgust",
                    delements: [
                        {
                            type: "element",
                            text: "Anger",
                            active: true
                        },
                        {
                            type: "element",
                            text: "Annoyance",
                            active: true
                        },
                        {
                            type: "element",
                            text: "Contempt",
                            active: true
                        },
                        {
                            type: "element",
                            text: "Disgust",
                            active: true
                        },
                        {
                            type: "element",
                            text: "Irritation",
                            active: true
                        },
                        {
                            type: "element",
                            text: "Jealousy",
                            active: true
                        }
                    ]
                },
                {
                    type: "egroup",
                    text: "Fear and anxiety",
                    delements: [
                        {
                            type: "element",
                            text: "Anxiety",
                            active: true
                        },
                        {
                            type: "element",
                            text: "Doubt",
                            active: true
                        },
                        {
                            type: "element",
                            text: "Fear",
                            active: true
                        },
                        {
                            type: "element",
                            text: "Helplessness",
                            active: true
                        },
                        {
                            type: "element",
                            text: "Powerlessness",
                            active: true
                        }
                    ]
                }
            ]
        }
    },
    {
        question: {
            text: "How strong is that feeling, where 1 = very weak and 10 = very strong?"
        },
        answer: {
            type: "dropdown",
            delements: [{
                type: "element",
                text: "1",
                active: true
            },{
                type: "element",
                text: "2",
                active: true
            },{
                type: "element",
                text: "3",
                active: true
            },{
                type: "element",
                text: "4",
                active: true
            },{
                type: "element",
                text: "5",
                active: true
            },{
                type: "element",
                text: "6",
                active: true
            },{
                type: "element",
                text: "7",
                active: true
            },{
                type: "element",
                text: "8",
                active: true
            },{
                type: "element",
                text: "9",
                active: true
            },{
                type: "element",
                text: "10",
                active: true
            }]
        }
    }]
});